'use client';

import React, { useState, useEffect } from 'react';
import { CloudRain, Wind, Thermometer, ShieldCheck, AlertTriangle, RefreshCw, Sun } from 'lucide-react';
import { AgroWeatherAdvisory } from '../app/api/weather/advisory/route';

interface WeatherAdvisoryWidgetProps {
  crop?: string;
  lat?: number;
  lng?: number;
}

export default function WeatherAdvisoryWidget({
  crop = 'Wheat',
  lat = 26.9124,
  lng = 75.7873,
}: WeatherAdvisoryWidgetProps) {
  const [advisory, setAdvisory] = useState<AgroWeatherAdvisory | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdvisory = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/weather/advisory?lat=${lat}&lng=${lng}&crop=${encodeURIComponent(crop)}`);
      if (res.ok) {
        const json = await res.json();
        setAdvisory(json.advisory);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [crop, lat, lng]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch(`/api/weather/advisory?lat=${lat}&lng=${lng}&crop=${encodeURIComponent(crop)}`);
        if (res.ok && !ignore) {
          const json = await res.json();
          setAdvisory(json.advisory);
        }
      } catch {
        // ignore
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [crop, lat, lng]);

  if (loading && !advisory) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 animate-pulse">
        <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-4" />
        <div className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl mb-4" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
          <div className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
          <div className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!advisory) return null;

  const { current, sprayingAdvisory, harvestAlert, dailyForecast } = advisory;

  const isOptimal = sprayingAdvisory.status === 'OPTIMAL';
  const isModerate = sprayingAdvisory.status === 'MODERATE_CAUTION';

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-semibold mb-2">
            <Sun className="w-3.5 h-3.5" />
            <span>Open-Meteo Free Agromet Telemetry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">
            Weather & Field Advisory ({crop})
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Real-time agro-meteorology and foliar spraying safety windows for field operations.
          </p>
        </div>

        <button
          onClick={fetchAdvisory}
          className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300 transition-colors shrink-0 self-start sm:self-auto"
          title="Refresh weather"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Primary Spraying Advisory Banner */}
      <div
        className={`p-5 rounded-2xl border mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isOptimal
            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
            : isModerate
            ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100'
            : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
        }`}
      >
        <div className="flex items-start gap-3">
          {isOptimal ? (
            <ShieldCheck className="w-6 h-6 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          ) : (
            <AlertTriangle className="w-6 h-6 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          )}
          <div>
            <span className="font-bold text-sm sm:text-base block">{sprayingAdvisory.headline}</span>
            <span className="text-xs opacity-90 block mt-1">{sprayingAdvisory.reason}</span>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-current/20 text-xs font-mono font-bold shrink-0">
          Window: {sprayingAdvisory.windowNextHours}h Safe
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temperature</span>
          </div>
          <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {current.temperature.toFixed(1)}°C
          </span>
          <span className="text-[11px] text-zinc-400 block mt-0.5">{current.weatherDescription}</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
            <Wind className="w-3.5 h-3.5" />
            <span>Wind Speed</span>
          </div>
          <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {current.windSpeedKmH.toFixed(1)} km/h
          </span>
          <span className={`text-[11px] font-medium block mt-0.5 ${sprayingAdvisory.windSafe ? 'text-emerald-600' : 'text-rose-600'}`}>
            {sprayingAdvisory.windSafe ? 'Low Drift Risk' : 'High Drift Risk (>15km/h)'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
            <CloudRain className="w-3.5 h-3.5" />
            <span>Precipitation (4h)</span>
          </div>
          <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {current.precipitationProbability}%
          </span>
          <span className={`text-[11px] font-medium block mt-0.5 ${sprayingAdvisory.rainSafe ? 'text-emerald-600' : 'text-rose-600'}`}>
            {sprayingAdvisory.rainSafe ? 'Dry Field Surface' : 'Washout Hazard'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Harvest Window</span>
          </div>
          <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {harvestAlert.safeForHarvest ? 'Optimal' : 'Caution'}
          </span>
          <span className="text-[11px] text-zinc-400 block mt-0.5">WDRA intake ready</span>
        </div>
      </div>

      {/* 4-Day Forecast Strip */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-3">
          4-Day Agro-Meteorological Outlook
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {dailyForecast.slice(0, 4).map((d) => (
            <div
              key={d.date}
              className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 text-xs"
            >
              <span className="font-bold block text-zinc-800 dark:text-zinc-200 mb-1">{d.date}</span>
              <div className="flex justify-between text-zinc-500 mb-1">
                <span>Max / Min:</span>
                <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                  {Math.round(d.maxTemp)}° / {Math.round(d.minTemp)}°
                </span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Rain Prob:</span>
                <span className="font-mono font-medium text-blue-600">{d.rainProbability}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
