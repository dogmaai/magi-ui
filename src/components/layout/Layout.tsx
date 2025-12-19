import { useState, ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main
        className={cn(
          "pt-14 min-h-screen transition-all duration-300",
          "lg:pl-64"
        )}
      >
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
