import { arrowPath, arrowPoint, routeBetweenNodes, verticalNodeEdge } from './arrowGeometry';

describe('arrow geometry', () => {
  it('uses a straight line unless a curve route is explicitly requested', () => {
    expect(arrowPath({ from: { x: 0, y: 0 }, to: { x: 100, y: 100 }, curve: 20 })).toBe('M0,0 L100,100');
    expect(arrowPath({ from: { x: 0, y: 0 }, to: { x: 100, y: 100 }, curve: 20, route: 'curve' })).toContain('Q');
  });

  it('routes lookup arrows from source bottom to target top with rounded corners', () => {
    const path = arrowPath({ from: { x: 100, y: 200 }, to: { x: 400, y: 380 }, route: 'rounded-elbow' });
    expect(path.match(/ C/g)).toHaveLength(3);
    expect(path).toContain('L');
    expect(path.startsWith('M100,200')).toBe(true);
    expect(path.endsWith('L400,380')).toBe(true);
  });

  it('keeps label anchors on the curve', () => {
    const middle = arrowPoint({ from: { x: 0, y: 0 }, to: { x: 100, y: 0 }, curve: 20, route: 'curve' });
    expect(middle.x).toBe(50);
    expect(middle.y).toBe(10);
  });

  it('resolves both endpoints from stable node IDs in the current frame', () => {
    const nodes = new Map([
      ['array-0', { x: 100, y: 100, width: 72, height: 48 }],
      ['hash--2', { x: 200, y: 426, width: 84, height: 48 }],
    ]);
    expect(routeBetweenNodes({ fromId: 'array-0', toId: 'hash--2', route: 'rounded-elbow' }, nodes)).toEqual({
      from: { x: 100, y: 124 },
      to: { x: 200, y: 402 },
      route: 'rounded-elbow',
      curve: undefined,
    });
    expect(routeBetweenNodes({ fromId: 'array-missing', toId: 'hash--2' }, nodes)).toBeUndefined();
  });

  it('anchors vertical data-flow arrows outside node edges', () => {
    expect(verticalNodeEdge({ x: 100, y: 100, width: 72, height: 48 }, 'bottom', 8)).toEqual({ x: 100, y: 132 });
    expect(verticalNodeEdge({ x: 200, y: 426, width: 84, height: 48 }, 'top', 8)).toEqual({ x: 200, y: 394 });
  });

  it('keeps curved label anchors at both exact endpoints', () => {
    const curve = { from: { x: 5, y: 10 }, to: { x: 45, y: 70 }, curve: -18, route: 'curve' as const };
    expect(arrowPoint(curve, 0)).toEqual(curve.from);
    expect(arrowPoint(curve, 1)).toEqual(curve.to);
  });

  it('clamps label progress and preserves straight arrows', () => {
    expect(arrowPath({ from: { x: 1, y: 2 }, to: { x: 3, y: 4 } })).toBe('M1,2 L3,4');
    expect(arrowPoint({ from: { x: 0, y: 0 }, to: { x: 20, y: 10 } }, 2)).toEqual({ x: 20, y: 10 });
  });
});
