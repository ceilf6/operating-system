import clsx from "clsx";
import { Search, TerminalSquare } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "总览" },
  { to: "/notes", label: "笔记" },
  { to: "/tds", label: "题单" },
  { to: "/practice", label: "实践" },
  { to: "/glossary", label: "术语" },
  { to: "/review", label: "复习" },
  { to: "/search", label: "搜索" },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(15,31,49,0.08)] bg-[rgba(246,238,224,0.86)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-4 px-4 py-4 md:px-6 xl:px-8">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white/80 text-[color:var(--signal-blue)] shadow-sm">
            <TerminalSquare className="h-5 w-5" />
          </div>
          <div>
            <div className="eyebrow">课程导航</div>
            <p className="page-title mt-2 text-xl font-semibold text-[color:var(--ink-1)]">
              操作系统学习网站
            </p>
          </div>
        </NavLink>
        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  "rounded-full px-4 py-2 text-sm transition",
                  isActive
                    ? "bg-[color:var(--ink-0)] text-white"
                    : "text-[color:var(--ink-2)] hover:bg-white/70",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <NavLink
          to="/search"
          className="flex items-center gap-2 rounded-full border border-[rgba(15,31,49,0.12)] bg-white/80 px-4 py-2 text-sm text-[color:var(--ink-2)] transition hover:bg-white"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Cmd / Ctrl + K</span>
          <span className="sm:hidden">搜索</span>
        </NavLink>
      </div>
    </header>
  );
}
