import { motion } from "framer-motion";
import logo from "@/assets/LogoWR.png";

const ScreenLoader = () => {
  return (
    <motion.div
      className="absolute top-0 left-0 w-screen h-screen bg-main-700 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="flex flex-col text-white items-center justify-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: 0.2,
        }}
      >
        <motion.img
          src={logo}
          alt="UN Logo"
          className="max-w-[150px] mb-2"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="text-sm font-semibold -mt-4 flex gap-1 items-center">
          <span>Loading</span>
          <motion.span
            className="inline-block"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          >
            .
          </motion.span>
          <motion.span
            className="inline-block"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          >
            .
          </motion.span>
          <motion.span
            className="inline-block"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          >
            .
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ScreenLoader;
