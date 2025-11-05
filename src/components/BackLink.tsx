import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type BackLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function BackLink({ href, children }: BackLinkProps) {
  const ariaLabel =
    typeof children === "string" && children.trim().length > 0 ? children : "一覧に戻る";

  return (
    <Link
      href={href}
      className="inline-flex h-full items-center gap-1 text-base font-semibold text-[color:var(--muted-foreground)] no-underline sm:gap-2"
      aria-label={ariaLabel}
      style={{ lineHeight: 1 }}
    >
      <ChevronLeft aria-hidden className="h-6 w-6" strokeWidth={2.2} />
      <span className="hidden lg:inline">{children}</span>
    </Link>
  );
}
