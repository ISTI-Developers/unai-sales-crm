import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageProps {
  children: ReactNode;
  className?: string | "";
}

const Page = ({ children, ...props }: PageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Page;
