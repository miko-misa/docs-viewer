import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import { toText } from "hast-util-to-text";
import { NodeCompiler } from "@myriaddreamin/typst-ts-node-compiler";
import { visitParents, SKIP } from "unist-util-visit-parents";
import type { Element, ElementContent, Parent as HastParent, Root } from "hast";
import type { VFile } from "vfile";
import type { Plugin } from "unified";

export type RehypeTypstWithPrologOptions = {
  /**
   * Additional Typst code that is injected at the top of every
   * generated Typst document (both inline and display mode).
   * Use this to import packages such as curryst.
   */
  prolog?: string;
  /**
   * Custom colour for inline error fallback.
   * Mirrors the upstream rehype-typst option.
   */
  errorColor?: string;
};

type Settings = Readonly<RehypeTypstWithPrologOptions>;
type MatchesEntry = Parameters<Parameters<typeof visitParents>[2]>;

/**
 * Extended rehype-typst that injects a Typst prolog (e.g. package imports)
 * before compiling math fragments to SVG.
 */
export const rehypeTypstWithProlog: Plugin<[RehypeTypstWithPrologOptions?], Root> = (
  options,
) => {
  const settings: Settings = options ?? {};

  return async (tree: Root, file: VFile) => {
    const matches: MatchesEntry[] = [];

    visitParents(tree, "element", (...args) => {
      matches.push(args as MatchesEntry);
      return tree;
    });

    const processMatch = async (...args: MatchesEntry) => {
      const [element, parents] = args;
      const properties = element.properties || {};
      const className = properties.className ?? properties.class;
      const classes = Array.isArray(className)
        ? className
        : typeof className === "string"
          ? className.split(/\s+/).filter(Boolean)
          : [];
      const rawDirectiveExpression = typeof properties["data-typst-expression"] === "string"
        ? properties["data-typst-expression"].trim()
        : undefined;

      const languageMath = classes.includes("language-math");
      const mathDisplay = classes.includes("math-display");
      const mathInline = classes.includes("math-inline");

      const isProofTree = Boolean(rawDirectiveExpression);

      if (!languageMath && !mathDisplay && !mathInline && !isProofTree) {
        return;
      }

      let parent = parents.at(-1);
      let scope = element;

      if (isProofTree) {
        let expression = rawDirectiveExpression ?? "";
        expression = expression.replace(/,\s*$/, "");
        if (!expression.startsWith("prooftree(") && !expression.startsWith("proof-tree(")) {
          expression = `prooftree(${expression})`;
        }
        if (parent && Array.isArray((parent as HastParent).children)) {
          try {
            const result = await renderToSvgString(expression, true, settings.prolog);
            replaceWithResult(parent as HastParent, element, result, true);
          } catch (error) {
            file.message("Could not render prooftree", {
              ancestors: [...parents, element],
              cause: error instanceof Error ? error : new Error(String(error)),
              place: element.position,
              source: "rehype-typst",
            });
          }
        }
        return SKIP;
      }

      let displayMode = mathDisplay;

      const firstChild = element.children?.[0];
      if (
        firstChild &&
        typeof firstChild === "object" &&
        "tagName" in firstChild &&
        firstChild.tagName === "code"
      ) {
        scope = firstChild as typeof element;
      }

      if (
        element.tagName === "code" &&
        languageMath &&
        parent &&
        parent.type === "element" &&
        parent.tagName === "pre"
      ) {
        scope = parent;
        parent = parents.at(-2);
        displayMode = true;
      }

      if (!parent || !Array.isArray((parent as HastParent).children)) {
        return;
      }

      const value = toText(scope, { whitespace: "pre" });

      let result:
        | ElementContent[]
        | {
            svg: string;
            baselinePosition?: number;
          }
        | undefined;

      try {
        result = await renderToSvgString(value, displayMode, settings.prolog);
      } catch (error) {
        const cause = error instanceof Error ? error : new Error(String(error));
        file.message("Could not render math with typst", {
          ancestors: [...parents, element],
          cause,
          place: element.position,
          source: "rehype-typst",
        });

        result = [
          {
            type: "element",
            tagName: "span",
            properties: {
              className: ["typst-error"],
              style: `color:${settings.errorColor ?? "#cc0000"}`,
              title: String(error),
            },
            children: [{ type: "text", value }],
          },
        ];
      }

      if (parent && Array.isArray((parent as HastParent).children)) {
        replaceWithResult(parent as HastParent, scope, result, displayMode);
      }

      return SKIP;
    };

    await Promise.all(matches.map((args) => processMatch(...args)));
  };
};

