import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ArrayElement } from '@/types';
import { ANIMATION_CONFIG, COLORS } from '@/utils/constants';

interface ArrayVisualizerProps {
  elements: ArrayElement[];
  width?: number;
  height?: number;
  prefixSums?: number[]; // 前缀和数组
  currentIndex?: number; // 当前处理的索引
  targetSum?: number; // 目标和
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({
  elements,
  width = 800,
  height = 300,
  prefixSums = [],
  currentIndex = -1,
  targetSum,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || elements.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // 创建容器组
    const container = svg
      .append('g')
      .attr('class', 'array-container')
      .attr('transform', `translate(${ANIMATION_CONFIG.CHART_PADDING}, ${ANIMATION_CONFIG.CHART_PADDING})`);

    // 计算可用高度和垂直居中位置
    const availableHeight = height - 2 * ANIMATION_CONFIG.CHART_PADDING;
    const elementTotalHeight = ANIMATION_CONFIG.ELEMENT_HEIGHT + 35; // 元素高度 + 索引文本空间
    const yPosition = Math.max(0, (availableHeight - elementTotalHeight) / 2);

    // 绘制元素
    const elementGroups = container
      .selectAll('g.element')
      .data(elements)
      .enter()
      .append('g')
      .attr('class', 'element')
      .attr('transform', (d, i) => {
        const x = i * (ANIMATION_CONFIG.ELEMENT_WIDTH + ANIMATION_CONFIG.ELEMENT_SPACING);
        return `translate(${x}, ${yPosition})`;
      });

    // 绘制矩形
    elementGroups
      .append('rect')
      .attr('width', ANIMATION_CONFIG.ELEMENT_WIDTH)
      .attr('height', ANIMATION_CONFIG.ELEMENT_HEIGHT)
      .attr('rx', 8)
      .attr('fill', (d) => d.color)
      .attr('stroke', (d) => (d.highlight ? COLORS.HIGHLIGHT : d.color))
      .attr('stroke-width', (d) => (d.highlight ? 4 : 2))
      .attr('opacity', (d) => d.animationProps?.opacity ?? 1)
      .style('cursor', 'pointer')
      .on('mouseenter', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1.1)')
          .attr('stroke-width', 4);
      })
      .on('mouseleave', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1)')
          .attr('stroke-width', d.highlight ? 4 : 2);
      });

    // 添加值文本
    elementGroups
      .append('text')
      .attr('x', ANIMATION_CONFIG.ELEMENT_WIDTH / 2)
      .attr('y', ANIMATION_CONFIG.ELEMENT_HEIGHT / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '24px')
      .attr('font-weight', 'bold')
      .text((d) => d.value);

    // 添加索引文本
    elementGroups
      .append('text')
      .attr('x', ANIMATION_CONFIG.ELEMENT_WIDTH / 2)
      .attr('y', ANIMATION_CONFIG.ELEMENT_HEIGHT + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#a0aec0')
      .attr('font-size', '14px')
      .attr('font-weight', '500')
      .text((d) => `[${d.index}]`);

    // 添加前缀和显示（在元素上方）
    if (prefixSums.length > 0) {
      elementGroups
        .append('text')
        .attr('x', ANIMATION_CONFIG.ELEMENT_WIDTH / 2)
        .attr('y', -15)
        .attr('text-anchor', 'middle')
        .attr('fill', (d, i) => i <= currentIndex ? '#8b5cf6' : '#64748b')
        .attr('font-size', '14px')
        .attr('font-weight', (d, i) => i === currentIndex ? 'bold' : 'normal')
        .text((d, i) => {
          if (i <= currentIndex && prefixSums[i] !== undefined) {
            return `总和:${prefixSums[i]}`;
          }
          return '';
        });
    }

    // 添加当前处理指示器
    if (currentIndex >= 0 && currentIndex < elements.length) {
      const currentX = currentIndex * (ANIMATION_CONFIG.ELEMENT_WIDTH + ANIMATION_CONFIG.ELEMENT_SPACING);
      
      // 添加箭头指示器
      container
        .append('text')
        .attr('x', currentX + ANIMATION_CONFIG.ELEMENT_WIDTH / 2)
        .attr('y', yPosition - 35)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f59e0b')
        .attr('font-size', '24px')
        .text('👇');
      
      // 添加"当前处理"文本
      container
        .append('text')
        .attr('x', currentX + ANIMATION_CONFIG.ELEMENT_WIDTH / 2)
        .attr('y', yPosition - 45)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f59e0b')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('正在处理');
    }

    // 动画效果
    elementGroups
      .style('opacity', 0)
      .transition()
      .duration(500)
      .delay((d, i) => i * 50)
      .style('opacity', 1);
  }, [elements, width, height, prefixSums, currentIndex, targetSum]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ border: `1px solid ${COLORS.BORDER}`, borderRadius: '8px', background: COLORS.BACKGROUND }}
    />
  );
};

export default ArrayVisualizer;
