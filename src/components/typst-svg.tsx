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

    // data-typst-style から復元したスタイルを先に適用
    if (parsedStyle) {
      Object.assign(base, parsedStyle);
    }

    // 明示的に渡されたstyleで上書き
    if (typeof style === "object" && style !== null) {
      Object.assign(base, style as React.CSSProperties);
    }

    return Object.keys(base).length > 0 ? base : undefined;
  }, [style, parsedStyle]);

  // fillとstrokeは明示的に指定されている場合のみ使用
  // propsから分離するが、undefinedの場合はデフォルト値を設定しない
  const { fill, stroke, ...svgProps } = rest;

  // fillとstrokeを条件付きで設定
  const fillProp = fill !== undefined ? fill : undefined;
  const strokeProp = stroke !== undefined ? stroke : undefined;

  return (
    <svg
      {...svgProps}
      {...(fillProp !== undefined && { fill: fillProp })}
      {...(strokeProp !== undefined && { stroke: strokeProp })}
      style={mergedStyle}
    >
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