let compilerInstance: NodeCompiler | undefined;

async function renderToSvgString(code: string, displayMode: boolean, prolog?: string) {
  const compiler = compilerInstance ?? (compilerInstance = NodeCompiler.create());
  const res = renderWithCompiler(compiler, code, displayMode, prolog);
  // prevent unbounded cache growth in long-running processes
  compiler.evictCache(10);
  return res;
}

async function renderWithCompiler(
  compiler: NodeCompiler,
  code: string,
  displayMode: boolean,
  prolog?: string,
) {
  const mainFileContent = displayMode
    ? buildDisplayTemplate(code, prolog)
    : buildInlineTemplate(code, prolog);
  const documentResult = compiler.compile({ mainFileContent });
  if (!documentResult.result) {
    const diagnostics = compiler.fetchDiagnostics(documentResult.takeDiagnostics());
    console.error(diagnostics);
    throw new Error("Typst compilation failed");
  }

  const doc = documentResult.result;
  const svg = compiler.svg(doc);
  const res: { svg: string; baselinePosition?: number } = { svg };
  if (!displayMode) {
    const query = compiler.query(doc, { selector: "<label>" }) as Array<{ value: string }>;
    if (Array.isArray(query) && query.length > 0 && typeof query[0]?.value === "string") {
      res.baselinePosition = parseFloat(query[0].value.slice(0, -2));
    }
  }

  return res;
}

function buildInlineTemplate(code: string, prolog?: string) {
  return `${formatProlog(prolog)}#set page(height: auto, width: auto, margin: 0pt)

#let s = state("t", (:))

#let pin(t) = context {
  let width = measure(line(length: here().position().y)).width
  s.update(it => it.insert(t, width) + it)
}

#show math.equation: it => {
  box(it, inset: (top: 0.5em, bottom: 0.5em))
}

$pin("l1")${code}$

#context [
  #metadata(s.final().at("l1")) <label>
]
`;
}

function buildDisplayTemplate(code: string, prolog?: string) {
  if (requiresMarkupRendering(code)) {
    const trimmed = code.trim();
    const markup = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    return `${formatProlog(prolog)}#set page(height: auto, width: auto, margin: 2pt)

${markup}
`;
  }

  return `${formatProlog(prolog)}#set page(height: auto, width: auto, margin: 0pt)

$ ${code} $
`;
}

function formatProlog(prolog?: string) {
  if (!prolog) return "";
  const trimmed = prolog.trim();
  return trimmed.length > 0 ? `${trimmed}\n\n` : "";
}

function requiresMarkupRendering(code: string): boolean {
  if (!code) return false;
  return /\bprooftree\s*\(/.test(code) || /\bproof-tree\s*\(/.test(code);
}

function replaceWithResult(
  parent: HastParent,
  target: Element,
  result:
    | ElementContent[]
    | {
        svg: string;
        baselinePosition?: number;
      }
    | undefined,
  displayMode: boolean,
) {
  if (!result) return;

  let replacement: ElementContent[] | undefined;
  if (Array.isArray(result)) {
    replacement = result;
  } else if ("svg" in result) {
    const root = fromHtmlIsomorphic(result.svg, { fragment: true });
    const svgElement = root.children[0] as unknown as {
      properties: Record<string, string>;
      classNames?: string[];
    };
    const defaultEm = 11;
    const height = parseFloat(svgElement.properties["dataHeight"]);
    const width = parseFloat(svgElement.properties["dataWidth"] ?? "0");
    const baselinePosition = result.baselinePosition ?? height;
    const shift = height - baselinePosition;
    const shiftEm = shift / defaultEm;
    svgElement.properties.style = `vertical-align: -${shiftEm}em;`;
    svgElement.properties.height = `${height / defaultEm}em`;
    svgElement.properties.width = `${width / defaultEm}em`;
    if (!svgElement.classNames) {
      svgElement.classNames = [];
    }
    if (displayMode) {
      svgElement.properties.style += "; display: block; margin: 0 auto;";
    } else {
      svgElement.classNames.push("typst-inline");
    }
    replacement = root.children as ElementContent[];
  }

  if (replacement && replacement.length > 0) {
    const index = parent.children.indexOf(target);
    parent.children.splice(index, 1, ...replacement);
  }
}
