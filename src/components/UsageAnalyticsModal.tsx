import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import {
  X,
  BarChart3,
  TrendingUp,
  PieChart,
  Calendar,
  Sparkles,
  RefreshCw,
  Zap,
  Cpu,
  Clock,
  Layers,
  Activity,
  ChevronDown,
} from 'lucide-react';

interface UsageAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark' | string;
}

interface DailyFrequency {
  date: string;
  label: string;
  dayOfWeek: string;
  userMessages: number;
  assistantMessages: number;
  totalMessages: number;
  modelCounts: Record<string, number>;
}

interface ModelBreakdown {
  model: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
}

interface HourlyActivity {
  hour: number;
  label: string;
  count: number;
}

interface AnalyticsData {
  days: number;
  summary: {
    totalMessages: number;
    totalPrompts: number;
    totalPromptChars: number;
    totalResponseChars: number;
    avgCharsPerResponse: number;
    activeDaysCount: number;
    topModel: string;
    peakHour: string;
  };
  dailyFrequency: DailyFrequency[];
  modelBreakdown: ModelBreakdown[];
  hourlyActivity: HourlyActivity[];
}

export const UsageAnalyticsModal: React.FC<UsageAnalyticsModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
}) => {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(14);
  const [chartView, setChartView] = useState<'line' | 'bar'>('line');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<DailyFrequency | null>(null);
  const [hoveredModel, setHoveredModel] = useState<ModelBreakdown | null>(null);

  const freqSvgRef = useRef<SVGSVGElement | null>(null);
  const modelSvgRef = useRef<SVGSVGElement | null>(null);
  const donutSvgRef = useRef<SVGSVGElement | null>(null);

  const isLight = theme === 'light';

  // Fetch usage analytics data from backend
  const fetchAnalytics = useCallback(async (days: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics/usage?days=${days}`);
      if (!res.ok) {
        throw new Error(`Failed to load analytics: ${res.statusText}`);
      }
      const json: AnalyticsData = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Unable to load analytics.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics(timeRange);
    }
  }, [isOpen, timeRange, fetchAnalytics]);

  // Render D3 Chat Frequency Chart (Line/Area or Bar)
  useEffect(() => {
    if (!data || !freqSvgRef.current || isLoading) return;

    const svg = d3.select(freqSvgRef.current);
    svg.selectAll('*').remove();

    const rawData = data.dailyFrequency;
    if (rawData.length === 0) return;

    const containerWidth = freqSvgRef.current.parentElement?.clientWidth || 600;
    const width = Math.max(340, containerWidth);
    const height = 240;
    const margin = { top: 20, right: 24, bottom: 36, left: 42 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale
    const xScale = d3
      .scalePoint<string>()
      .domain(rawData.map((d) => d.date))
      .range([0, innerWidth])
      .padding(0.2);

    // Y Scale
    const maxVal = Math.max(8, d3.max(rawData, (d) => d.totalMessages) || 10);
    const yScale = d3
      .scaleLinear()
      .domain([0, maxVal * 1.15])
      .nice()
      .range([innerHeight, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(4)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)')
      .attr('stroke-dasharray', '3 3');

    g.select('.domain').remove();

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(
        rawData
          .filter((_, idx) => {
            if (rawData.length <= 7) return true;
            if (rawData.length <= 14) return idx % 2 === 0;
            return idx % 4 === 0;
          })
          .map((d) => d.date)
      )
      .tickFormat((dateStr) => {
        const item = rawData.find((d) => d.date === dateStr);
        return item ? item.label : '';
      });

    const yAxis = d3.axisLeft(yScale).ticks(4).tickFormat(d3.format('d'));

    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup
      .selectAll('text')
      .attr('fill', isLight ? '#64748B' : '#94A3B8')
      .attr('font-size', '11px')
      .attr('font-family', 'inherit');

    xAxisGroup.select('.domain').attr('stroke', isLight ? '#CBD5E1' : '#334155');
    xAxisGroup.selectAll('line').attr('stroke', isLight ? '#CBD5E1' : '#334155');

    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup
      .selectAll('text')
      .attr('fill', isLight ? '#64748B' : '#94A3B8')
      .attr('font-size', '11px')
      .attr('font-family', 'inherit');
    yAxisGroup.select('.domain').remove();
    yAxisGroup.selectAll('line').remove();

    if (chartView === 'line') {
      // Defs for gradient
      const defs = svg.append('defs');
      const gradient = defs
        .append('linearGradient')
        .attr('id', 'freqAreaGrad')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#6366F1')
        .attr('stop-opacity', isLight ? 0.35 : 0.45);

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#6366F1')
        .attr('stop-opacity', 0.0);

      // Area generator
      const area = d3
        .area<DailyFrequency>()
        .curve(d3.curveMonotoneX)
        .x((d) => xScale(d.date) || 0)
        .y0(innerHeight)
        .y1((d) => yScale(d.totalMessages));

      // Line generator
      const line = d3
        .line<DailyFrequency>()
        .curve(d3.curveMonotoneX)
        .x((d) => xScale(d.date) || 0)
        .y((d) => yScale(d.totalMessages));

      // Draw Area
      g.append('path')
        .datum(rawData)
        .attr('fill', 'url(#freqAreaGrad)')
        .attr('d', area);

      // Draw Line
      const path = g
        .append('path')
        .datum(rawData)
        .attr('fill', 'none')
        .attr('stroke', '#6366F1')
        .attr('stroke-width', 2.5)
        .attr('d', line);

      // Animate line stroke
      const totalLength = path.node()?.getTotalLength() || 0;
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);

      // Draw Dots
      g.selectAll('.dot')
        .data(rawData)
        .enter()
        .append('circle')
        .attr('cx', (d) => xScale(d.date) || 0)
        .attr('cy', (d) => yScale(d.totalMessages))
        .attr('r', 4)
        .attr('fill', isLight ? '#FFFFFF' : '#0F172A')
        .attr('stroke', '#6366F1')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseenter', (_, d) => setHoveredDay(d))
        .on('mouseleave', () => setHoveredDay(null));
    } else {
      // Bar Chart View
      const bandScale = d3
        .scaleBand<string>()
        .domain(rawData.map((d) => d.date))
        .range([0, innerWidth])
        .padding(0.3);

      g.selectAll('.bar')
        .data(rawData)
        .enter()
        .append('rect')
        .attr('x', (d) => bandScale(d.date) || 0)
        .attr('y', innerHeight)
        .attr('width', bandScale.bandwidth())
        .attr('height', 0)
        .attr('rx', 4)
        .attr('fill', '#6366F1')
        .style('cursor', 'pointer')
        .on('mouseenter', (_, d) => setHoveredDay(d))
        .on('mouseleave', () => setHoveredDay(null))
        .transition()
        .duration(650)
        .delay((_, i) => i * 25)
        .ease(d3.easeCubicOut)
        .attr('y', (d) => yScale(d.totalMessages))
        .attr('height', (d) => Math.max(2, innerHeight - yScale(d.totalMessages)));
    }
  }, [data, chartView, isLight, isLoading]);

  // Render D3 Model Distribution Donut Chart
  useEffect(() => {
    if (!data || !donutSvgRef.current || isLoading) return;

    const svg = d3.select(donutSvgRef.current);
    svg.selectAll('*').remove();

    const breakdown = data.modelBreakdown.filter((m) => m.count > 0);
    if (breakdown.length === 0) return;

    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2 - 12;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3
      .pie<ModelBreakdown>()
      .value((d) => d.count)
      .sort(null)
      .padAngle(0.04);

    const arc = d3
      .arc<d3.PieArcDatum<ModelBreakdown>>()
      .innerRadius(radius * 0.58)
      .outerRadius(radius)
      .cornerRadius(4);

    const hoverArc = d3
      .arc<d3.PieArcDatum<ModelBreakdown>>()
      .innerRadius(radius * 0.55)
      .outerRadius(radius * 1.06)
      .cornerRadius(4);

    const arcs = g
      .selectAll('.arc')
      .data(pie(breakdown))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs
      .append('path')
      .attr('fill', (d) => d.data.color)
      .attr('d', arc)
      .style('cursor', 'pointer')
      .on('mouseenter', function (_, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', hoverArc as any);
        setHoveredModel(d.data);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc as any);
        setHoveredModel(null);
      });

    // Center count
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.1em')
      .attr('fill', isLight ? '#0F172A' : '#F8FAFC')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .text(data.summary.totalMessages);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.3em')
      .attr('fill', isLight ? '#64748B' : '#94A3B8')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .text('Msgs');
  }, [data, isLight, isLoading]);

  // Render D3 Model Usage Over Time (Stacked Multi-Series Area / Line)
  useEffect(() => {
    if (!data || !modelSvgRef.current || isLoading) return;

    const svg = d3.select(modelSvgRef.current);
    svg.selectAll('*').remove();

    const rawData = data.dailyFrequency;
    if (rawData.length === 0) return;

    const containerWidth = modelSvgRef.current.parentElement?.clientWidth || 600;
    const width = Math.max(340, containerWidth);
    const height = 220;
    const margin = { top: 20, right: 24, bottom: 36, left: 42 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const models = [
      { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', color: '#6366F1' },
      { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', color: '#06B6D4' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', color: '#10B981' },
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', color: '#A855F7' },
    ];

    // X Scale
    const xScale = d3
      .scalePoint<string>()
      .domain(rawData.map((d) => d.date))
      .range([0, innerWidth])
      .padding(0.2);

    // Compute max for y scale
    let maxModelCount = 5;
    rawData.forEach((d) => {
      models.forEach((m) => {
        const c = d.modelCounts[m.id] || 0;
        if (c > maxModelCount) maxModelCount = c;
      });
    });

    const yScale = d3
      .scaleLinear()
      .domain([0, maxModelCount * 1.2])
      .nice()
      .range([innerHeight, 0]);

    // Grid lines
    g.append('g')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(4)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)')
      .attr('stroke-dasharray', '3 3');

    g.select('.domain').remove();

    // X axis
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(
        rawData
          .filter((_, idx) => {
            if (rawData.length <= 7) return true;
            if (rawData.length <= 14) return idx % 2 === 0;
            return idx % 4 === 0;
          })
          .map((d) => d.date)
      )
      .tickFormat((dateStr) => {
        const item = rawData.find((d) => d.date === dateStr);
        return item ? item.label : '';
      });

    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup
      .selectAll('text')
      .attr('fill', isLight ? '#64748B' : '#94A3B8')
      .attr('font-size', '11px');

    xAxisGroup.select('.domain').attr('stroke', isLight ? '#CBD5E1' : '#334155');
    xAxisGroup.selectAll('line').attr('stroke', isLight ? '#CBD5E1' : '#334155');

    // Y axis
    const yAxis = d3.axisLeft(yScale).ticks(4).tickFormat(d3.format('d'));
    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup
      .selectAll('text')
      .attr('fill', isLight ? '#64748B' : '#94A3B8')
      .attr('font-size', '11px');
    yAxisGroup.select('.domain').remove();
    yAxisGroup.selectAll('line').remove();

    // Draw a smooth line for each active model
    models.forEach((m) => {
      const lineGen = d3
        .line<DailyFrequency>()
        .curve(d3.curveMonotoneX)
        .x((d) => xScale(d.date) || 0)
        .y((d) => yScale(d.modelCounts[m.id] || 0));

      const path = g
        .append('path')
        .datum(rawData)
        .attr('fill', 'none')
        .attr('stroke', m.color)
        .attr('stroke-width', 2.2)
        .attr('d', lineGen);

      const totalLength = path.node()?.getTotalLength() || 0;
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(700)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    });
  }, [data, isLight, isLoading]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden border transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-[#181818] border-[#2A2A2A] text-slate-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between border-b shrink-0 ${
            isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#2A2A2A] bg-[#141414]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight flex items-center gap-2">
                <span>Usage Analytics &amp; Insights</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  D3.js Real-time
                </span>
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                Visualizing chat activity, prompt density, and Gemini model allocation over time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Time range selector */}
            <div
              className={`flex items-center p-0.5 rounded-lg border text-xs ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#222222] border-[#333333]'
              }`}
            >
              {([7, 14, 30] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    timeRange === r
                      ? isLight
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'bg-[#2E2E2E] text-white shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {r}d
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchAnalytics(timeRange)}
              title="Refresh Analytics"
              disabled={isLoading}
              className={`p-2 rounded-lg border transition-all ${
                isLight
                  ? 'border-slate-200 hover:bg-slate-100 text-slate-600'
                  : 'border-[#333333] hover:bg-[#2A2A2A] text-neutral-300'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#2A2A2A] text-neutral-400'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => fetchAnalytics(timeRange)}
                className="underline hover:text-red-300 font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className={`p-3.5 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1F1F1F] border-[#2A2A2A]'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                <span>Total Messages</span>
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-xl font-bold tracking-tight">
                {isLoading ? '...' : data?.summary.totalMessages ?? 0}
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                {data?.summary.totalPrompts ?? 0} user queries
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1F1F1F] border-[#2A2A2A]'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                <span>Primary Model</span>
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-sm font-bold truncate">
                {isLoading ? '...' : data?.summary.topModel ?? 'Gemini 3.7 Flash'}
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                Highest throughput
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1F1F1F] border-[#2A2A2A]'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                <span>Active Days</span>
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-bold tracking-tight">
                {isLoading ? '...' : `${data?.summary.activeDaysCount ?? 0} / ${timeRange}d`}
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                Consistent workflow
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1F1F1F] border-[#2A2A2A]'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                <span>Peak Hour</span>
                <Clock className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-base font-bold tracking-tight">
                {isLoading ? '...' : data?.summary.peakHour ?? '2:00 PM'}
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                Most engaged period
              </div>
            </div>
          </div>

          {/* Chart 1: Chat Frequency Over Time */}
          <div
            className={`p-4 rounded-xl border ${
              isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#1E1E1E] border-[#2A2A2A]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <span>Chat Frequency Over Time</span>
                  <span className="text-[11px] font-normal text-neutral-400">
                    (Past {timeRange} days)
                  </span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Total interaction turns (user prompts &amp; assistant completions)
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Line vs Bar toggle */}
                <div
                  className={`flex items-center p-0.5 rounded-lg border text-xs ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#141414] border-[#333333]'
                  }`}
                >
                  <button
                    onClick={() => setChartView('line')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      chartView === 'line'
                        ? isLight
                          ? 'bg-slate-100 text-slate-900 shadow-xs'
                          : 'bg-[#2A2A2A] text-white shadow-xs'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Area Curve
                  </button>
                  <button
                    onClick={() => setChartView('bar')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      chartView === 'bar'
                        ? isLight
                          ? 'bg-slate-100 text-slate-900 shadow-xs'
                          : 'bg-[#2A2A2A] text-white shadow-xs'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Bars
                  </button>
                </div>
              </div>
            </div>

            {/* D3 SVG Container */}
            <div className="relative w-full">
              <svg ref={freqSvgRef} className="w-full h-auto overflow-visible select-none" />

              {/* Tooltip on Hover */}
              {hoveredDay && (
                <div
                  className={`absolute top-2 right-2 px-3 py-2 rounded-lg border text-xs shadow-lg pointer-events-none transition-all ${
                    isLight
                      ? 'bg-white/95 border-slate-200 text-slate-800'
                      : 'bg-[#141414]/95 border-[#333333] text-neutral-200'
                  }`}
                >
                  <div className="font-semibold">{hoveredDay.label} ({hoveredDay.dayOfWeek})</div>
                  <div className="text-[11px] text-indigo-400 font-medium">
                    {hoveredDay.totalMessages} Total Messages
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1 space-y-0.5">
                    <div>User queries: {hoveredDay.userMessages}</div>
                    <div>Completions: {hoveredDay.assistantMessages}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Model Usage Over Time & Distribution Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Model Usage Over Time Multi-Series Line Chart */}
            <div
              className={`lg:col-span-2 p-4 rounded-xl border ${
                isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#1E1E1E] border-[#2A2A2A]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold">Model Usage Over Time</h3>
                  <p className="text-xs text-neutral-500">
                    Comparative throughput across models per day
                  </p>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
                    <span>3.7 Flash</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" />
                    <span>3.1 Lite</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    <span>2.5 Flash</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" />
                    <span>3.1 Pro</span>
                  </span>
                </div>
              </div>

              <div className="w-full">
                <svg ref={modelSvgRef} className="w-full h-auto overflow-visible select-none" />
              </div>
            </div>

            {/* Model Distribution Donut & Legend */}
            <div
              className={`p-4 rounded-xl border flex flex-col items-center justify-between ${
                isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#1E1E1E] border-[#2A2A2A]'
              }`}
            >
              <div className="w-full text-left mb-1">
                <h3 className="text-sm font-semibold">Model Share</h3>
                <p className="text-xs text-neutral-500">Overall ratio in period</p>
              </div>

              <div className="w-44 h-44 my-2 flex items-center justify-center relative">
                <svg ref={donutSvgRef} className="w-full h-full overflow-visible" />
              </div>

              {/* Model Share Legend List */}
              <div className="w-full space-y-1.5 pt-2 border-t border-neutral-700/30 text-xs">
                {data?.modelBreakdown.map((m) => (
                  <div
                    key={m.model}
                    className="flex items-center justify-between text-neutral-300 text-[11px]"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: m.color }}
                      />
                      <span className="truncate">{m.name}</span>
                    </span>
                    <span className="font-mono font-medium text-neutral-400 shrink-0">
                      {m.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between text-xs shrink-0 ${
            isLight ? 'border-slate-100 bg-slate-50 text-slate-500' : 'border-[#2A2A2A] bg-[#141414] text-neutral-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connected to RO API Analytics Service</span>
          </div>

          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg font-medium transition-colors ${
              isLight
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                : 'bg-[#2A2A2A] hover:bg-[#333333] text-white'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
