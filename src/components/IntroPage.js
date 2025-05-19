import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import './IntroPage.css';

const IntroPage = ({ onAnimationComplete }) => {
  const [visibleTextIndex, setVisibleTextIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);

  const texts = [
    "welcome to the DFA simulator!",
    "choose between DFA",
    "CFG",
    "or another whatever",
    "ts is gonna be so cool",
    "u ready bruh?",
  ];

  useEffect(() => {
    if (visibleTextIndex < texts.length - 1) {
      const timer = setTimeout(() => {
        setVisibleTextIndex((prev) => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (visibleTextIndex === texts.length - 1) {
      // We’re at the last text now
      const buttonDelay = setTimeout(() => {
        setShowButton(true);
      }, 2000); // optional delay before button appears
      return () => clearTimeout(buttonDelay);
    }
  }, [visibleTextIndex, texts.length]);

  return (
    <div className="intro-page">
      <div className="intro-content">
      <div className="text-container">
  <AnimatePresence initial={false} mode="popLayout">
  <motion.div
  key={visibleTextIndex}
  className="text-item"
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -40 }}
  transition={{ duration: 0.8, ease: "easeInOut" }}
  layout="position"
>
  {texts[visibleTextIndex]}
</motion.div>
  </AnimatePresence>
</div>

        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={onAnimationComplete}
          >
            enter the simulator
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default IntroPage;