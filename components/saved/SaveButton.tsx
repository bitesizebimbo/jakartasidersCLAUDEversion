"use client";

import { Bookmark } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useSavedPlaceIds, useToggleSavedPlace } from "@/hooks/useSavedPlaces";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export function SaveButton({
  placeId,
  variant = "icon",
  redirectTo = "/",
  className,
}: {
  placeId: string;
  variant?: "icon" | "full";
  redirectTo?: string;
  className?: string;
}) {
  const { user } = useAuth();
  const { openModal } = useAuthModal();
  const { data: savedIds } = useSavedPlaceIds();
  const toggle = useToggleSavedPlace();

  const saved = Boolean(savedIds?.includes(placeId));

  function handleClick() {
    if (!user) {
      openModal(redirectTo);
      return;
    }
    toggle.mutate({ placeId, saved });
  }

  if (variant === "full") {
    return (
      <Button
        variant={saved ? "primary" : "outline"}
        onClick={handleClick}
        disabled={toggle.isPending}
        className={className}
      >
        <Bookmark size={16} strokeWidth={1.75} fill={saved ? "currentColor" : "none"} />
        {saved ? "Saved" : "Save"}
      </Button>
    );
  }

  return (
    <IconButton
      aria-label={saved ? "Remove from saved places" : "Save this place"}
      aria-pressed={saved}
      active={saved}
      onClick={handleClick}
      disabled={toggle.isPending}
      className={cn(className)}
    >
      <Bookmark size={18} strokeWidth={1.75} fill={saved ? "currentColor" : "none"} />
    </IconButton>
  );
}
