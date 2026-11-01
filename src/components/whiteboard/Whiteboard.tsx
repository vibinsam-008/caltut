import React, { useState, useMemo, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Sliders,
  Layers,
  ZoomIn,
  ZoomOut,
  HelpCircle,
} from 'lucide-react';
import { WhiteboardVisualSpec } from '../../types';
import { safeEvalFn } from '../../math/math-engine';
import { MathView } from '../MathView';

interface WhiteboardProps {
  spec?: WhiteboardVisualSpec;
  className?: string;
  onParameterChange?: (paramName: string, value: number) => void;
}

export const Whiteboard: React.FC<WhiteboardProps> = ({ spec, className = '', onParameterChange }) => {
  const [params, setParams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    spec?.parameters?.forEach((p) => {
      initial[p.name] = p.currentValue;
    });
    return initial;
  });

  const [activeStripMode, setActiveStripMode] = useState<'vertical' | 'horizontal'>('vertical');
  const [slicePosition, setSlicePosition] = useState<number>(1.0);
  const [zoomFactor, setZoomFactor] = useState<number>(1.0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Default coordinate boundaries
  const defaultXRange: [number, number] = spec?.xRange || [-1, 3];
  const defaultYRange: [number, number] = spec?.yRange || [-1, 5];

  const xRange = useMemo<[number, number]>(() => {
    const mid = (defaultXRange[0] + defaultXRange[1]) / 2;
    const span = (defaultXRange[1] - defaultXRange[0]) / zoomFactor;
    return [mid - span / 2, mid + span / 2];
  }, [defaultXRange, zoomFactor]);

  const yRange = useMemo<[number, number]>(() => {
    const mid = (defaultYRange[0] + defaultYRange[1]) / 2;
    const span = (defaultYRange[1] - defaultYRange[0]) / zoomFactor;
    return [mid - span / 2, mid + span / 2];
  }, [defaultYRange, zoomFactor]);

  // SVG coordinate transformation
  const width = 600;
  const height = 440;
  const padding = 40;

  const toSvgX = (x: number) => {
    return padding + ((x - xRange[0]) / (xRange[1] - xRange[0])) * (width - 2 * padding);
  };

  const toSvgY = (y: number) => {
    // Invert Y for Cartesian coordinates
    return height - padding - ((y - yRange[0]) / (yRange[1] - yRange[0])) * (height - 2 * padding);
  };

  // Generate ticks for coordinate grid
  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = (xRange[1] - xRange[0]) > 8 ? 2 : 1;
    const start = Math.ceil(xRange[0]);
    for (let t = start; t <= xRange[1]; t += step) {
      ticks.push(t);
    }
    return ticks;
  }, [xRange]);

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = (yRange[1] - yRange[0]) > 8 ? 2 : 1;
    const start = Math.ceil(yRange[0]);
    for (let t = start; t <= yRange[1]; t += step) {
      ticks.push(t);
    }
    return ticks;
  }, [yRange]);

  // Sample points for curve paths
  const curvePaths = useMemo(() => {
    if (!spec?.functions) return [];

    const numSamples = 140;
    const xStep = (xRange[1] - xRange[0]) / numSamples;

    return spec.functions.map((fn) => {
      let d = '';
      let isFirst = true;

      for (let i = 0; i <= numSamples; i++) {
        const x = xRange[0] + i * xStep;
        const scope = { x, y: 0, ...params };
        const y = safeEvalFn(fn.fnString, scope);

        if (!isNaN(y) && isFinite(y) && y >= yRange[0] - 2 && y <= yRange[1] + 2) {
          const sx = toSvgX(x);
          const sy = toSvgY(y);
          if (isFirst) {
            d += `M ${sx.toFixed(1)} ${sy.toFixed(1)}`;
            isFirst = false;
          } else {
            d += ` L ${sx.toFixed(1)} ${sy.toFixed(1)}`;
          }
        } else {
          isFirst = true; // start new segment if pole or undefined
        }
      }

      return {
        id: fn.id,
        path: d,
        color: fn.color,
        label: fn.label,
        expression: fn.expression,
        style: fn.style,
      };
    });
  }, [spec?.functions, xRange, yRange, params]);

  // Shaded integration region polygon
  const regionPolygon = useMemo(() => {
    if (!spec?.region) return null;

    const { lowerBoundFn, upperBoundFn, xMin, xMax } = spec.region;
    const samples = 60;
    const step = (xMax - xMin) / samples;

    const upperPts: [number, number][] = [];
    const lowerPts: [number, number][] = [];

    for (let i = 0; i <= samples; i++) {
      const x = xMin + i * step;
      const yLow = safeEvalFn(lowerBoundFn, { x, ...params });
      const yHigh = safeEvalFn(upperBoundFn, { x, ...params });

      if (!isNaN(yLow) && !isNaN(yHigh)) {
        upperPts.push([toSvgX(x), toSvgY(yHigh)]);
        lowerPts.push([toSvgX(x), toSvgY(yLow)]);
      }
    }

    if (upperPts.length < 2) return null;

    let d = `M ${upperPts[0][0].toFixed(1)} ${upperPts[0][1].toFixed(1)}`;
    for (let i = 1; i < upperPts.length; i++) {
      d += ` L ${upperPts[i][0].toFixed(1)} ${upperPts[i][1].toFixed(1)}`;
    }
    for (let i = lowerPts.length - 1; i >= 0; i--) {
      d += ` L ${lowerPts[i][0].toFixed(1)} ${lowerPts[i][1].toFixed(1)}`;
    }
    d += ' Z';

    return {
      path: d,
      color: spec.region.color || '#6366f1',
      opacity: spec.region.opacity || 0.3,
    };
  }, [spec?.region, params, xRange, yRange]);

  // Interactive Slice Coordinates
  const sliceVisual = useMemo(() => {
    if (!spec?.region) return null;

    if (activeStripMode === 'vertical') {
      // Vertical Strip at x = slicePosition
      const x = Math.max(spec.region.xMin, Math.min(spec.region.xMax, slicePosition));
      const yLow = safeEvalFn(spec.region.lowerBoundFn, { x, ...params });
      const yHigh = safeEvalFn(spec.region.upperBoundFn, { x, ...params });

      if (isNaN(yLow) || isNaN(yHigh)) return null;

      const sx = toSvgX(x);
      const syLow = toSvgY(yLow);
      const syHigh = toSvgY(yHigh);

      return {
        type: 'vertical' as const,
        x1: sx,
        x2: sx,
        y1: syLow,
        y2: syHigh,
        enterLabel: `(x, y_bottom) = (${x.toFixed(2)}, ${yLow.toFixed(2)})`,
        exitLabel: `(x, y_top) = (${x.toFixed(2)}, ${yHigh.toFixed(2)})`,
        stripWidth: 6,
      };
    } else {
      // Horizontal Strip at y = slicePosition
      const y = slicePosition;
      // Invert boundaries numerically or approximate
      // For y = x^2 and y = 2x: x_left = y/2, x_right = sqrt(y)
      const xLeft = y / 2;
      const xRight = Math.sqrt(Math.max(0, y));

      const sy = toSvgY(y);
      const sxLeft = toSvgX(xLeft);
      const sxRight = toSvgX(xRight);

      return {
        type: 'horizontal' as const,
        x1: sxLeft,
        x2: sxRight,
        y1: sy,
        y2: sy,
        enterLabel: `x_left = y/2 (${xLeft.toFixed(2)})`,
        exitLabel: `x_right = √y (${xRight.toFixed(2)})`,
        stripWidth: 6,
      };
    }
  }, [spec?.region, activeStripMode, slicePosition, params, xRange, yRange]);

  const handleParamChange = (name: string, val: number) => {
    setParams((prev) => ({ ...prev, [name]: val }));
    onParameterChange?.(name, val);
  };

  const resetView = () => {
    setZoomFactor(1.0);
    setSlicePosition(1.0);
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
            <span>{spec?.title || 'Interactive Mathematical Whiteboard'}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-mono">
              2D Analysis
            </span>
          </h3>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2 py-1 rounded border transition-colors ${
              showGrid
                ? 'bg-indigo-900/50 border-indigo-700 text-indigo-200'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle Grid"
          >
            Grid
          </button>
          <button
            onClick={() => setZoomFactor((z) => Math.min(2.5, z + 0.2))}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomFactor((z) => Math.max(0.6, z - 0.2))}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetView}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
            title="Reset View"
            aria-label="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main SVG Coordinate Canvas */}
      <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-2 select-none overflow-hidden min-h-[360px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full max-h-[460px] drop-shadow-md"
        >
          <defs>
            <pattern id="whiteboard-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
            <linearGradient id="regionGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Coordinate Grid Background */}
          {showGrid && (
            <rect
              x={padding}
              y={padding}
              width={width - 2 * padding}
              height={height - 2 * padding}
              fill="url(#whiteboard-grid)"
              opacity={0.6}
            />
          )}

          {/* X Axis */}
          <line
            x1={padding}
            y1={toSvgY(0)}
            x2={width - padding}
            y2={toSvgY(0)}
            stroke="#475569"
            strokeWidth="1.5"
          />
          {/* Y Axis */}
          <line
            x1={toSvgX(0)}
            y1={padding}
            x2={toSvgX(0)}
            y2={height - padding}
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* Axis Arrowheads */}
          <polygon
            points={`${width - padding},${toSvgY(0) - 3} ${width - padding + 6},${toSvgY(0)} ${width - padding},${toSvgY(0) + 3}`}
            fill="#64748b"
          />
          <polygon
            points={`${toSvgX(0) - 3},${padding} ${toSvgX(0)},${padding - 6} ${toSvgX(0) + 3},${padding}`}
            fill="#64748b"
          />

          {/* X Ticks & Labels */}
          {xTicks.map((x) => (
            <g key={`xtick-${x}`}>
              <line
                x1={toSvgX(x)}
                y1={toSvgY(0) - 3}
                x2={toSvgX(x)}
                y2={toSvgY(0) + 3}
                stroke="#64748b"
                strokeWidth="1"
              />
              {showLabels && x !== 0 && (
                <text
                  x={toSvgX(x)}
                  y={toSvgY(0) + 16}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {x}
                </text>
              )}
            </g>
          ))}

          {/* Y Ticks & Labels */}
          {yTicks.map((y) => (
            <g key={`ytick-${y}`}>
              <line
                x1={toSvgX(0) - 3}
                y1={toSvgY(y)}
                x2={toSvgX(0) + 3}
                y2={toSvgY(y)}
                stroke="#64748b"
                strokeWidth="1"
              />
              {showLabels && y !== 0 && (
                <text
                  x={toSvgX(0) - 8}
                  y={toSvgY(y) + 3}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {y}
                </text>
              )}
            </g>
          ))}

          {/* Axis Labels */}
          <text
            x={width - padding + 12}
            y={toSvgY(0) + 4}
            fill="#cbd5e1"
            fontSize="12"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            {spec?.xAxisLabel || 'x'}
          </text>
          <text
            x={toSvgX(0)}
            y={padding - 10}
            fill="#cbd5e1"
            fontSize="12"
            fontWeight="bold"
            fontFamily="sans-serif"
            textAnchor="middle"
          >
            {spec?.yAxisLabel || 'y'}
          </text>

          {/* Shaded Bounded Region */}
          {regionPolygon && (
            <path
              d={regionPolygon.path}
              fill="url(#regionGlow)"
              stroke="#818cf8"
              strokeWidth="1"
              strokeDasharray="4 2"
            />
          )}

          {/* Plotted Function Curves */}
          {curvePaths.map((c) => (
            <g key={c.id}>
              <path
                d={c.path}
                fill="none"
                stroke={c.color}
                strokeWidth="2.5"
                strokeDasharray={c.style === 'dashed' ? '5 4' : undefined}
                className="transition-all duration-200"
              />
              {c.label && (
                <text
                  x={toSvgX(defaultXRange[1] * 0.75)}
                  y={toSvgY(safeEvalFn(c.expression.replace(/.*=\s*/, ''), { x: defaultXRange[1] * 0.75, ...params })) - 8}
                  fill={c.color}
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {c.label}
                </text>
              )}
            </g>
          ))}

          {/* Interactive Integration Slice Strip (Vertical dy dx or Horizontal dx dy) */}
          {sliceVisual && (
            <g className="cursor-ew-resize">
              {sliceVisual.type === 'vertical' ? (
                <>
                  <rect
                    x={sliceVisual.x1 - 3}
                    y={sliceVisual.y2}
                    width={6}
                    height={Math.max(2, sliceVisual.y1 - sliceVisual.y2)}
                    fill="#fbbf24"
                    fillOpacity="0.6"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                  />
                  <circle cx={sliceVisual.x1} cy={sliceVisual.y1} r="4" fill="#fbbf24" />
                  <circle cx={sliceVisual.x1} cy={sliceVisual.y2} r="4" fill="#fbbf24" />
                  <text
                    x={sliceVisual.x1 + 8}
                    y={(sliceVisual.y1 + sliceVisual.y2) / 2}
                    fill="#fef08a"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    dy dx Strip
                  </text>
                </>
              ) : (
                <>
                  <rect
                    x={sliceVisual.x1}
                    y={sliceVisual.y1 - 3}
                    width={Math.max(2, sliceVisual.x2 - sliceVisual.x1)}
                    height={6}
                    fill="#34d399"
                    fillOpacity="0.6"
                    stroke="#10b981"
                    strokeWidth="1.5"
                  />
                  <circle cx={sliceVisual.x1} cy={sliceVisual.y1} r="4" fill="#34d399" />
                  <circle cx={sliceVisual.x2} cy={sliceVisual.y2} r="4" fill="#34d399" />
                  <text
                    x={(sliceVisual.x1 + sliceVisual.x2) / 2}
                    y={sliceVisual.y1 - 8}
                    fill="#a7f3d0"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    dx dy Strip
                  </text>
                </>
              )}
            </g>
          )}

          {/* Critical Points and Labels */}
          {spec?.points?.map((pt, idx) => (
            <g key={`pt-${idx}`}>
              <circle
                cx={toSvgX(pt.x)}
                cy={toSvgY(pt.y)}
                r="5"
                fill={pt.color || '#38bdf8'}
                stroke="#ffffff"
                strokeWidth="1.5"
                className="animate-pulse"
              />
              <text
                x={toSvgX(pt.x) + 7}
                y={toSvgY(pt.y) - 6}
                fill={pt.color || '#38bdf8'}
                fontSize="10"
                fontWeight="bold"
              >
                {pt.label}
              </text>
            </g>
          ))}

          {/* Annotations */}
          {spec?.annotations?.map((an, idx) => (
            <text
              key={`ann-${idx}`}
              x={toSvgX(an.x)}
              y={toSvgY(an.y)}
              fill="#cbd5e1"
              fontSize="11"
              fontStyle="italic"
              textAnchor={an.align === 'center' ? 'middle' : an.align === 'right' ? 'end' : 'start'}
            >
              {an.text}
            </text>
          ))}
        </svg>

        {/* Legend / Overlay overlay */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-md p-2 text-xs text-slate-300 pointer-events-none space-y-1">
          <div className="font-semibold text-slate-100 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Region & Boundary Curves</span>
          </div>
          {spec?.functions?.map((f) => (
            <div key={`legend-${f.id}`} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: f.color }} />
              <span className="font-mono text-[11px] text-slate-200">{f.label || f.expression}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Controls Bar for Strip & Parameter Exploration */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Strip order selector (Mode D requirement: Multiple-integral region and integration-limit visualization) */}
        {spec?.region && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Order of Slicing:</span>
            <div className="flex rounded-md bg-slate-800 p-0.5 border border-slate-700">
              <button
                onClick={() => setActiveStripMode('vertical')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeStripMode === 'vertical'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-600/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Vertical Slices (dy dx)
              </button>
              <button
                onClick={() => setActiveStripMode('horizontal')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeStripMode === 'horizontal'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-600/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Horizontal Slices (dx dy)
              </button>
            </div>

            {/* Slider for strip location */}
            <div className="flex items-center gap-2 ml-2">
              <span className="text-slate-400">Position:</span>
              <input
                type="range"
                min={activeStripMode === 'vertical' ? (spec.region.xMin || 0) : 0}
                max={activeStripMode === 'vertical' ? (spec.region.xMax || 2) : 4}
                step={0.1}
                value={slicePosition}
                onChange={(e) => setSlicePosition(parseFloat(e.target.value))}
                className="w-24 accent-amber-500 cursor-pointer"
              />
              <span className="font-mono text-slate-200 w-8">{slicePosition.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* Dynamic Parameter Sliders if defined */}
        {spec?.parameters && spec.parameters.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Parameters:</span>
            </div>
            {spec.parameters.map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="text-slate-400">{p.label}:</span>
                <input
                  type="range"
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  value={params[p.name] ?? p.currentValue}
                  onChange={(e) => handleParamChange(p.name, parseFloat(e.target.value))}
                  className="w-20 accent-indigo-500 cursor-pointer"
                />
                <span className="font-mono text-indigo-300 text-xs">
                  {(params[p.name] ?? p.currentValue).toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
