import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { AlgorithmStep, StepNode } from '@/algorithms/subarray-sum-equals-k/animationSteps';
import { motionDuration } from '@/utils/motion';

interface Props {
  step: AlgorithmStep;
  reducedMotion: boolean;
  speed: number;
}

const algorithmLabel = (step: AlgorithmStep): { id: string; text: string; x: number; y: number }[] => {
  const arrayNodes = step.frame.nodes.filter((node) => node.id.startsWith('array-'));
  const first = arrayNodes[0];
  const last = arrayNodes[arrayNodes.length - 1];
  const hashNodes = step.frame.nodes.filter((node) => node.id.startsWith('hash-'));
  const arrayX = ((first?.x ?? 600) + (last?.x ?? 600)) / 2;
  const hashX = hashNodes.length ? (Math.min(...hashNodes.map((node) => node.x)) + Math.max(...hashNodes.map((node) => node.x))) / 2 : 830;
  return hashNodes.length > 0
    ? [{ id: 'array-label', text: '输入数组：逐项累加', x: arrayX, y: 215 }, { id: 'hash-label', text: '前缀和频次表：历史记录', x: hashX, y: 215 }]
    : [{ id: 'array-label', text: '输入数组：枚举连续区间', x: arrayX, y: 215 }];
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

export const AlgorithmCanvas: React.FC<Props> = ({ step, reducedMotion, speed }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const root = svg.select<SVGGElement>('.zoom-layer');
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.65, 2.5]).on('zoom', (event) => root.attr('transform', event.transform.toString()));
    svg.call(zoom).on('dblclick.zoom', null);
    svg.call(zoom.transform, d3.zoomIdentity.translate(-60, 0).scale(1.2));
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const root = svg.select<SVGGElement>('.zoom-layer');
    const ms = motionDuration('move', speed, reducedMotion);
    root.selectAll<SVGElement, unknown>('*').interrupt();

    const nodeLayer = root.select<SVGGElement>('.layer-nodes');
    const nodes = nodeLayer
      .selectAll<SVGGElement, StepNode>('g.canvas-node')
      .data(step.frame.nodes, (node) => node.id)
      .join(
        (enter) => {
          const group = enter.append('g').attr('class', 'canvas-node').attr('data-node-id', (node) => node.id).attr('opacity', 0);
          group.append('rect').attr('rx', 4).attr('height', 48);
          group.append('text').attr('class', 'node-label').attr('text-anchor', 'middle').attr('dominant-baseline', 'middle');
          group.append('text').attr('class', 'node-badge').attr('text-anchor', 'middle');
          return group;
        },
        (update) => update.interrupt('exit'),
        (exit) => exit.transition('exit').duration(motionDuration('exit', speed, reducedMotion)).attr('opacity', 0).on('end', function () { d3.select(this).remove(); }),
      );

    nodes
      .attr('data-status', (node) => node.status)
      .transition('move').duration(ms).ease(d3.easeCubicOut)
      .attr('transform', (node) => `translate(${node.x - 36},${node.y - 24})`).attr('opacity', 1);
    nodes.select('rect').transition('state').duration(motionDuration('state', speed, reducedMotion))
      .attr('width', (node) => node.id.startsWith('hash-') ? 84 : 72)
      .attr('fill', (node) => colors[node.status].fill)
      .attr('stroke', (node) => colors[node.status].stroke)
      .attr('stroke-width', (node) => node.status === 'current' || node.status === 'done' ? 3 : 1.5);
    nodes.select<SVGTextElement>('.node-label').attr('x', (node) => node.id.startsWith('hash-') ? 42 : 36).attr('y', 25)
      .attr('fill', (node) => colors[node.status].text).text((node) => node.label);
    nodes.select('.node-badge').attr('x', (node) => node.id.startsWith('hash-') ? 42 : 36).attr('y', -5)
      .attr('fill', '#64748b').text((node) => node.badge ?? '');

    const arrowPaths = root.select<SVGGElement>('.layer-arrows').selectAll<SVGPathElement, AlgorithmStep['frame']['arrows'][number]>('path.flow-arrow')
      .data(step.frame.arrows, (arrow) => arrow.id)
      .join((enter) => enter.append('path').attr('class', 'flow-arrow').attr('fill', 'none').attr('pathLength', 1).attr('stroke-dasharray', '1 1').attr('stroke-dashoffset', reducedMotion ? 0 : 1), (update) => update.interrupt('exit'), (exit) => exit.transition('exit').duration(motionDuration('exit', speed, reducedMotion)).attr('opacity', 0).on('end', function () { d3.select(this).remove(); }));
    arrowPaths.attr('data-arrow-id', (arrow) => arrow.id).attr('d', (arrow) => `M${arrow.from.x},${arrow.from.y} L${arrow.to.x},${arrow.to.y}`)
      .attr('stroke', '#258464').attr('stroke-width', 2.5).attr('marker-end', 'url(#arrow-tip)').transition('draw').duration(motionDuration('arrow', speed, reducedMotion)).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0).attr('opacity', 1);
    const arrowLabels = root.select<SVGGElement>('.layer-arrows').selectAll<SVGTextElement, AlgorithmStep['frame']['arrows'][number]>('text.focus-arrow')
      .data(step.frame.arrows, (arrow) => arrow.id)
      .join((enter) => enter.append('text').attr('class', 'focus-arrow').attr('text-anchor', 'middle').attr('opacity', 1), (update) => update.interrupt('exit'), (exit) => exit.transition('exit').duration(motionDuration('exit', speed, reducedMotion)).attr('opacity', 0).on('end', function () { d3.select(this).remove(); }));
    arrowLabels.attr('x', (arrow) => (arrow.from.x + arrow.to.x) / 2).attr('y', (arrow) => (arrow.from.y + arrow.to.y) / 2 - 10).attr('fill', '#17674e').text((arrow) => arrow.text)
      .attr('opacity', 1);
    const arrowBackplates = root.select<SVGGElement>('.layer-arrows').selectAll<SVGRectElement, AlgorithmStep['frame']['arrows'][number]>('rect.arrow-label-backplate')
      .data(step.frame.arrows, (arrow) => arrow.id)
      .join((enter) => enter.append('rect').attr('class', 'arrow-label-backplate').attr('height', 20).attr('rx', 6).attr('opacity', 0), (update) => update.interrupt('exit'), (exit) => exit.transition('exit').duration(motionDuration('exit', speed, reducedMotion)).attr('opacity', 0).on('end', function () { d3.select(this).remove(); }));
    arrowBackplates.attr('x', (arrow) => (arrow.from.x + arrow.to.x) / 2 - Math.max(34, arrow.text.length * 3.4 + 10)).attr('y', (arrow) => (arrow.from.y + arrow.to.y) / 2 - 26)
      .attr('width', (arrow) => Math.max(68, arrow.text.length * 6.8 + 20)).attr('fill', '#f9fcfa').attr('stroke', '#b9cec2').attr('stroke-width', 1).attr('opacity', 0.96).lower();
    arrowLabels.raise();

    const displayedRanges = step.frame.candidate && !step.frame.ranges.some((range) => range.start === step.frame.candidate?.start && range.end === step.frame.candidate?.end) ? [...step.frame.ranges, step.frame.candidate] : step.frame.ranges;
    const ranges = root.select<SVGGElement>('.layer-ranges').selectAll<SVGRectElement, AlgorithmStep['frame']['ranges'][number]>('rect.answer-range')
      .data(displayedRanges, (range) => `${range.start}-${range.end}`)
      .join((enter) => enter.append('rect').attr('class', 'answer-range').attr('height', 6).attr('rx', 2).attr('opacity', 0), (update) => update.interrupt('exit'), (exit) => exit.transition('exit').duration(motionDuration('exit', speed, reducedMotion)).attr('opacity', 0).on('end', function () { d3.select(this).remove(); }));
    const arrayNodes = step.frame.nodes.filter((node) => node.id.startsWith('array-'));
    const arrayX = (index: number) => arrayNodes.find((node) => node.id === `array-${index}`)?.x ?? 100;
    const rangeLaneStart = 500;
    const rangeLanes: AlgorithmStep['frame']['ranges'][] = [];
    const rangeLaneById = new Map<string, number>();
    displayedRanges.forEach((range) => {
      const lane = rangeLanes.findIndex((items) => items.every((item) => item.end < range.start || range.end < item.start));
      const laneIndex = lane === -1 ? rangeLanes.length : lane;
      rangeLanes[laneIndex] ??= [];
      rangeLanes[laneIndex].push(range);
      rangeLaneById.set(`${range.start}-${range.end}`, laneIndex);
    });
    ranges.attr('data-range-id', (range) => `answer-${range.start}-${range.end}`)
      .attr('x', (range) => arrayX(range.start) - 36)
      .attr('y', (range) => rangeLaneStart + (rangeLaneById.get(`${range.start}-${range.end}`) ?? 0) * 14)
      .attr('width', (range) => Math.max(8, arrayX(range.end) - arrayX(range.start) + 52))
      .attr('fill', '#18765a').transition('move').duration(ms).attr('opacity', 0.8);

    const layoutLabels = root.select<SVGGElement>('.layer-labels').selectAll<SVGTextElement, { id: string; text: string; x: number; y: number }>('text.layout-label')
      .data(algorithmLabel(step), (label) => label.id)
      .join((enter) => enter.append('text').attr('class', 'layout-label'), (update) => update, (exit) => exit.remove());
    layoutLabels.attr('x', (label) => label.x).attr('y', (label) => label.y).attr('fill', '#475569').attr('font-size', 12).attr('text-anchor', 'middle').text((label) => label.text);

    const legend = root.select<SVGGElement>('.layer-legend').selectAll<SVGGElement, typeof legendItems[number]>('g.legend-item')
      .data(legendItems, (item) => item.status)
      .join((enter) => {
        const item = enter.append('g').attr('class', 'legend-item');
        item.append('rect').attr('width', 12).attr('height', 12).attr('rx', 2);
        item.append('text').attr('x', 17).attr('y', 10).attr('font-size', 11);
        return item;
      }, (update) => update, (exit) => exit.remove());
    legend.attr('transform', (_, index) => `translate(16,${455 + index * 18})`);
    legend.select('rect').attr('fill', (item) => colors[item.status].fill).attr('stroke', (item) => colors[item.status].stroke).attr('stroke-width', 1.5);
    legend.select('text').attr('fill', '#334155').text((item) => item.label);

  }, [step, reducedMotion, speed]);

  return <svg ref={svgRef} className="algorithm-svg" viewBox="0 0 1200 720" role="img" aria-label="算法执行画布" style={{ touchAction: 'none' }}>
    <defs><marker id="arrow-tip" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#258464" /></marker></defs>
    <g className="zoom-layer">
      <g className="layer-ranges" />
      <g className="layer-nodes" />
      <g className="layer-arrows" />
      <g className="layer-labels" />
      <g className="layer-legend" />
    </g>
  </svg>;
};
