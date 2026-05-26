"use client";

import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
