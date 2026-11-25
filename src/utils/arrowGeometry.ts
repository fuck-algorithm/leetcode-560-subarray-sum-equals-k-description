export interface Point {
  x: number;
  y: number;
}

export interface ArrowRoute {
  fromId: string;
  toId: string;
  route?: 'rounded-elbow' | 'straight' | 'curve';
  curve?: number;
}

export interface ArrowGeometry {
  from: Point;
  to: Point;
  route?: 'rounded-elbow' | 'straight' | 'curve';
  curve?: number;
}

export interface NodeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function verticalNodeEdge(rect: NodeBounds, direction: 'top' | 'bottom', gap = 0): Point {
  return { x: rect.x, y: rect.y + (direction === 'bottom' ? 1 : -1) * (rect.height / 2 + gap) };
}

export function routeBetweenNodes(arrow: ArrowRoute, nodes: ReadonlyMap<string, NodeBounds>): ArrowGeometry | undefined {
  const source = nodes.get(arrow.fromId);
  const target = nodes.get(arrow.toId);
  if (!source || !target) return undefined;
  return {
    from: verticalNodeEdge(source, 'bottom'),
    to: verticalNodeEdge(target, 'top'),
    route: arrow.route,
    curve: arrow.curve,
  };
}

interface Segment {
  from: Point;
  to: Point;
  control1?: Point;
  control2?: Point;
}

function roundedElbowSegments({ from, to }: ArrowGeometry): Segment[] {
  const bendY = Math.min(to.y - 12, from.y + 132);
  const radius = Math.min(12, Math.abs(to.x - from.x) / 3, Math.abs(to.y - bendY));
  const direction = Math.sign(to.x - from.x) || 1;
  const turnX = from.x + direction * 12;
  const leadEnd = { x: from.x, y: bendY };
  const horizontalStart = { x: turnX, y: bendY };
  const horizontalEnd = { x: to.x - direction * radius, y: bendY };
  const targetTurn = { x: to.x, y: bendY + radius };
  return [
    { from, to: leadEnd, control1: { x: from.x, y: from.y + 48 }, control2: { x: from.x, y: bendY - 12 } },
    { from: leadEnd, to: horizontalStart, control1: leadEnd, control2: horizontalStart },
    { from: horizontalStart, to: horizontalEnd },
    { from: horizontalEnd, to: targetTurn, control1: { x: to.x, y: bendY }, control2: { x: to.x, y: bendY + radius * 0.28 } },
    { from: targetTurn, to },
  ];
}

export function arrowPath({ from, to, curve = 0, route }: ArrowGeometry): string {
  if (route === 'rounded-elbow') {
    return roundedElbowSegments({ from, to }).reduce((path, segment) => segment.control1 && segment.control2
      ? `${path} C${segment.control1.x},${segment.control1.y} ${segment.control2.x},${segment.control2.y} ${segment.to.x},${segment.to.y}`
      : `${path} L${segment.to.x},${segment.to.y}`, `M${from.x},${from.y}`);
  }
  if (route !== 'curve' || Math.abs(curve) < 0.5) return `M${from.x},${from.y} L${to.x},${to.y}`;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const cx = (from.x + to.x) / 2 + (-dy / length) * curve;
  const cy = (from.y + to.y) / 2 + (dx / length) * curve;
  return `M${from.x},${from.y} Q${cx},${cy} ${to.x},${to.y}`;
}

function pointOnSegment(segment: Segment, t: number): Point {
  if (!segment.control1 || !segment.control2) {
    return { x: segment.from.x + (segment.to.x - segment.from.x) * t, y: segment.from.y + (segment.to.y - segment.from.y) * t };
  }
  const inverse = 1 - t;
  return {
    x: inverse ** 3 * segment.from.x + 3 * inverse ** 2 * t * segment.control1.x + 3 * inverse * t ** 2 * segment.control2.x + t ** 3 * segment.to.x,
    y: inverse ** 3 * segment.from.y + 3 * inverse ** 2 * t * segment.control1.y + 3 * inverse * t ** 2 * segment.control2.y + t ** 3 * segment.to.y,
  };
}

function segmentSamples(segment: Segment): Point[] {
  return Array.from({ length: 33 }, (_, index) => pointOnSegment(segment, index / 32));
}

export function arrowPoint(arrow: ArrowGeometry, t = 0.5): Point {
  const progress = Math.max(0, Math.min(1, t));
  if (arrow.route === 'rounded-elbow') {
    const segments = roundedElbowSegments(arrow);
    const samples = segments.map((segment) => {
      const points = segmentSamples(segment);
      const length = points.slice(1).reduce((sum, point, index) => sum + Math.hypot(point.x - points[index].x, point.y - points[index].y), 0);
      return { points, length };
    });
    const totalLength = samples.reduce((sum, sample) => sum + sample.length, 0);
    let remaining = progress * totalLength;
    for (const sample of samples) {
      if (remaining <= sample.length) {
        for (let index = 1; index < sample.points.length; index++) {
          const partLength = Math.hypot(sample.points[index].x - sample.points[index - 1].x, sample.points[index].y - sample.points[index - 1].y);
          if (remaining <= partLength || index === sample.points.length - 1) {
            const ratio = partLength ? remaining / partLength : 0;
            return {
              x: sample.points[index - 1].x + (sample.points[index].x - sample.points[index - 1].x) * ratio,
              y: sample.points[index - 1].y + (sample.points[index].y - sample.points[index - 1].y) * ratio,
            };
          }
          remaining -= partLength;
        }
      }
      remaining -= sample.length;
    }
    return arrow.to;
  }
  if (arrow.route !== 'curve' || Math.abs(arrow.curve ?? 0) < 0.5) {
    return { x: arrow.from.x + (arrow.to.x - arrow.from.x) * progress, y: arrow.from.y + (arrow.to.y - arrow.from.y) * progress };
  }
  const curve = arrow.curve ?? 0;
  const dx = arrow.to.x - arrow.from.x;
  const dy = arrow.to.y - arrow.from.y;
  const length = Math.hypot(dx, dy) || 1;
  const control = { x: (arrow.from.x + arrow.to.x) / 2 + (-dy / length) * curve, y: (arrow.from.y + arrow.to.y) / 2 + (dx / length) * curve };
  const inverse = 1 - progress;
  return {
    x: inverse ** 2 * arrow.from.x + 2 * inverse * progress * control.x + progress ** 2 * arrow.to.x,
    y: inverse ** 2 * arrow.from.y + 2 * inverse * progress * control.y + progress ** 2 * arrow.to.y,
  };
}
