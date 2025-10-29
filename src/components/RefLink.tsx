import React from "react";

type RefLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  "data-ref"?: string;
  "data-ref-type"?: string;
  "data-ref-title"?: string;
};

export const RefLink: React.FC<RefLinkProps> = ({ children, ...props }) => {
  const dataRef = props["data-ref"] as string | undefined;
  const dataRefTitle = props["data-ref-title"] as string | undefined;
  
  if (dataRef) {
    // 参照リンクとして表示（タイトルをツールチップに表示）
    const className = ["ref-link", props.className].filter(Boolean).join(" ");
    const title = dataRefTitle || undefined;
    
    return (
      <a {...props} className={className} title={title}>
        {children}
      </a>
    );
  }

  return <a {...props}>{children}</a>;
};
