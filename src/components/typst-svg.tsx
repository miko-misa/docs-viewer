import React, { useMemo } from "react";

type TypstSvgProps = React.SVGProps<SVGSVGElement> & {
  "data-typst-style"?: string;
};

export function TypstSvg({
  children,
  style,
  "data-typst-style": dataTypstStyle,
  ...rest
}: TypstSvgProps) {
  const parsedStyle = useMemo(() => parseStyle(dataTypstStyle), [dataTypstStyle]);

  const mergedStyle: React.CSSProperties | undefined = useMemo(() => {
    if (!style && !parsedStyle) {
      return undefined;
    }

    const base: React.CSSProperties = {};

    if (typeof style === "object" && style !== null) {
      Object.assign(base, style as React.CSSProperties);
    }

    if (parsedStyle) {
      Object.assign(base, parsedStyle);
    }

    return Object.keys(base).length > 0 ? base : undefined;
  }, [style, parsedStyle]);

  return (
    <svg {...rest} style={mergedStyle}>
      {children}
    </svg>
  );
}

function parseStyle(style: string | undefined): React.CSSProperties | undefined {
  if (!style) return undefined;

  const entries = style
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const [rawKey, ...rawValue] = declaration.split(":");
      if (!rawKey || rawValue.length === 0) {
        return null;
      }
      const key = rawKey.trim();
      const value = rawValue.join(":").trim();
      if (!key || !value) {
        return null;
      }
      return [cssPropToCamelCase(key), value] as const;
    })
    .filter((entry): entry is [string, string] => entry !== null);

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries);
}

function cssPropToCamelCase(prop: string): string {
  return prop.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
