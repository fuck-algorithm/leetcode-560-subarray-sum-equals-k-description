export interface ArrowGeometry {
  from: { x: number; y: number };
  to: { x: number; y: number };
  curve?: number;
}

export function arrowPath({ from, to, curve = 0 }: ArrowGeometry): string {
  if (Math.abs(curve) < 0.5) return `M${from.x},${from.y} L${to.x},${to.y}`;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const cx = (from.x + to.x) / 2 + (-dy / length) * curve * 2;
  const cy = (from.y + to.y) / 2 + (dx / length) * curve * 2;
  return `M${from.x},${from.y} Q${cx},${cy} ${to.x},${to.y}`;
}

export function arrowPoint({ from, to, curve = 0 }: ArrowGeometry, t = 0.5): { x: number; y: number } {
  const progress = Math.max(0, Math.min(1, t));
  if (Math.abs(curve) < 0.5) {
    return { x: from.x + (to.x - from.x) * progress, y: from.y + (to.y - from.y) * progress };
  }
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const control = {
    x: (from.x + to.x) / 2 + (-dy / length) * curve * 2,
    y: (from.y + to.y) / 2 + (dx / length) * curve * 2,
  };
  const inverse = 1 - progress;
  return {
    x: inverse * inverse * from.x + 2 * inverse * progress * control.x + progress * progress * to.x,
    y: inverse * inverse * from.y + 2 * inverse * progress * control.y + progress * progress * to.y,
  };
}
