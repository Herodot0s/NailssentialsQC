import { motion } from 'framer-motion';
import { PAGE_VARIANTS } from '@/lib/motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard route wrapper for vertical lift + fade transitions.
 * Implements the 'Subtle Slide' pattern for premium navigation.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      variants={PAGE_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
