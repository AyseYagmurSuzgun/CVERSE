import React from "react";
import { motion } from "framer-motion";

const Loader = ({ size = "md", fullScreen = false, text = "Yükleniyor..." }) => {
  const containerSize = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`relative ${containerSize[size]}`}>
        {/* Dis halka (Orbit) */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
            ease: "linear",
          }}
        />

        {/* Ic halka (Ters yonde donen orbit) */}
        <motion.div
          className="absolute inset-2 rounded-full border-4 border-secondary/10 border-b-secondary"
          animate={{ rotate: -360 }}
          transition={{
            repeat: Infinity,
            duration: 1.6,
            ease: "linear",
          }}
        />

        {/* Merkez parildayan nokta */}
        <motion.div
          className="absolute inset-5 rounded-full bg-gradient-to-br from-primary to-secondary"
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
        />
      </div>

      {text && (
        <motion.p
          className="text-sm font-medium text-slate-500 tracking-wider text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
            ease: "easeInOut",
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-cverse-bg/90 backdrop-blur-md">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

export default Loader;
