import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { PREMIUM_EASE } from "@/lib/motion";

interface AnimatedCardProps extends React.ComponentProps<typeof Card> {
  children: React.ReactNode;
}

/**
 * Motion-enhanced card with premium hover and tap animations.
 * Implements the scale-based micro-interaction pattern.
 */
export function AnimatedCard({ children, className, ...props }: AnimatedCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: PREMIUM_EASE }}
      className={className}
    >
      <Card {...props}>{children}</Card>
    </motion.div>
  );
}
