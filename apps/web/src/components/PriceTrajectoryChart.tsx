'use client';

import React, { useState } from 'react';
import { TrendingUp, ShieldCheck, HelpCircle } from 'lucide-react';

export interface TrajectoryPoint {
  dayOffset: number;
  label: string;
  price: number;
  isProjected: boolean;
  lowerCi?: number;
  upperCi?: number;
}

interface PriceTrajectoryChartProps {
  commodity: string;
  currentModalPrice: number;
  predictedPrice: number;
  mspFloor: number;
  trajectory: TrajectoryPoint[];
  demandSignal: string;
  confidenceScore?: number;
}

export default function PriceTrajectoryChart({
  commodity,
  currentModalPrice,
  predictedPrice,
  mspFloor,
  trajectory,
  demandSignal,
  confidenceScore = 0.94,
}: PriceTrajectoryChartProps) {
  const [activePoint, setActivePoint] = useState<TrajectoryPoint | null>(null);

  if (!trajectory || trajectory.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
        Aggregating APMC price points...
      </div>
    );
  }

  // Calculate chart bounds
  const prices = trajectory.map((p) => p.price);
  const uppers = trajectory.map((p) => p.upperCi ?? p.price);
  const lowers = trajectory.map((p) => p.lowerCi ?? p.price);
  const allValues = [...prices, ...uppers, ...lowers, mspFloor > 0 ? mspFloor : currentModalPrice];
  const minVal = Math.floor(Math.min(...allValues) * 0.92);
  const maxVal = Math.ceil(Math.max(...allValues) * 1.08);
  const range = maxVal - minVal || 1;

  // SVG dimensions & padding
  const width = 720;
  const height = 280;
  const padLeft = 56;
  const padRight = 36;
  const padTop = 32;
  const padBottom = 48;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const getX = (index: number) => padLeft + (index / (trajectory.length - 1)) * chartW;
  const getY = (val: number) => padTop + chartH - ((val - minVal) / range) * chartH;

  // Split into historical and projected
  const spotIndex = trajectory.findIndex((p) => p.dayOffset === 0);
  const histPoints = trajectory.slice(0, (spotIndex === -1 ? trajectory.length : spotIndex) + 1);
  const projPoints = trajectory.slice(spotIndex === -1 ? 0 : spotIndex);

  // Generate SVG paths
  const histPath = histPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.price)}`)
    .join(' ');

  const projPath = projPoints
    .map((p, i) => {
      const idx = spotIndex + i;
      return `${i === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.price)}`;
    })
    .join(' ');

  // Confidence Interval Area Polygon for projected points
  let ciPolygon = '';
  if (projPoints.length > 1) {
    const topPoints = projPoints.map((p, i) => `${getX(spotIndex + i)},${getY(p.upperCi ?? p.price)}`);
    const bottomPoints = [...projPoints]
      .reverse()
      .map((p, i) => `${getX(spotIndex + (projPoints.length - 1 - i))},${getY(p.lowerCi ?? p.price)}`);
    ciPolygon = `${topPoints.join(' ')} ${bottomPoints.join(' ')}`;
  }

  // MSP Line Y
  const mspY = mspFloor > 0 ? getY(mspFloor) : null;

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-4">
      {/* Chart Header & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
              Real-Time APMC Price & Horizon Curve
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-mono font-bold">
              {demandSignal}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-zinc-950 dark:text-zinc-50 mt-0.5">
            {commodity} Trajectory: Past 14-Day Baseline → +14-Day Future Projection
          </h3>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-zinc-900 dark:bg-zinc-100 inline-block"></span>
            <span>Historical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-600 dark:border-emerald-400 inline-block"></span>
            <span>AI Projected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xs inline-block"></span>
            <span>80% CI</span>
          </div>
          {mspFloor > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500 inline-block"></span>
              <span>MSP Floor</span>
            </div>
          )}
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative w-full overflow-x-auto pb-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[540px] select-none"
        >
          {/* Subtle Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padTop + chartH * pct;
            const priceLabel = Math.round(maxVal - pct * range);
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-zinc-100 dark:text-zinc-800"
                  strokeDasharray="4 4"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-zinc-400 dark:fill-zinc-600 text-[10px] font-mono font-medium"
                >
                  ₹{priceLabel}
                </text>
              </g>
            );
          })}

          {/* Statutory MSP Reference Floor */}
          {mspY !== null && mspY >= padTop && mspY <= padTop + chartH && (
            <g>
              <line
                x1={padLeft}
                y1={mspY}
                x2={width - padRight}
                y2={mspY}
                stroke="#f59e0b"
                strokeWidth="1.75"
                strokeDasharray="6 3"
              />
              <text
                x={width - padRight}
                y={mspY - 6}
                textAnchor="end"
                className="fill-amber-600 dark:fill-amber-400 text-[10px] font-mono font-bold"
              >
                MSP Floor: ₹{mspFloor.toFixed(2)}/kg
              </text>
            </g>
          )}

          {/* Confidence Interval Shaded Area */}
          {ciPolygon && (
            <polygon
              points={ciPolygon}
              className="fill-emerald-500/15 dark:fill-emerald-400/20"
            />
          )}

          {/* Historical Price Curve */}
          <path
            d={histPath}
            fill="none"
            className="stroke-zinc-900 dark:stroke-zinc-100"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Projected Price Curve */}
          <path
            d={projPath}
            fill="none"
            className="stroke-emerald-600 dark:stroke-emerald-400"
            strokeWidth="2.5"
            strokeDasharray="5 4"
            strokeLinecap="round"
          />

          {/* Divider at Spot Price ("Today") */}
          {spotIndex !== -1 && (
            <g>
              <line
                x1={getX(spotIndex)}
                y1={padTop}
                x2={getX(spotIndex)}
                y2={padTop + chartH}
                className="stroke-zinc-300 dark:stroke-zinc-700"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={getX(spotIndex)}
                y={padTop - 8}
                textAnchor="middle"
                className="fill-zinc-700 dark:fill-zinc-300 text-[10px] font-mono font-bold"
              >
                Today (Spot)
              </text>
            </g>
          )}

          {/* Data Points */}
          {trajectory.map((p, idx) => {
            const cx = getX(idx);
            const cy = getY(p.price);
            const isSpot = p.dayOffset === 0;
            const isHovered = activePoint?.dayOffset === p.dayOffset;

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setActivePoint(p)}
                onMouseLeave={() => setActivePoint(null)}
              >
                {/* Invisible hover target */}
                <circle cx={cx} cy={cy} r="16" fill="transparent" />

                {/* Point circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : isSpot ? 5 : 3.5}
                  className={
                    isSpot
                      ? 'fill-zinc-950 dark:fill-white stroke-2 stroke-white dark:stroke-zinc-950'
                      : p.isProjected
                      ? 'fill-emerald-600 dark:fill-emerald-400 stroke-2 stroke-white dark:stroke-zinc-900'
                      : 'fill-zinc-600 dark:fill-zinc-400'
                  }
                />

                {/* X-axis label */}
                <text
                  x={cx}
                  y={height - padBottom + 18}
                  textAnchor="middle"
                  className={`text-[10px] font-mono ${
                    isSpot
                      ? 'fill-zinc-950 dark:fill-white font-bold'
                      : p.isProjected
                      ? 'fill-emerald-700 dark:fill-emerald-400 font-semibold'
                      : 'fill-zinc-400 dark:fill-zinc-500'
                  }`}
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip */}
        {activePoint && (
          <div className="absolute top-2 right-4 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 p-3 rounded-xl shadow-lg border border-zinc-800 dark:border-zinc-200 text-xs font-mono z-10 transition-all pointer-events-none">
            <div className="text-[10px] text-zinc-400 dark:text-zinc-600 font-bold uppercase">
              {activePoint.dayOffset === 0
                ? 'Current Spot Price'
                : activePoint.isProjected
                ? `Forecast Horizon: ${activePoint.label}`
                : `Past Clearing: ${activePoint.label}`}
            </div>
            <div className="text-base font-extrabold mt-0.5">
              ₹{activePoint.price.toFixed(2)} <span className="text-xs font-normal">/ kg</span>
            </div>
            {activePoint.lowerCi !== undefined && activePoint.upperCi !== undefined && (
              <div className="text-[10px] text-emerald-400 dark:text-emerald-700 mt-1">
                80% CI: ₹{activePoint.lowerCi.toFixed(2)} – ₹{activePoint.upperCi.toFixed(2)}/kg
              </div>
            )}
            {mspFloor > 0 && (
              <div className="text-[10px] text-amber-400 dark:text-amber-700">
                Statutory MSP: ₹{mspFloor.toFixed(2)}/kg
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trajectory Horizon Targets Quick Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
        {[
          { label: 'Spot Modal', price: currentModalPrice, delta: 0, tag: 'Live APMC' },
          { label: '+3 Days Target', price: trajectory.find((p) => p.dayOffset === 3)?.price ?? predictedPrice, delta: '+1.6%', tag: 'Short Lag' },
          { label: '+7 Days Target', price: trajectory.find((p) => p.dayOffset === 7)?.price ?? predictedPrice, delta: '+3.8%', tag: 'Median Lag' },
          { label: '+14 Days Target', price: trajectory.find((p) => p.dayOffset === 14)?.price ?? predictedPrice, delta: '+6.2%', tag: 'Monthly Lag' },
        ].map((h, i) => (
          <div
            key={i}
            className="p-3 bg-zinc-50 dark:bg-zinc-850/60 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>{h.label}</span>
              <span className="text-[9px] px-1 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
                {h.tag}
              </span>
            </div>
            <div className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50 font-mono mt-0.5">
              ₹{h.price?.toFixed(2)}/kg
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
