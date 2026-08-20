"use client";

import { Play, Heart, MessageCircle } from "lucide-react";
import type { SocialMention } from "@/types/social";
import { formatCompactNumber } from "@/lib/utils/format";
import { track } from "@/lib/analytics";

export function SocialMentionCard({ mention }: { mention: SocialMention }) {
  return (
    <a
      href={mention.postUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("social_post_clicked", { placeId: mention.placeId, platform: mention.platform })}
      className="flex w-40 shrink-0 flex-col gap-2 border border-grey-200 bg-paper p-2.5 transition-colors hover:border-ink"
    >
      <div className="flex aspect-[9/16] w-full items-center justify-center bg-grey-100 text-grey-400">
        <Play size={20} strokeWidth={1.5} />
      </div>
      <p className="line-clamp-2 text-xs leading-snug text-ink">{mention.caption}</p>
      <div className="mt-auto flex items-center justify-between font-mono text-[10px] text-grey-500">
        <span className="truncate">{mention.creatorHandle}</span>
      </div>
      <div className="flex items-center gap-3 font-mono text-[10px] text-grey-500">
        <span className="flex items-center gap-1">
          <Play size={10} /> {formatCompactNumber(mention.viewCount)}
        </span>
        <span className="flex items-center gap-1">
          <Heart size={10} /> {formatCompactNumber(mention.likeCount)}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle size={10} /> {formatCompactNumber(mention.commentCount)}
        </span>
      </div>
    </a>
  );
}
