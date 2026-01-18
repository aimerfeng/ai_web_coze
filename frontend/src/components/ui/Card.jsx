import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={twMerge(
        "bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
