import React from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  "data-title"?: string;
  "data-title-color"?: string;
  "data-color"?: string;
  "data-background"?: string;
  "data-border-color"?: string;
  "data-border-width"?: string;
  "data-border-style"?: string;
};

export default function DirectiveWrapper(props: Props) {
  if (props.className?.includes("directive-column")) {
    const dataTitle = props["data-title"];
    const dataTitleColor = props["data-title-color"];
    const dataColor = props["data-color"];
    const dataBackground = props["data-background"];
    const dataBorderColor = props["data-border-color"];
    const dataBorderWidth = props["data-border-width"];
    const dataBorderStyle = props["data-border-style"];

    const defaultBorderColor = "#cbd5e1";
    const defaultTitleBgColor = "#cbd5e1";
    const hasBorder = dataBorderColor !== undefined && dataBorderColor !== "";
    const hasTitle = dataTitle !== undefined && dataTitle !== "";

    return (
      <div className="directive-wrapper" id={props.id}>
        <div
          className={props.className}
          style={{
            border: hasBorder
              ? `${dataBorderWidth || "2px"} ${dataBorderStyle || "solid"} ${dataBorderColor}`
              : hasTitle
                ? `${dataBorderWidth || "2px"} solid ${defaultBorderColor}`
                : "none",
            ...props.style,
          }}
        >
          {dataTitle && (
            <div
              className="directive-column-title"
              style={{
                backgroundColor: dataColor || defaultTitleBgColor,
                color: dataTitleColor || "#1f2937",
                padding: "0.5rem 1rem",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              {dataTitle}
            </div>
          )}
          <div
            className="directive-column-content"
            style={{
              backgroundColor: dataBackground,
              padding: "1rem",
            }}
          >
            {props.children}
          </div>
        </div>
      </div>
    );
  }

  return <div className={`directive-wrapper ${props.className || ""}`} {...props} />;
}