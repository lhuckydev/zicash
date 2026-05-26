/**
 * @fileOverview Centralized Animation Library
 * Reusable GPU-optimized variants for Framer Motion.
 */

export const transitions = {
  spring: { type: "spring", damping: 25, stiffness: 300 },
  smooth: { type: "tween", ease: "easeInOut", duration: 0.3 },
  fast: { type: "tween", ease: "easeOut", duration: 0.2 },
  slow: { type: "tween", ease: "easeInOut", duration: 0.6 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: transitions.smooth,
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: transitions.spring,
};

export const slideInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: transitions.spring,
};

export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const scaleUp = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: transitions.spring,
};

export const buttonTap = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
};

export const cardHover = {
  whileHover: { 
    y: -8,
    transition: { type: "spring", stiffness: 400, damping: 17 }
  },
};

export const pageTransition = {
  initial: { opacity: 0, x: 0, y: 10 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: "easeOut" },
};
