import { TriangleAlert } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { Button } from "./Button";

export function ErrorState({
  title = "SOMETHING WENT WRONG",
  description = "That request didn't come through. Try again in a moment.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={<TriangleAlert size={22} strokeWidth={1.5} />}
      title={title}
      description={description}
      action={
        onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        )
      }
    />
  );
}
