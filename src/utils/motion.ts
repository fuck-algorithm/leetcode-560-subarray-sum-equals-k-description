export const MOTION = {
  enter: 220,
  move: 360,
  exit: 180,
  state: 240,
  arrow: 420,
  result: 360,
  dwell: 1000,
} as const;

export type MotionKind = Exclude<keyof typeof MOTION, 'dwell'>;

export function motionDuration(kind: MotionKind, speed = 1, reduced = false): number {
  if (reduced) return 0;
  const dwellBound = MOTION.dwell * 0.45;
  return Math.min(MOTION[kind], dwellBound) / Math.max(speed, 0.1);
}
