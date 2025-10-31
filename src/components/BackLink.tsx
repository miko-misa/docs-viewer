import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type BackLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex h-full items-center gap-2 text-base font-semibold text-[color:var(--muted-foreground)] no-underline"
      style={{ lineHeight: 1 }}
    >
      <ChevronLeft aria-hidden className="h-6 w-6" strokeWidth={2.2} />
      <span>{children}</span>
    </Link>
  );
}
