import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface SubarrayRange {
  start: number;
  end: number;
  sum: number;
}

interface SubarrayRangeVisualizerProps {
  ranges: SubarrayRange[];
  arrayLength: number;
  currentRange?: SubarrayRange;
  width?: number;
  height?: number;
}

export const SubarrayRangeVisualizer: React.FC<SubarrayRangeVisualizerProps> = ({
  ranges,
  arrayLength,
  currentRange,
  width = 1000,
  height = 200,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || arrayLength === 0) return;

    const svg = d3.select(svgRef.current);
    const root = svg.selectAll<SVGGElement, unknown>('g.range-layer').data([null]).join('g').attr('class', 'range-layer');
    root.selectAll('*').interrupt('range');

    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const container = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // 创建比例尺
    const xScale = d3
      .scaleLinear()
      .domain([0, arrayLength - 1])
      .range([0, innerWidth]);

    // 绘制时间轴
    const axis = d3.axisBottom(xScale).ticks(arrayLength).tickFormat(d => d.toString());
    
    container
      .append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(axis)
      .style('color', '#64748b')
      .selectAll('text')
      .style('font-size', '12px');

    // 绘制网格线
    container
      .selectAll('line.grid')
      .data(d3.range(arrayLength))
      .enter()
      .append('line')
      .attr('class', 'grid')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#334155')
      .attr('stroke-width', 1)
      .attr('opacity', 0.3);

    // 为每个范围分配一个垂直层级
    const layerHeight = 30;
    const maxLayers = Math.floor((innerHeight - 20) / layerHeight);
    const layers: number[] = new Array(ranges.length).fill(0);
    
    ranges.forEach((range, i) => {
      let layer = 0;
      for (let j = 0; j < i; j++) {
        const otherRange = ranges[j];
        if (
          (range.start <= otherRange.end && range.end >= otherRange.start) &&
          layers[j] === layer
        ) {
          layer++;
        }
      }
      layers[i] = layer % maxLayers;
    });

    // 绘制范围条
    ranges.forEach((range, i) => {
      const isCurrent = currentRange && 
        currentRange.start === range.start && 
        currentRange.end === range.end;
      
      const y = layers[i] * layerHeight + 10;
      const x1 = xScale(range.start);
      const x2 = xScale(range.end);
      const rangeWidth = x2 - x1 + (xScale(1) - xScale(0));

      // 绘制范围背景
      container
        .append('rect')
        .attr('x', x1)
        .attr('y', y)
        .attr('width', rangeWidth)
        .attr('height', 20)
        .attr('rx', 4)
        .attr('fill', isCurrent ? '#f59e0b' : '#10b981')
        .attr('opacity', isCurrent ? 0.9 : 0.6)
        .attr('stroke', isCurrent ? '#fbbf24' : '#34d399')
        .attr('stroke-width', isCurrent ? 3 : 2)
        .style('cursor', 'pointer')
        .on('mouseenter', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 1)
            .attr('stroke-width', 3);
        })
        .on('mouseleave', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', isCurrent ? 0.9 : 0.6)
            .attr('stroke-width', isCurrent ? 3 : 2);
        });

      // 添加范围标签
      if (rangeWidth > 40) {
        container
          .append('text')
          .attr('x', x1 + rangeWidth / 2)
          .attr('y', y + 14)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .text(`[${range.start},${range.end}]`)
          .style('pointer-events', 'none');
      }
    });

  }, [ranges, arrayLength, currentRange, width, height]);

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        color: '#94a3b8',
        fontSize: '14px',
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          background: '#10b981',
          borderRadius: '50%',
          display: 'inline-block'
        }}></span>
        <span>找到的子数组区间（共 {ranges.length} 个）</span>
      </div>
      
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{
          background: '#1e293b',
          borderRadius: '12px',
          border: '2px solid #334155',
        }}
      />
    </div>
  );
};

export default SubarrayRangeVisualizer;
