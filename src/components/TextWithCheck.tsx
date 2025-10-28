import { CheckIcon } from "./CheckIcon";
import type { ReactNode } from "react";

type TextWithCheckProps = {
  children?: ReactNode;
};

export function TextWithCheck({ children }: TextWithCheckProps) {
  if (typeof children !== "string") {
    return <>{children}</>;
  }

  // ✅を含むかチェック
  if (!children.includes("✅")) {
    return <>{children}</>;
  }

  // ✅で分割して、CheckIconに置き換える
  const parts = children.split("✅");
  const elements: ReactNode[] = [];

  parts.forEach((part, index) => {
    if (index > 0) {
      elements.push(<CheckIcon key={`check-${index}`} />);
    }
    if (part) {
      elements.push(part);
    }
  });

  return <>{elements}</>;
}
