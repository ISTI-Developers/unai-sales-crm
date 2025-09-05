import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

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
          {title.length > 0 ? `${title}` : `Dashboard`}
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
                    <React.Fragment key={index}>
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
                    </React.Fragment>
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

export default PageTitle;
