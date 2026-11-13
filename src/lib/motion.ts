// Shared spring presets so every animation in the app feels the same.
import type { Transition } from "motion/react";

export const spring = {
  /** Default UI movement: cards, tabs, layout shifts. */
  smooth: { type: "spring", stiffness: 380, damping: 34, mass: 0.9 } satisfies Transition,
  /** Snappy feedback: buttons, toggles, hover lifts. */
  snappy: { type: "spring", stiffness: 600, damping: 32 } satisfies Transition,
  /** Soft entrance for content blocks. */
  gentle: { type: "spring", stiffness: 180, damping: 24 } satisfies Transition,
};

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: spring.gentle,
};

export const stagger = (i: number, step = 0.035) => ({ ...spring.gentle, delay: Math.min(i * step, 0.4) });
