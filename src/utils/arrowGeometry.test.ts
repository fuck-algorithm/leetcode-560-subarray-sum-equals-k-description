import { arrowPath, arrowPoint } from './arrowGeometry';

describe('arrow geometry', () => {
  it('uses a quadratic Bezier for curved arrows', () => {
    expect(arrowPath({ from: { x: 0, y: 0 }, to: { x: 100, y: 100 }, curve: 20 })).toMatch(/^M0,0 Q21\.7157[\d]*,78\.2842[\d]* 100,100$/);
  });

  it('keeps label anchors on the curve', () => {
    const middle = arrowPoint({ from: { x: 0, y: 0 }, to: { x: 100, y: 0 }, curve: 20 });
    expect(middle.x).toBe(50);
    expect(middle.y).toBe(20);
  });

  it('keeps curved label anchors at both exact endpoints', () => {
    const curve = { from: { x: 5, y: 10 }, to: { x: 45, y: 70 }, curve: -18 };
    expect(arrowPoint(curve, 0)).toEqual(curve.from);
    expect(arrowPoint(curve, 1)).toEqual(curve.to);
  });

  it('clamps label progress and preserves straight arrows', () => {
    expect(arrowPath({ from: { x: 1, y: 2 }, to: { x: 3, y: 4 } })).toBe('M1,2 L3,4');
    expect(arrowPoint({ from: { x: 0, y: 0 }, to: { x: 20, y: 10 } }, 2)).toEqual({ x: 20, y: 10 });
  });
});
