import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useMediaQuery } from "react-responsive";

// Define the shape of the context value
interface SidebarContext {
  open: boolean;
  isCollapsed: boolean;
  isHandheld: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  collapse: React.Dispatch<React.SetStateAction<boolean>>;
}

// Define the props for the SidebarProvider component
interface SidebarProviderProps {
  children: ReactNode;
}
// Create the context with an initial value of `undefined`
const SidebarContextProvider = createContext<SidebarContext | undefined>(
  undefined
);

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [open, setOpen] = useState(false);
  const [isCollapsed, collapse] = useState<boolean>(() => {
    const saved = localStorage.getItem("isCollapsed");
    return saved !== null ? JSON.parse(saved) : false;
  });

  const isHandheld = useMediaQuery({ maxWidth: 1023 });

  useEffect(() => {
    localStorage.setItem("isCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);
  // The value provided to the context
  const value = {
    open,
    isCollapsed,
    isHandheld,
    setOpen,
    collapse,
  };

  return (
    <SidebarContextProvider.Provider value={value}>
      {children}
    </SidebarContextProvider.Provider>
  );
}

// Custom hook for consuming the theme context
export const useSidebar = () => {
  const context = useContext(SidebarContextProvider);

  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }

  return context;
};
