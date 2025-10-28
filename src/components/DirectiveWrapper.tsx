import React from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & { className?: string };

export const DirectiveWrapper: React.FC<Props> = ({ children, className, ...props }) => {
  const rawClasses = typeof className === "string" ? className.split(/\s+/).filter(Boolean) : [];
  const hasDirective = rawClasses.some(
    (cls) => cls === "directive" || cls.startsWith("directive-"),
  );

  if (!hasDirective) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  const merged = ["directive-wrapper", ...rawClasses].join(" ");

  return (
    <div className={merged} {...props}>
      {children}
    </div>
  );
};
