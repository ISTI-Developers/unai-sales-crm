import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Search = ({
  setValue,
  className,
}: {
  setValue: (value: string) => void;
  className?: string;
}) => {
  const { pathname } = useLocation();
  const [inputValue, setInputValue] = useState(
    localStorage.getItem(`search-${pathname}`) ?? ""
  ); // Immediate input
  const [debouncedValue, setDebouncedValue] = useState(""); // Debounced value

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
      localStorage.setItem(`search-${pathname}`, inputValue);
    }, 300); // Wait 500ms after user stops typing

    // Clear timeout if inputValue changes before 500ms
    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, pathname]);

  // Optional: Do something when debouncedValue changes
  useEffect(() => {
    setValue(debouncedValue);
  }, [debouncedValue]);
  return (
    <Input
      type="search"
      placeholder="Search..."
      value={inputValue}
      onChange={(event) => {
        setInputValue(String(event.target.value));
      }}
      className={cn("w-full max-w-md transition-all h-7", className)}
    />
  );
};

export default Search;
