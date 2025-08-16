import React, { useState, useEffect } from "react";
import { Sun, Moon, Monitor, Wrench, BookOpen } from "lucide-react";
import DocsModal from "./DocsModal";
import ToolsModal from "./ToolsModal";

type Theme = "light" | "dark" | "system";

const Header: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || "system"
  );
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  useEffect(() => {
    const applyTheme = () => {
      const isDark =
        theme === "dark" ||
        (theme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      document.documentElement.classList.toggle("dark", isDark);
    };

    applyTheme();
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", applyTheme);
      return () => mediaQuery.removeEventListener("change", applyTheme);
    }
  }, [theme]);

  const cycleTheme = () => {
    const themes: Theme[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "system":
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <header className="bg-blue-600 dark:bg-gray-900 text-white px-3 py-1 flex justify-between items-center shadow-md">
      {/* Left: Title */}
      <h1 className="text-lg font-semibold font-sans whitespace-nowrap">
        K8s YAML Builder
      </h1>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setIsToolsOpen(true)}
          className="p-1.5 rounded-md bg-blue-500 dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-gray-600 transition-colors"
          title="Tools"
        >
          <Wrench className="h-4 w-4" />
        </button>

        <button
          onClick={() => setIsDocsOpen(true)}
          className="p-1.5 rounded-md bg-blue-500 dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-gray-600 transition-colors"
          title="Docs"
        >
          <BookOpen className="h-4 w-4" />
        </button>

        <button
          onClick={cycleTheme}
          className="p-1.5 rounded-md bg-blue-500 dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-gray-600 transition-colors"
          aria-label={`Current theme: ${theme}. Click to cycle themes`}
          title={`Theme: ${theme}`}
        >
          {getThemeIcon()}
        </button>
      </div>

      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
      <ToolsModal isOpen={isToolsOpen} onClose={() => setIsToolsOpen(false)} />
    </header>
  );
};

export default Header;
