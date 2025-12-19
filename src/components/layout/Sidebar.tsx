import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  path: string;
  label: string;
  description: string;
}

const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", description: "System overview" },
  { path: "/analysis", label: "Analysis", description: "4AI stock analysis" },
  { path: "/chat", label: "ISABEL", description: "RAG-based Q&A" },
  { path: "/consensus", label: "Consensus", description: "5AI deliberation" },
  { path: "/portfolio", label: "Portfolio", description: "Holdings & orders" },
  { path: "/settings", label: "Settings", description: "LLM configuration" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-14 bottom-0 left-0 w-64 glass border-r border-border z-50",
          "transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                "block px-4 py-3 rounded-lg transition-all duration-200",
                location.pathname === item.path
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-muted/50 border border-transparent"
              )}
            >
              <span
                className={cn(
                  "block text-sm font-medium",
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-foreground"
                )}
              >
                {item.label}
              </span>
              <span className="block text-xs text-muted-foreground mt-0.5">
                {item.description}
              </span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">System Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-foreground">All Systems Online</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
