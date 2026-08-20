"use client";

import { TriangleAlert } from "lucide-react";
import { useTikTokPulse } from "@/hooks/useTikTokPulse";
import { formatCompactNumber, formatPercentChange } from "@/lib/utils/format";
import { SocialMentionCard } from "./SocialMentionCard";
import { Skeleton } from "@/components/ui/Skeleton";

export function TikTokPulse({ placeId }: { placeId: string }) {
  const { data, isLoading } = useTikTokPulse(placeId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-grey-500">
          TikTok Pulse
        </span>
        <div className="flex gap-4">
          <Skeleton className="h-14 w-24" />
          <Skeleton className="h-14 w-24" />
        </div>
      </div>
    );
  }

  if (!data || data.status === "unavailable") {
    return (
      <div className="space-y-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-grey-500">
          TikTok Pulse
        </span>
        <div className="flex items-center gap-2 border border-grey-200 bg-grey-50 px-3 py-2.5 text-xs text-grey-500">
          <TriangleAlert size={14} strokeWidth={1.5} />
          Social trend data unavailable
        </div>
      </div>
    );
  }

  const pulse = data.data;

  return (
    <div className="space-y-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-grey-500">
        TikTok Pulse
      </span>

      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-grey-500">
            Posts / 7 days
          </span>
          <span className="font-mono text-2xl font-semibold tabular-nums">{pulse.posts7d}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-grey-500">
            Posts / 30 days
          </span>
          <span className="font-mono text-2xl font-semibold tabular-nums">{pulse.posts30d}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-grey-500">
            Week-on-week
          </span>
          <span
            className={`font-mono text-2xl font-semibold tabular-nums ${
              pulse.weekOnWeekChangePct >= 0 ? "text-signal" : "text-grey-500"
            }`}
          >
            {formatPercentChange(pulse.weekOnWeekChangePct)}
          </span>
        </div>
      </div>

      {pulse.recentMentions.length > 0 ? (
        <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 no-scrollbar">
          {pulse.recentMentions.map((mention) => (
            <SocialMentionCard key={mention.id} mention={mention} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-grey-500">No recent posts found for this place.</p>
      )}

      <p className="font-mono text-[10px] text-grey-400">
        Total recent reach: {formatCompactNumber(
          pulse.recentMentions.reduce((sum, m) => sum + m.viewCount, 0)
        )}{" "}
        views across shown posts
      </p>
    </div>
  );
}
