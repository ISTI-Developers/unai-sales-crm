import { ReactNode, Fragment, useState, useEffect } from "react";
import Page from "./Page";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatePresence, motion } from "framer-motion";
import useStoredUser from "@/hooks/useStoredUser";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  title?: string;
  className?: string;
}
const Container = ({ children, title = "", className }: ContainerProps) => {
  return (
    <div className="mainArea flex flex-col gap-8 text-black">
      <header className="bg-red-500 w-full h-[5.5rem] rounded-b-lg flex items-center justify-between p-4 text-white">
        <PageTitle title={title} />
        <UserAvatar />
      </header>
      <Page
        className={cn(
          "bg-white shadow-md rounded-lg p-4 flex flex-col h-full gap-4 overflow-x-hidden",
          className
        )}
      >
        {children}
      </Page>
    </div>
  );
};

const PageTitle = ({ title }: { title: string }) => {
  const location = useLocation();
  const paths = location.pathname
    .substring(1)
    .split("/")
    .filter((item) => item.trim().length > 0);
  const length = paths.length;
  return (
    <AnimatePresence>
      <div>
        <h1 className="text-lg font-semibold capitalize">
          {title.length > 0 ? `Manage ${title}` : `Dashboard`}
        </h1>
        {length > 1 && (
          <motion.div
            key="breadcrumb" // Unique key for the breadcrumb animation
            initial={{ opacity: 0, y: 20 }} // Start hidden and slightly above
            animate={{ opacity: 1, y: 0 }} // Animate into view
            exit={{ opacity: 0, y: 20 }} // Animate out of view
            transition={{ type: "tween", duration: 0.3 }} // Smooth and quick animation
          >
            <Breadcrumb>
              <BreadcrumbList>
                {paths.map((path, index) => {
                  const href = `/${paths.slice(0, index + 1).join("/")}`;

                  return (
                    <Fragment key={index}>
                      <BreadcrumbItem className="capitalize text-xs text-white">
                        {index !== length - 1 ? (
                          <Link to={href} className="underline">
                            {path.replace(/_/g, " ")}
                          </Link>
                        ) : (
                          <p>{path.replace(/_/g, " ")}</p>
                        )}
                      </BreadcrumbItem>
                      {index !== length - 1 && (
                        <BreadcrumbSeparator className="text-white" />
                      )}
                    </Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};

const UserAvatar = () => {
  const { user } = useStoredUser();

  const [initials, setInitials] = useState<string>("");

  useEffect(() => {
    if (user) {
      if (user.first_name && user.last_name) {
        setInitials(
          user.first_name.substring(0, 1) + user.last_name.substring(0, 1)
        );
      }
    }
  }, [user]);

  return (
    <Avatar>
      <AvatarImage src={user?.image} />
      <AvatarFallback className="bg-blue-500 uppercase">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
export default Container;
