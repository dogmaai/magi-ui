import { cn } from "@/lib/utils";
import { VoteType } from "@/types";

interface StatusBadgeProps {
  type: VoteType | 'online' | 'offline' | 'degraded';
  className?: string;
}

const badgeStyles: Record<string, string> = {
  BUY: "bg-success/15 text-success border-success/30",
  HOLD: "bg-warning/15 text-warning border-warning/30",
  SELL: "bg-destructive/15 text-destructive border-destructive/30",
  online: "bg-success/15 text-success border-success/30",
  offline: "bg-destructive/15 text-destructive border-destructive/30",
  degraded: "bg-warning/15 text-warning border-warning/30",
};

export function StatusBadge({ type, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border",
        badgeStyles[type] || badgeStyles.offline,
        className
      )}
    >
      {type}
    </span>
  );
}
