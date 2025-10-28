import React from "react";

type RefLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  "data-ref"?: string;
};

export const RefLink: React.FC<RefLinkProps> = ({ children, ...props }) => {
  const dataRef = props["data-ref"] as string | undefined;
  if (dataRef) {
    // Basic behavior: render an anchor with a CSS class for further enhancement
    const className = ["ref-link", props.className].filter(Boolean).join(" ");
    return (
      <a {...props} className={className}>
        {children}
      </a>
    );
  }

  return <a {...props}>{children}</a>;
};
