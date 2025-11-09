import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  children: ReactNode;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  delay = 200,
  children,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  // Classes de posicionamento
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  // Animações baseadas na posição
  const animations = {
    top: {
      initial: { opacity: 0, y: 5 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 5 },
    },
    bottom: {
      initial: { opacity: 0, y: -5 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -5 },
    },
    left: {
      initial: { opacity: 0, x: 5 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 5 },
    },
    right: {
      initial: { opacity: 0, x: -5 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -5 },
    },
  };

  // Classes da seta
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            {...animations[position]}
            transition={{ duration: 0.15 }}
            className={clsx(
              'absolute z-50',
              'px-3 py-2',
              'text-sm text-white',
              'bg-neutral-900 dark:bg-neutral-700',
              'rounded-lg shadow-lg',
              'whitespace-nowrap',
              'pointer-events-none',
              positionClasses[position],
              className
            )}
            role="tooltip"
          >
            {content}

            {/* Seta do tooltip */}
            <div
              className={clsx(
                'absolute',
                'w-0 h-0',
                'border-4',
                'border-neutral-900 dark:border-neutral-700',
                arrowClasses[position]
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

Tooltip.displayName = 'Tooltip';

export default Tooltip;
