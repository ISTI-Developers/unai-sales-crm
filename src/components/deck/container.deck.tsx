import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Container = ({
  children,
  className,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <section
      className={cn(
        "rounded-md border p-1 px-2 pb-3.5 shadow-sm bg-white",
        className
      )}
    >
      <div className="flex flex-col gap-4 pt-4 px-2">{children}</div>
    </section>
  );
};
