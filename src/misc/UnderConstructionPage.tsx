import construction from "@/assets/UnderConstruction.svg";
import { useLocation } from "react-router-dom";
import Container from "./Container";
import { motion } from "framer-motion";
const UnderConstructionPage = () => {
  const location = useLocation();
  return (
    <Container title={location.pathname.split("/")[1]}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="overflow-hidden flex items-center justify-center"
      >
        <img
          src={construction}
          title="Worker illustrations by Storyset"
          className="h-full"
        />
      </motion.div>
    </Container>
  );
};

export default UnderConstructionPage;
