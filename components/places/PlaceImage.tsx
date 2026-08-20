"use client";

import { useState } from "react";
import Image from "next/image";
import type { PlaceType } from "@/types/place";
import { PLACE_TYPE_ICON } from "@/lib/utils/placeIcon";
import { cn } from "@/lib/utils/cn";

/**
 * Renders a place's real photo when one is available (`src`), otherwise
 * falls back to generated placeholder art — a dot-matrix backdrop with a
 * category icon, matching the technical/editorial design system rather
 * than a broken-image state. Also falls back if the real photo fails to
 * load at runtime.
 */
export function PlaceImage({
  placeType,
  src,
  alt = "",
  className,
  iconSize = 28,
}: {
  placeType: PlaceType;
  src?: string | null;
  alt?: string;
  className?: string;
  iconSize?: number;
}) {
  const [failed, setFailed] = useState(false);
  const Icon = PLACE_TYPE_ICON[placeType];

  if (src && !failed) {
    return (
      <div className={cn("relative overflow-hidden bg-off-white", className)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, 400px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "dot-matrix flex items-center justify-center bg-off-white text-grey-400",
        className
      )}
    >
      <Icon size={iconSize} strokeWidth={1.25} />
    </div>
  );
}
