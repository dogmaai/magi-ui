import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  title?: string;
  children: ReactNode;
  glow?: boolean;
  className?: string;
}

export function GlassCard({ title, children, glow = false, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-lg p-6 transition-all duration-300",
        glow && "glass-glow",
        className
      )}
    >
      {title && (
        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
