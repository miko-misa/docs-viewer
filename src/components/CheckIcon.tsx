import { Check } from "lucide-react";

export function CheckIcon() {
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        width: "1.2em",
        height: "1.2em",
        marginRight: "0.25em",
        verticalAlign: "-0.2em",
      }}
    >
      <Check
        size={16}
        strokeWidth={2.5}
        style={{
          color: "var(--color-primary-600)",
        }}
      />
    </span>
  );
}
