export const PREMIUM_EASE = [0.32, 0.72, 0, 1];
export const PAGE_TRANSITION_DURATION = 0.4;
export const MICRO_INTERACTION_DURATION = 0.25;

export const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: PAGE_TRANSITION_DURATION,
      ease: PREMIUM_EASE as any,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};
