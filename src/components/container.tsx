import { ReactNode } from "react";
import { DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export const Container = ({
  title,
  children,
  className,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) => {
  return (
    <section
      className={cn("rounded-md border p-1 px-2 pb-3.5 shadow-sm", className)}
    >
      <header className="font-bold border-b pl-2 py-2 capitalize flex justify-between items-center">
        {title}
        {title === "history" && (
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="bg-red-300 text-white hover:bg-red-500 hover:text-white"
            >
              View full history
            </Button>
          </DialogTrigger>
        )}
      </header>
      <div className="flex flex-col gap-4 pt-4 px-2">{children}</div>
    </section>
  );
};