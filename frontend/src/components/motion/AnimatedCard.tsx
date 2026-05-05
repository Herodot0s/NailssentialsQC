import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { PREMIUM_EASE } from "@/lib/motion";

interface AnimatedCardProps extends React.ComponentProps<typeof Card> {
  children: React.ReactNode;
  delay?: number;
}

/**
 * Motion-enhanced card with premium hover and tap animations.
 * Implements the scale-based micro-interaction pattern.
 */
export function AnimatedCard({ children, className, delay, ...props }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        duration: 0.25, 
        ease: PREMIUM_EASE as any,
        delay: delay ? delay / 1000 : 0
      }}
      className={className}
    >
      <Card {...props}>{children}</Card>
    </motion.div>
  );
}
