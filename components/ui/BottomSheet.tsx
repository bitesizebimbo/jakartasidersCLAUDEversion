"use client";

import type { ReactNode } from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils/cn";

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title: string;
  description?: string;
  /** Snap points as fractions of viewport height, largest last. */
  snapPoints?: (number | string)[];
  className?: string;
}

/**
 * Draggable bottom sheet used across the app (place preview, filters,
 * auth prompt, collection picker) — accessible dialog semantics via vaul,
 * styled to the monochrome/technical design system.
 */
export function BottomSheet({
  open,
  onOpenChange,
  children,
  title,
  description,
  className,
}: BottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[1px]" />
        <Drawer.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col border-t border-ink bg-paper outline-none",
            className
          )}
        >
          <div className="mx-auto mt-3 h-1 w-10 shrink-0 bg-grey-300" aria-hidden />
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          {description && <Drawer.Description className="sr-only">{description}</Drawer.Description>}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
