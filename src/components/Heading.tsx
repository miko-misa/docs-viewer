import React from "react";

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & { id?: string };

const HeadingWithHash: React.FC<{
  level: 1 | 2 | 3 | 4 | 5 | 6;
  props: HeadingProps;
}> = ({ level, props }) => {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  const className = ["docs-heading", props.className].filter(Boolean).join(" ");

  // ハッシュ記号を level の数だけ生成
  const hashes = "#".repeat(level);

  return React.createElement(
    Tag,
    { ...props, className },
    <>
      <span className="heading-hash" aria-hidden="true">
        {hashes}
      </span>
      {props.children}
    </>,
  );
};

export const HeadingH1: React.FC<HeadingProps> = (props) => (
  <HeadingWithHash level={1} props={props} />
);
export const HeadingH2: React.FC<HeadingProps> = (props) => (
  <HeadingWithHash level={2} props={props} />
);
export const HeadingH3: React.FC<HeadingProps> = (props) => (
  <HeadingWithHash level={3} props={props} />
);
export const HeadingH4: React.FC<HeadingProps> = (props) => (
  <HeadingWithHash level={4} props={props} />
);
export const HeadingH5: React.FC<HeadingProps> = (props) => (
  <HeadingWithHash level={5} props={props} />
);
export const HeadingH6: React.FC<HeadingProps> = (props) => (
  <HeadingWithHash level={6} props={props} />
);
