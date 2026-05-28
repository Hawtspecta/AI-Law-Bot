import { Link, useLocation } from "react-router-dom";
import { FileText, ClipboardList, GitCompare, Search } from "lucide-react";

const toolNavigation = [
  {
    href: "/legal-research",
    label: "Legal Research",
    icon: Search,
  },
  {
    href: "/contract-analyzer",
    label: "Contract Analyzer",
    icon: FileText,
  },
  {
    href: "/form-assistance",
    label: "Form Assistance",
    icon: ClipboardList,
  },
  {
    href: "/document-comparator",
    label: "Document Comparator",
    icon: GitCompare,
  },
];

const ToolNavigationSidebar = () => {
  const location = useLocation();

  return (
    <aside className="lg:sticky lg:top-24 w-64 rounded-xl border border-border/60 bg-card/80 p-3 shadow-sm">
      <div className="mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Tool Navigation</p>
      </div>

      <nav className="space-y-1">
        {toolNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/80 text-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default ToolNavigationSidebar;
