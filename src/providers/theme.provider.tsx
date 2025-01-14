import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

// Define the shape of the context value
interface ThemeContextValue {
  theme: string;
  setTheme: (theme: string) => void;
}

// Define the props for the ThemeProvider component
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
  storage_key?: string;
}
// Create the context with an initial value of `undefined`
const ThemeProviderContext = createContext<ThemeContextValue | undefined>(
  undefined
);

export function ThemeProvider({
  children,
  defaultTheme = "",
  storage_key = "",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<string>(
    localStorage.getItem(storage_key) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }
    root.classList.add(theme);
  }, [theme]);

  // The value provided to the context
  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// Custom hook for consuming the theme context
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
