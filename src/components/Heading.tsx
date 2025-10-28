import React from "react";

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & { id?: string };

export const HeadingH1: React.FC<HeadingProps> = (props) => (
  <h1 {...props} className={["docs-heading", props.className].filter(Boolean).join(" ")} />
);
export const HeadingH2: React.FC<HeadingProps> = (props) => (
  <h2 {...props} className={["docs-heading", props.className].filter(Boolean).join(" ")} />
);
export const HeadingH3: React.FC<HeadingProps> = (props) => (
  <h3 {...props} className={["docs-heading", props.className].filter(Boolean).join(" ")} />
);
export const HeadingH4: React.FC<HeadingProps> = (props) => (
  <h4 {...props} className={["docs-heading", props.className].filter(Boolean).join(" ")} />
);
export const HeadingH5: React.FC<HeadingProps> = (props) => (
  <h5 {...props} className={["docs-heading", props.className].filter(Boolean).join(" ")} />
);
export const HeadingH6: React.FC<HeadingProps> = (props) => (
  <h6 {...props} className={["docs-heading", props.className].filter(Boolean).join(" ")} />
);
