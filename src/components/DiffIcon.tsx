import { Plus, Minus } from "lucide-react";

type DiffIconProps = {
  type?: string;
};

export function DiffIcon({ type }: DiffIconProps) {
  const isAdd = type === "add";
  const Icon = isAdd ? Plus : Minus;

  return (
    <span
      className={`diff-icon ${isAdd ? "diff-icon-add" : "diff-icon-remove"}`}
      aria-hidden="true"
    >
      <Icon size={14} strokeWidth={2.2} />
    </span>
  );
}

