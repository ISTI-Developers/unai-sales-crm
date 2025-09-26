import logo from "@/assets/LogoWR.png";
import { Separator } from "../ui/separator";
import useLinks from "@/data/links";
import { Button } from "../ui/button";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeftFromLine,
  ArrowRightFromLine,
  LogOut,
  LucideIcon,
} from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "@/providers/auth.provider";
import { Sheet, SheetContent } from "../ui/sheet";
import { useSidebar } from "@/providers/sidebar.provider";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
interface NavLinkProps {
  hasSeparator: boolean | undefined;
  handler: string;
  icon: LucideIcon;
  title: string;
}

const Sidebar = () => {
  const { open, setOpen, isHandheld, isCollapsed, collapse } = useSidebar();
  return isHandheld ? (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="left"
        className="h-full bg-main-700 lg:w-[16rem] py-0 overflow-y-auto border-none"
      >
        <NavList />
      </SheetContent>
    </Sheet>
  ) : (
    <ScrollArea
      className={cn(
        "relative bg-main-700 w-full p-4 py-0 z-[11] h-full overflow-y-auto transition-[width] group",
        isCollapsed ? "max-w-[5rem]" : "max-w-[16rem]"
      )}
    >
      <Button
        onClick={() => collapse((prev) => !prev)}
        className="absolute top-0 right-0 p-0 h-6 opacity-0 group-hover:opacity-100 text-white"
        variant="ghost"
      >
        {isCollapsed ? <ArrowRightFromLine /> : <ArrowLeftFromLine />}
      </Button>
      <NavList />
    </ScrollArea>
  );
};

const NavList = () => {
  const { links } = useLinks();
  const { isCollapsed } = useSidebar();
  return (
    <>
      <div className="flex gap-2 items-center">
        <img
          src={logo}
          alt="UN Logo without Title"
          className={cn(
            "w-full transition-[width]",
            isCollapsed ? "max-w-[3rem]" : "max-w-[90px]"
          )}
        />
        <AnimatePresence>
          {!isCollapsed && (
            <motion.p
              key="sales-platform"
              className={cn(
                "flex flex-col h-fit text-white font-bold text-lg leading-[24px]"
              )}
            >
              <span>Sales</span>
              <span>Platform</span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <Separator className="bg-main-100 h-0.5" />
      <ul className="py-4 flex flex-col gap-2">
        {links.map(
          (
            { id, handler, title, icon: Icon, hasSeparator, isActive },
            index
          ) => {
            return (
              <li
                key={id}
                className={cn(
                  "select-none",
                  !isActive
                    ? "opacity-30 pointer-events-none cursor-not-allowed"
                    : ""
                )}
              >
                <NavLink
                  hasSeparator={hasSeparator}
                  handler={handler}
                  title={title}
                  icon={Icon}
                />
                {(hasSeparator || index + 1 === links.length) && (
                  <Separator
                    className={cn(
                      "bg-main-100 h-0.5",
                      index + 1 === links.length ? "mt-3" : ""
                    )}
                  />
                )}
              </li>
            );
          }
        )}
        <li className="mt-auto pb-10">
          <LogoutButton />
        </li>
      </ul>
    </>
  );
};

const NavLink = ({
  hasSeparator,
  handler,
  icon: Icon,
  title,
}: NavLinkProps) => {
  const { pathname } = useLocation();
  const { isCollapsed } = useSidebar();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "justify-start gap-4 capitalize group hover:bg-red-400 px-3",
            isCollapsed ? "w-fit" : " w-full",
            hasSeparator && "mb-4",
            !isCollapsed &&
              ((title === "dashboard" && pathname === "/") ||
                pathname.match(title))
              ? "bg-red-400"
              : ""
          )}
          asChild
        >
          <Link
            to={handler}
            className={cn(
              isCollapsed && "hover:bg-red-400",
              isCollapsed &&
                ((title === "dashboard" && pathname === "/") ||
                  pathname.match(title))
                ? "bg-red-400"
                : ""
            )}
          >
            <Icon className={cn("text-white")} />

            <AnimatePresence>
              {!isCollapsed && (
                <motion.span key="title" className="text-white block">
                  {title}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </Button>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent
          side="right"
          className="bg-red-400 capitalize text-base"
        >
          {title}
        </TooltipContent>
      )}
    </Tooltip>
  );
};

const LogoutButton = () => {
  const { logoutUser } = useAuth();

  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-4 capitalize group hover:bg-red-400"
      onClick={logoutUser}
    >
      <LogOut className="text-white" strokeWidth={2} />
      <span className="text-white">Logout</span>
    </Button>
  );
};

export default Sidebar;
