import type { PlaceType } from "@/types/place";
import { PLACE_TYPE_ICON } from "@/lib/utils/placeIcon";
import { cn } from "@/lib/utils/cn";

/**
 * Generated placeholder art used in place of real photography — a
 * dot-matrix backdrop with a category icon, matching the technical /
 * editorial design system rather than a generic broken-image state.
 */
export function PlaceImage({
  placeType,
  className,
  iconSize = 28,
}: {
  placeType: PlaceType;
  className?: string;
  iconSize?: number;
}) {
  const Icon = PLACE_TYPE_ICON[placeType];

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
