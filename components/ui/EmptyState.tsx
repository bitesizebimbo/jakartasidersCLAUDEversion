import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function EmptyState({
  title,
  description,
  action,
  className,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className
      )}
    >
      {icon && <div className="text-grey-400">{icon}</div>}
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-grey-500">{title}</p>
      {description && (
        <p className="max-w-xs text-sm leading-relaxed text-grey-600">{description}</p>
      )}
      {action}
    </div>
  );
}
