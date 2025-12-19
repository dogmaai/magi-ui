import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export function Loading({ size = "md", className }: LoadingProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "border-2 border-primary/30 border-t-primary rounded-full animate-spin",
          sizeClasses[size]
        )}
      />
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <Loading size="lg" className="mb-4" />
        <p className="text-muted-foreground text-sm">Processing...</p>
      </div>
    </div>
  );
}
