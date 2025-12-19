import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  path: string;
  label: string;
}

const navItems: NavItem[] = [
  { path: "/", label: "Dashboard" },
  { path: "/analysis", label: "Analysis" },
  { path: "/chat", label: "ISABEL" },
  { path: "/consensus", label: "Consensus" },
  { path: "/portfolio", label: "Portfolio" },
  { path: "/settings", label: "Settings" },
];

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-muted/50 rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-0.5 bg-foreground mb-1" />
            <div className="w-5 h-0.5 bg-foreground mb-1" />
            <div className="w-5 h-0.5 bg-foreground" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gradient">MAGI</span>
            <span className="text-sm text-muted-foreground hidden sm:inline">System</span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                location.pathname === item.path
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-muted-foreground">Portfolio</span>
            <div className="text-sm font-mono text-foreground">$100,004.67</div>
          </div>
        </div>
      </div>
    </header>
  );
}
