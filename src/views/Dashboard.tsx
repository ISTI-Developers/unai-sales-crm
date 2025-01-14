import { Textarea } from "@/components/ui/textarea";
import Container from "@/misc/Container";
import { Send } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const Dashboard = () => {
  const [open, onOpenChange] = useState<boolean>(false);
  return (
    <Container>
      <motion.div
        animate={{
          width: open ? "300px" : "100px",
          height: open ? "140px" : "40px",
        }}
        transition={{ duration: 0.3, type: "spring", damping: "15" }}
        className="shadow-lg p-2 rounded-md flex flex-col gap-4 overflow-hidden"
      >
        <motion.button
          onClick={() => onOpenChange((prev) => !prev)}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: !open ? 1 : 0,
            scale: !open ? 1 : 0,
            width:!open ? "fit-content" : "0px",
            height: !open ? "fit-content" : "0px",
          }}
          exit={{ opacity: 1, scale: 1 }}
        >
          Feedback
        </motion.button>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-4"
        >
          <Textarea
            placeholder="Feedback"
            className="resize-none border-2 w-full"
          ></Textarea>
          <button
            type="button"
            onClick={() => onOpenChange((prev) => !prev)}
            className="flex items-center gap-2 w-fit ml-auto"
          >
            <p>Send</p>
            <Send />
          </button>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default Dashboard;
