import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { AlgorithmStep, StepNode } from '@/algorithms/subarray-sum-equals-k/animationSteps';
import { arrowPath, arrowPoint, routeBetweenNodes } from '@/utils/arrowGeometry';

interface Props {
  step: AlgorithmStep;
  reducedMotion: boolean;
  speed: number;
}

const nodeWidth = (node: StepNode) => node.width ?? (node.id.startsWith('hash-') ? 84 : node.id.startsWith('prefix-') ? 92 : 72);
const arrowLabelPoint = (arrow: { from?: { x: number; y: number }; to?: { x: number; y: number }; route?: 'rounded-elbow' | 'straight' | 'curve'; curve?: number }) => arrow ? arrowPoint(arrow, 0.5) : { x: 0, y: 0 };
const algorithmLabel = (step: AlgorithmStep): { id: string; text: string; x: number; y: number }[] => {
  const arrayNodes = step.frame.nodes.filter((node) => node.id.startsWith('array-'));
  const hashNodes = step.frame.nodes.filter((node) => node.id.startsWith('hash-'));
  const prefixLane = step.frame.nodes.some((node) => node.id.startsWith('prefix-'));
  const arrayX = arrayNodes.length ? (arrayNodes[0].x + arrayNodes[arrayNodes.length - 1].x) / 2 : 600;
  const arrayY = arrayNodes[0]?.y ?? 260;
  if (hashNodes.length) {
    const hashX = (Math.min(...hashNodes.map((node) => node.x)) + Math.max(...hashNodes.map((node) => node.x))) / 2;
    return [
      { id: 'array-label', text: '输入数组 · 按索引扫描', x: arrayX, y: arrayY - 52 },
      { id: 'hash-label', text: '历史前缀和频次表', x: hashX, y: Math.min(...hashNodes.map((node) => node.y)) - 52 },
    ];
  }
  return [{
    id: 'array-label',
    text: prefixLane ? '前缀边界：P[r+1] − P[l] = 子数组和' : '输入数组 · 枚举连续区间',
    x: arrayX,
    y: arrayY - 52,
  }];
};

const colors = {
  idle: { fill: '#dde9e6', text: '#0f1f1b', stroke: '#31554d' },
  current: { fill: '#2f9e7d', text: '#ffffff', stroke: '#18765a' },
  compare: { fill: '#e8b04b', text: '#3a2a00', stroke: '#b07a12' },
  visited: { fill: '#9ad3c2', text: '#0f1f1b', stroke: '#4f8d7b' },
  done: { fill: '#18765a', text: '#ffffff', stroke: '#0f4f3d' },
};

const legendItems = [
  { status: 'current', label: '当前焦点' },
  { status: 'compare', label: '查询命中 / 比较边界' },
  { status: 'visited', label: '已扫描' },
  { status: 'done', label: '答案区间' },
  { status: 'idle', label: '未处理 / 未命中' },
] as const;

