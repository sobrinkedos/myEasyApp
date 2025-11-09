import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export type TransitionType = 'fade' | 'slide' | 'scale' | 'none';

export interface AnimatedRouteProps {
  children: ReactNode;
  type?: TransitionType;
  duration?: number;
}

const AnimatedRoute: React.FC<AnimatedRouteProps> = ({
  children,
  type = 'fade',
  duration = 0.2,
}) => {
  const location = useLocation();

  // Variantes de animação por tipo
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    none: {
      initial: {},
      animate: {},
      exit: {},
    },
  };

  const selectedVariant = variants[type];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={selectedVariant.initial}
        animate={selectedVariant.animate}
        exit={selectedVariant.exit}
        transition={{ duration, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

AnimatedRoute.displayName = 'AnimatedRoute';

export default AnimatedRoute;
