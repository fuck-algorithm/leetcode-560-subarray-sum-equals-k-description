export interface Point {
  x: number;
  y: number;
}

export interface ArrowGeometry {
  from: Point;
  to: Point;
  curve?: number;
  route?: 'rounded-elbow' | 'curve';
}

export interface NodeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
}

export function verticalNodeEdge(rect: NodeBounds, direction: 'top' | 'bottom', gap = 0): Point {
  return {
    x: rect.x,
    y: rect.y + (direction === 'bottom' ? 1 : -1) * (rect.height / 2 + gap),
  };
}

function roundedElbowPoints({ from, to }: ArrowGeometry): Point[] {
  const bendY = to.y - 12;
  const corner = Math.min(12, Math.abs(to.x - from.x) / 3, Math.abs(to.y - bendY));
  const direction = Math.sign(to.x - from.x) || 1;
  return [
    from,
    { x: from.x, y: bendY },
    { x: from.x + direction * corner, y: bendY },
    { x: to.x - direction * corner, y: bendY },
    { x: to.x, y: bendY + corner },
    to,
  ];
}

export function arrowPath({ from, to, curve = 0, route }: ArrowGeometry): string {
  if (route === 'rounded-elbow') {
    const bendY = to.y - 12;
    const corner = Math.min(12, Math.abs(to.x - from.x) / 3, Math.abs(to.y - bendY));
    const direction = Math.sign(to.x - from.x) || 1;
    return `M${from.x},${from.y} C${from.x},${bendY - corner} ${from.x},${bendY - corner} ${from.x},${bendY} Q${from.x},${bendY} ${from.x + direction * corner},${bendY} L${to.x - direction * corner},${bendY} Q${to.x},${bendY} ${to.x},${bendY + corner} L${to.x},${to.y}`;
  }
  if (route !== 'curve' || Math.abs(curve) < 0.5) return `M${from.x},${from.y} L${to.x},${to.y}`;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const cx = (from.x + to.x) / 2 + (-dy / length) * curve;
  const cy = (from.y + to.y) / 2 + (dx / length) * curve;
  return `M${from.x},${from.y} Q${cx},${cy} ${to.x},${to.y}`;
}

export function arrowPoint({ from, to, curve = 0, route }: ArrowGeometry, t = 0.5): Point {
  const progress = Math.max(0, Math.min(1, t));
  if (route === 'rounded-elbow') {
    const points = roundedElbowPoints({ from, to });
    const lengths = points.slice(1).map((point, index) => Math.hypot(point.x - points[index].x, point.y - points[index].y));
    const totalLength = lengths.reduce((sum, length) => sum + length, 0);
    let remaining = progress * totalLength;
    for (let index = 0; index < lengths.length; index++) {
      if (remaining <= lengths[index] || index === lengths.length - 1) {
        const ratio = lengths[index] === 0 ? 0 : remaining / lengths[index];
        return {
          x: points[index].x + (points[index + 1].x - points[index].x) * ratio,
          y: points[index].y + (points[index + 1].y - points[index].y) * ratio,
        };
      }
      remaining -= lengths[index];
    }
    return to;
  }
  if (route !== 'curve' || Math.abs(curve) < 0.5) {
    return { x: from.x + (to.x - from.x) * progress, y: from.y + (to.y - from.y) * progress };
  }
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const control = { x: (from.x + to.x) / 2 + (-dy / length) * curve, y: (from.y + to.y) / 2 + (dx / length) * curve };
  const inverse = 1 - progress;
  return {
    x: inverse * inverse * from.x + 2 * inverse * progress * control.x + progress * progress * to.x,
    y: inverse * inverse * from.y + 2 * inverse * progress * control.y + progress * progress * to.y,
  };
}
