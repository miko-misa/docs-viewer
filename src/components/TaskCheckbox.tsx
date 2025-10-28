import { Square, CheckSquare } from "lucide-react";

type TaskCheckboxProps = {
  checked: boolean;
};

export function TaskCheckbox({ checked }: TaskCheckboxProps) {
  const Icon = checked ? CheckSquare : Square;

  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        width: "1.2em",
        height: "1.2em",
        marginRight: "0.5em",
        verticalAlign: "middle",
        flexShrink: 0,
      }}
    >
      <Icon
        size={18}
        strokeWidth={2}
        style={{
          color: checked ? "var(--color-primary-600)" : "#64748b",
        }}
      />
    </span>
  );
}
