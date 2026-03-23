import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "dark", toggleTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("app-theme");
    return stored || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
