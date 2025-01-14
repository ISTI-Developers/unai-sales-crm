import logo from "@/assets/LogoWR.png";
import { Separator } from "../ui/separator";
import Links from "@/data/links";
import { Button } from "../ui/button";
import classNames from "classnames";
import { Link, useLocation } from "react-router-dom";
import { LogOut, LucideIcon } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "@/providers/auth.provider";

interface NavLinkProps {
  hasSeparator: boolean | undefined;
  handler: string;
  icon: LucideIcon;
  title: string;
}

const Sidebar = () => {
  const { links } = Links();
  return (
    <ScrollArea className="bg-main-700 w-full h-full max-w-[16rem] p-4 py-0 overflow-y-auto">
      <div className="flex gap-2 items-center">
        <img
          src={logo}
          alt="UN Logo without Title"
          className="w-full max-w-[90px]"
        />
        <p className="flex flex-col h-fit text-white font-bold text-lg leading-[20px]">
          <span>Sales</span>
          <span>Dashboard</span>
        </p>
      </div>
      <Separator className="bg-main-100 h-0.5" />
      <ul className="py-4 flex flex-col gap-4">
        {links.map(
          (
            { id, handler, title, icon: Icon, hasSeparator, isActive },
            index
          ) => {
            return (
              <li
                key={id}
                className={classNames(
                  "select-none",
                  !isActive
                    ? "opacity-30 pointer-events-none cursor-not-allowed"
                    : ""
                )}
              >
                {index === 1 && (
                  <div className="pt-0 pb-3">
                    <Label className="uppercase font-bold text-white">
                      Manage
                    </Label>
                  </div>
                )}
                <NavLink
                  hasSeparator={hasSeparator}
                  handler={handler}
                  title={title}
                  icon={Icon}
                />
                {hasSeparator && <Separator className="bg-main-100 h-0.5" />}
              </li>
            );
          }
        )}
        <Separator className="bg-main-100 h-0.5" />
        <li className="mt-auto">
          <LogoutButton />
        </li>
      </ul>
    </ScrollArea>
  );
};

const NavLink = ({
  hasSeparator,
  handler,
  icon: Icon,
  title,
}: NavLinkProps) => {
  const { pathname } = useLocation();
  return (
    <Button
      variant="ghost"
      className={classNames(
        "w-full justify-start gap-4 capitalize group hover:bg-red-400",
        hasSeparator && "mb-4",
        (title === "dashboard" && pathname === "/") || (pathname.match(title)) ? "bg-red-400" : ""
      )}
      asChild
    >
      <Link to={handler}>
        <Icon className="text-white" />
        <span className="text-white">{title}</span>
      </Link>
    </Button>
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
