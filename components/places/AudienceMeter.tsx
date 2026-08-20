"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import type { AudienceType } from "@/types/place";
import { cn } from "@/lib/utils/cn";

const LABELS: Record<AudienceType, string> = {
  LOCAL: "MOSTLY LOCAL",
  MIXED: "MIXED CROWD",
  TOURIST: "MOSTLY TOURIST",
};

export function AudienceMeter({
  audienceType,
  localScore,
  className,
}: {
  audienceType: AudienceType;
  localScore: number;
  className?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const touristScore = 100 - localScore;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-grey-500">
          Who Goes Here?
        </span>
        <button
          type="button"
          aria-label="How the local/tourist estimate is calculated"
          aria-expanded={showTooltip}
          onClick={() => setShowTooltip((v) => !v)}
          className="text-grey-400 hover:text-ink"
        >
          <Info size={14} strokeWidth={1.5} />
        </button>
      </div>

      {showTooltip && (
        <p className="border border-grey-200 bg-grey-50 px-3 py-2 text-xs leading-relaxed text-grey-600">
          Audience mix is estimated from aggregate public signals and may not represent every
          visitor.
        </p>
      )}

      <div className="space-y-1.5">
        <div className="flex justify-between text-sm font-semibold">
          <span>{LABELS[audienceType]}</span>
        </div>
        <div className="relative h-2 w-full overflow-hidden border border-ink bg-grey-100">
          <div
            className="absolute inset-y-0 left-0 bg-ink"
            style={{ width: `${localScore}%` }}
          />
        </div>
        <div className="flex justify-between font-mono text-[11px] text-grey-500">
          <span>LOCAL {Math.round(localScore)}%</span>
          <span>{Math.round(touristScore)}% VISITOR</span>
        </div>
      </div>
    </div>
  );
}
