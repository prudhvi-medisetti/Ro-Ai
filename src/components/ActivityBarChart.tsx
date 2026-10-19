import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { ChatSession } from '../types';
import { Activity, Flame, TrendingUp, BarChart2, Calendar } from 'lucide-react';

interface ActivityBarChartProps {
  sessions: ChatSession[];
}

interface DayData {
  date: Date;
  dateKey: string; // YYYY-MM-DD
  dayLabel: string; // "Mon", "Tue"
  fullLabel: string; // "Aug 21"
  userCount: number;
  modelCount: number;
  totalCount: number;
}

export const ActivityBarChart: React.FC<ActivityBarChartProps> = ({ sessions }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [timeRange, setTimeRange] = useState<7 | 14>(7);
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  // Compute daily metrics from sessions
  const { chartData, totalMessages, mostActiveDay, streakDays, avgPerDay } = useMemo(() => {
    const dayMap = new Map<string, { user: number; model: number }>();

    // Scan all messages across all sessions
    sessions.forEach((session) => {
      session.messages.forEach((msg) => {
        const d = new Date(msg.timestamp);
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
          d.getDate()
        ).padStart(2, '0')}`;

        const curr = dayMap.get(dateKey) || { user: 0, model: 0 };
        if (msg.role === 'user') {
          curr.user += 1;
        } else if (msg.role === 'model') {
          curr.model += 1;
        }
        dayMap.set(dateKey, curr);
      });
    });

    // Build timeline for selected range
    const days: DayData[] = [];
    const now = new Date();
    let totalMsgCount = 0;
    let maxMsgCount = 0;
    let peakDayName = 'None';

    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;

      const counts = dayMap.get(dateKey) || { user: 0, model: 0 };
      const total = counts.user + counts.model;
      totalMsgCount += total;

      const dayLabel = d.toLocaleDateString([], { weekday: 'narrow' });
      const fullLabel = d.toLocaleDateString([], { month: 'short', day: 'numeric' });

      if (total > maxMsgCount) {
        maxMsgCount = total;
        peakDayName = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      }

      days.push({
        date: d,
        dateKey,
        dayLabel,
        fullLabel,
        userCount: counts.user,
        modelCount: counts.model,
        totalCount: total,
      });
    }

    // Calculate streak
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      const counts = dayMap.get(dateKey);
      if (counts && counts.user + counts.model > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    const avg = timeRange > 0 ? (totalMsgCount / timeRange).toFixed(1) : '0';

    return {
      chartData: days,
      totalMessages: totalMsgCount,
      mostActiveDay: peakDayName,
      streakDays: streak,
      avgPerDay: avg,
    };
  }, [sessions, timeRange]);

  // Render D3.js Chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth || 280;
    const height = 110;
    const margin = { top: 12, right: 8, bottom: 20, left: 24 };
    const innerWidth = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', containerWidth)
      .attr('height', height)
      .attr('viewBox', `0 0 ${containerWidth} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Gradient definition for bars
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'bar-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#818CF8');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#4F46E5');

    const activeGradient = defs
      .append('linearGradient')
      .attr('id', 'bar-active-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    activeGradient.append('stop').attr('offset', '0%').attr('stop-color', '#C084FC');
    activeGradient.append('stop').attr('offset', '100%').attr('stop-color', '#7C3AED');

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(chartData.map((d) => d.dateKey))
      .range([0, innerWidth])
      .padding(0.3);

    const maxCount = d3.max(chartData, (d) => d.totalCount) || 1;
    const yDomainMax = Math.max(maxCount, 4);

    const yScale = d3
      .scaleLinear()
      .domain([0, yDomainMax])
      .nice()
      .range([innerHeight, 0]);

    // Grid lines (horizontal subtle)
    const yAxisGrid = d3
      .axisLeft(yScale)
      .ticks(3)
      .tickSize(-innerWidth)
      .tickFormat(() => '');

    g.append('g')
      .attr('class', 'grid-lines')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', '#1E293B')
      .attr('stroke-dasharray', '2,2')
      .attr('opacity', 0.6);

    g.select('.grid-lines .domain').remove();

    // Background placeholder bars (track)
    g.selectAll('.bar-track')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar-track')
      .attr('x', (d) => xScale(d.dateKey) || 0)
      .attr('y', 0)
      .attr('width', xScale.bandwidth())
      .attr('height', innerHeight)
      .attr('rx', 3)
      .attr('fill', '#0F172A')
      .attr('opacity', 0.5);

    // Active Data Bars with enter transition
    const bars = g
      .selectAll('.bar-activity')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar-activity')
      .attr('x', (d) => xScale(d.dateKey) || 0)
      .attr('y', innerHeight)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('rx', 3)
      .attr('fill', (d) =>
        d.dateKey === hoveredDay?.dateKey
          ? 'url(#bar-active-gradient)'
          : d.totalCount > 0
          ? 'url(#bar-gradient)'
          : '#1E293B'
      )
      .attr('cursor', 'pointer');

    bars
      .transition()
      .duration(450)
      .ease(d3.easeCubicOut)
      .attr('y', (d) => (d.totalCount > 0 ? yScale(d.totalCount) : innerHeight - 2))
      .attr('height', (d) =>
        d.totalCount > 0 ? Math.max(innerHeight - yScale(d.totalCount), 3) : 2
      );

    // Hover interactions
    bars
      .on('mouseenter', (event, d) => {
        setHoveredDay(d);
        d3.select(event.currentTarget)
          .attr('fill', 'url(#bar-active-gradient)')
          .attr('filter', 'drop-shadow(0px 0px 4px rgba(168, 85, 247, 0.6))');
      })
      .on('mouseleave', (event, d) => {
        setHoveredDay(null);
        d3.select(event.currentTarget)
          .attr('fill', d.totalCount > 0 ? 'url(#bar-gradient)' : '#1E293B')
          .attr('filter', 'none');
      });

    // X Axis Labels
    g.selectAll('.x-label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'x-label')
      .attr('x', (d) => (xScale(d.dateKey) || 0) + xScale.bandwidth() / 2)
      .attr('y', innerHeight + 14)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('fill', (d) => (d.totalCount > 0 ? '#94A3B8' : '#475569'))
      .attr('font-weight', (d) => (d.totalCount > 0 ? '600' : '400'))
      .text((d) => d.dayLabel);

    // Y Axis Count Ticks
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(3)
      .tickFormat(d3.format('d'));

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .attr('font-size', '8px')
      .attr('fill', '#64748B');

    g.select('.y-axis .domain').remove();
    g.selectAll('.y-axis .tick line').remove();
  }, [chartData, hoveredDay]);

  return (
    <div className="p-3 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 shadow-xl space-y-2.5">
      {/* Header & Range Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-200">Activity Analytics</span>
        </div>

        {/* 7D / 14D Toggle */}
        <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[10px]">
          <button
            type="button"
            onClick={() => setTimeRange(7)}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              timeRange === 7
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7D
          </button>
          <button
            type="button"
            onClick={() => setTimeRange(14)}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              timeRange === 14
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            14D
          </button>
        </div>
      </div>

      {/* D3 Bar Chart Canvas */}
      <div ref={containerRef} className="w-full relative">
        <svg ref={svgRef} className="w-full overflow-visible" />

        {/* Hover Tooltip Overlay */}
        {hoveredDay && (
          <div className="absolute top-0 right-1 px-2 py-1 rounded-lg bg-slate-950/95 border border-indigo-500/40 text-[10px] text-slate-200 shadow-xl pointer-events-none flex items-center gap-2 animate-in fade-in zoom-in-95 duration-100">
            <span className="text-slate-400 font-medium">{hoveredDay.fullLabel}:</span>
            <span className="font-bold text-indigo-300">
              {hoveredDay.totalCount} msg{hoveredDay.totalCount === 1 ? '' : 's'}
            </span>
            {hoveredDay.totalCount > 0 && (
              <span className="text-[9px] text-slate-500">
                ({hoveredDay.userCount} user / {hoveredDay.modelCount} Ro)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-800/80 text-[10px]">
        <div className="p-1.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
          <p className="text-slate-500 font-medium">Activity</p>
          <p className="font-bold text-slate-100 text-xs mt-0.5">{totalMessages}</p>
        </div>
        <div className="p-1.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
          <div className="flex items-center justify-center gap-0.5 text-amber-400">
            <Flame className="w-3 h-3 fill-amber-400/20" />
            <span className="font-bold text-xs">{streakDays}d</span>
          </div>
          <p className="text-slate-500 font-medium mt-0.5">Streak</p>
        </div>
        <div className="p-1.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
          <p className="text-slate-500 font-medium">Avg/Day</p>
          <p className="font-bold text-indigo-300 text-xs mt-0.5">{avgPerDay}</p>
        </div>
      </div>
    </div>
  );
};