export const AlgorithmCanvas: React.FC<Props> = ({ step }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const root = svg.select<SVGGElement>('.zoom-layer');
    const svgElement = svgRef.current;
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.75, 2])
      .on('zoom', (event) => root.attr('transform', event.transform.toString()));
    svg.call(zoom).on('dblclick.zoom', null);
    let cameraInitialized = false;
    const updateViewBox = () => {
      const width = svgElement.clientWidth;
      const height = svgElement.clientHeight;
      if (!width || !height) return;
      const aspect = width / height;
      const logicalWidth = Math.max(1200, 720 * aspect);
      const logicalHeight = Math.max(720, 1200 / aspect);
      const minX = (1200 - logicalWidth) / 2;
      const minY = (720 - logicalHeight) / 2;
      svg.attr('viewBox', `${minX} ${minY} ${logicalWidth} ${logicalHeight}`);
      if (!cameraInitialized) {
        const scale = Math.min(logicalWidth / 1200, 1.25);
        const translateX = (logicalWidth - 1200 * scale) / 2;
        const translateY = 52 - minY * scale;
        svg.call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
        cameraInitialized = true;
      }
      root.select('.layer-legend').attr('transform', `translate(${minX},${minY})`);
    };
    const observer = new ResizeObserver(updateViewBox);
    observer.observe(svgElement);
    updateViewBox();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const root = d3.select(svgRef.current).select<SVGGElement>('.zoom-layer');
    const nodeLayer = root.select<SVGGElement>('.layer-nodes');
    const nodes = nodeLayer.selectAll<SVGGElement, StepNode>('g.canvas-node')
      .data(step.frame.nodes, (node) => node.id)
      .join(
        (enter) => {
          const group = enter.append('g').attr('class', 'canvas-node').attr('data-node-id', (node) => node.id);
          group.append('rect').attr('rx', 6);
          group.append('text').attr('class', 'node-label').attr('text-anchor', 'middle').attr('dominant-baseline', 'middle');
          group.append('text').attr('class', 'node-badge').attr('text-anchor', 'middle');
          return group;
        },
        (update) => update,
        (exit) => exit.remove(),
      );

    nodes.attr('data-status', (node) => node.status)
      .attr('transform', (node) => `translate(${node.x - nodeWidth(node) / 2},${node.y - (node.height ?? 48) / 2})`);
    nodes.select('rect')
      .attr('width', nodeWidth)
      .attr('height', (node) => node.height ?? 48)
      .attr('fill', (node) => colors[node.status].fill)
      .attr('stroke', (node) => colors[node.status].stroke)
      .attr('stroke-width', (node) => node.status === 'current' || node.status === 'done' ? 2 : 1);
    nodes.select<SVGTextElement>('.node-label')
      .attr('x', (node) => nodeWidth(node) / 2)
      .attr('y', (node) => (node.height ?? 48) / 2)
      .attr('fill', (node) => colors[node.status].text)
      .text((node) => node.label);
    nodes.select('.node-badge')
      .attr('x', (node) => nodeWidth(node) / 2)
      .attr('y', -7)
      .attr('fill', '#64786f')
      .text((node) => node.badge ?? '');

    const nodeById = new Map(step.frame.nodes.map((node) => [node.id, node]));
    const arrows = step.frame.arrows;
    const arrowPaths = root.select<SVGGElement>('.layer-arrows').selectAll<SVGPathElement, typeof arrows[number]>('path.flow-arrow')
      .data(arrows, (arrow) => arrow.id)
      .join(
        (enter) => enter.append('path').attr('class', 'flow-arrow').attr('fill', 'none'),
        (update) => update,
        (exit) => exit.remove(),
      );
    const nodeBounds = new Map(step.frame.nodes.map((node) => [node.id, { x: node.x, y: node.y, width: nodeWidth(node), height: node.height ?? 48 }]));
    const routedArrows = arrows.flatMap((arrow) => {
      const geometry = routeBetweenNodes(arrow, nodeBounds);
      return geometry ? [{ ...arrow, geometry }] : [];
    });
    const routedArrowById = new Map(routedArrows.map((arrow) => [arrow.id, arrow]));
    arrowPaths.attr('data-arrow-id', (arrow) => arrow.id)
      .attr('data-from-id', (arrow) => arrow.fromId)
      .attr('data-to-id', (arrow) => arrow.toId)
      .attr('data-route', (arrow) => arrow.route ?? 'straight')
      .attr('d', (arrow) => {
        const routed = routedArrowById.get(arrow.id);
        return arrowPath(routed?.geometry ?? arrow);
      })
      .attr('stroke', '#258464')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow-tip)');

    const arrowLabels = root.select<SVGGElement>('.layer-arrows').selectAll<SVGTextElement, typeof arrows[number]>('text.focus-arrow')
      .data(arrows, (arrow) => arrow.id)
      .join(
        (enter) => enter.append('text').attr('class', 'focus-arrow').attr('text-anchor', 'middle'),
        (update) => update,
        (exit) => exit.remove(),
      );
    arrowLabels.attr('x', (arrow) => arrowLabelPoint(routedArrowById.get(arrow.id)?.geometry ?? arrow).x)
      .attr('y', (arrow) => arrowLabelPoint(routedArrowById.get(arrow.id)?.geometry ?? arrow).y - 8)
      .attr('fill', '#17674e')
      .text((arrow) => arrow.text);

    const displayedRanges = step.frame.candidate && !step.frame.ranges.some((range) => range.start === step.frame.candidate?.start && range.end === step.frame.candidate?.end)
      ? [...step.frame.ranges, step.frame.candidate]
      : step.frame.ranges;
    root.select<SVGGElement>('.layer-ranges').selectAll<SVGRectElement, AlgorithmStep['frame']['ranges'][number]>('rect.answer-range')
      .data(displayedRanges, (range) => `${range.start}-${range.end}`)
      .join('rect')
      .attr('class', 'answer-range')
      .attr('data-range-id', (range) => `answer-${range.start}-${range.end}`)
      .attr('x', (range) => (nodeById.get(`array-${range.start}`)?.x ?? 600) - 36)
      .attr('y', (range) => (step.frame.nodes.some((node) => node.id.startsWith('prefix-')) ? 470 : (nodeById.get(`array-${range.start}`)?.y ?? 250) + 120) + ((range.end - range.start) % 4) * 10)
      .attr('width', (range) => Math.max(8, (nodeById.get(`array-${range.end}`)?.x ?? 600) - (nodeById.get(`array-${range.start}`)?.x ?? 600) + 72))
      .attr('height', 5)
      .attr('rx', 2)
      .attr('fill', '#18765a')
      .attr('opacity', 0.8);

    root.select<SVGGElement>('.layer-labels').selectAll<SVGTextElement, ReturnType<typeof algorithmLabel>[number]>('text.layout-label')
      .data(algorithmLabel(step), (label) => label.id)
      .join('text')
      .attr('class', 'layout-label')
      .attr('x', (label) => label.x)
      .attr('y', (label) => label.y)
      .attr('fill', '#475569')
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
      .text((label) => label.text);

    const legend = root.select<SVGGElement>('.layer-legend').selectAll<SVGGElement, typeof legendItems[number]>('g.legend-item')
      .data(legendItems, (item) => item.status)
      .join((enter) => {
        const item = enter.append('g').attr('class', 'legend-item');
        item.append('rect').attr('width', 12).attr('height', 12).attr('rx', 2);
        item.append('text').attr('x', 17).attr('y', 10).attr('font-size', 11);
        return item;
      });
    legend.attr('transform', (_, index) => `translate(36,${560 + index * 18})`);
    legend.select('rect').attr('fill', (item) => colors[item.status].fill).attr('stroke', (item) => colors[item.status].stroke).attr('stroke-width', 1.5);
    legend.select('text').attr('fill', '#334155').text((item) => item.label);
  }, [step]);

  return <svg ref={svgRef} className="algorithm-svg" viewBox="0 0 1200 720" role="img" aria-label="算法执行画布" style={{ touchAction: 'none' }}>
    <defs><marker id="arrow-tip" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#258464" /></marker></defs>
    <g className="zoom-layer">
      <g className="layer-ranges" />
      <g className="layer-nodes" />
      <g className="layer-arrows" />
      <g className="layer-labels" />
      <g className="layer-legend" />
    </g>
  </svg>;
};
