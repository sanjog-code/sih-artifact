'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Camera, CheckSquare, Square, ShieldCheck, AlertCircle } from 'lucide-react';

interface OpticalGradingChecklistProps {
  commodity: string;
  onGradeAssayed?: (result: {
    grade: string;
    inspectorVerified: boolean;
    moisturePercent: number;
    defectPercent: number;
  }) => void;
}

export default function OpticalGradingChecklist({
  commodity,
  onGradeAssayed,
}: OpticalGradingChecklistProps) {
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Inspector Physical Verification Checkpoints
  const [moistureCompliant, setMoistureCompliant] = useState(false);
  const [foreignMatterCompliant, setForeignMatterCompliant] = useState(false);
  const [pestFreeCompliant, setPestFreeCompliant] = useState(false);
  const [uniformMaturityCompliant, setUniformMaturityCompliant] = useState(false);

  // Optical defect score
  const [aiDefectEstimate] = useState(0.8); // 0.8% defect
  const [moistureValue] = useState(8.4);

  const allChecked =
    moistureCompliant &&
    foreignMatterCompliant &&
    pestFreeCompliant &&
    uniformMaturityCompliant;

  const handleSimulatePhoto = () => {
    setPhotoUploaded(true);
    setPhotoPreview('https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400');
  };

  const handleCertify = () => {
    if (!allChecked) return;
    const finalGrade = aiDefectEstimate < 1.0 ? 'Grade A1' : 'Grade A2';
    if (onGradeAssayed) {
      onGradeAssayed({
        grade: finalGrade,
        inspectorVerified: true,
        moisturePercent: moistureValue,
        defectPercent: aiDefectEstimate,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-semibold mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>Human-Assisted AGMARK Protocol</span>
          </div>
          <h3 className="text-xl font-bold text-zinc-950 dark:text-white">
            Produce Optical Assay & Inspector Checklist
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            AI provides optical defect telemetry, but statutory AGMARK grade certification requires human inspector sign-off.
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
          Commodity: {commodity}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Photo Upload / Camera Capture */}
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 text-center">
          {photoUploaded && photoPreview ? (
            <div className="w-full">
              <Image
                src={photoPreview}
                alt="Assay Lot Sample"
                width={400}
                height={176}
                unoptimized
                className="w-full h-44 object-cover rounded-xl mb-3 border border-zinc-200 dark:border-zinc-800"
              />
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  AI Optical Telemetry: Defect Floor 0.8%
                </span>
                <span className="text-zinc-400">AGMARK A1 Candidate</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-400">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                Upload or Capture Produce Sample
              </span>
              <p className="text-[11px] text-zinc-500 max-w-xs mb-4">
                High-resolution daylight optical assay for surface discoloration, sizing uniformity, and grain fractures.
              </p>
              <button
                type="button"
                onClick={handleSimulatePhoto}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold shadow-xs hover:opacity-90"
              >
                Capture Sample Photo
              </button>
            </div>
          )}
        </div>

        {/* Inspector Physical Checklist */}
        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-3">
            Mandatory Inspector Checkpoints
          </span>

          <div className="space-y-3 text-xs">
            <button
              type="button"
              onClick={() => setMoistureCompliant(!moistureCompliant)}
              className="w-full flex items-start gap-2.5 text-left p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {moistureCompliant ? (
                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Moisture Content &lt; 12.0%
                </span>
                <span className="text-[11px] text-zinc-500">
                  Calibrated moisture probe reads {moistureValue}% (Safe for storage).
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setForeignMatterCompliant(!foreignMatterCompliant)}
              className="w-full flex items-start gap-2.5 text-left p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {foreignMatterCompliant ? (
                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Foreign Matter &lt; 1.0%
                </span>
                <span className="text-[11px] text-zinc-500">
                  Chaff, husk, pebbles, and non-target seeds verified below threshold.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPestFreeCompliant(!pestFreeCompliant)}
              className="w-full flex items-start gap-2.5 text-left p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {pestFreeCompliant ? (
                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Zero Live Infestation / Weevils
                </span>
                <span className="text-[11px] text-zinc-500">
                  Visual sieve examination confirmed free of live insects.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setUniformMaturityCompliant(!uniformMaturityCompliant)}
              className="w-full flex items-start gap-2.5 text-left p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {uniformMaturityCompliant ? (
                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Uniform Maturity & Grade Sizing
                </span>
                <span className="text-[11px] text-zinc-500">
                  Varietal purity and diameter standard compliance verified.
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs">
          {allChecked ? (
            <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Ready for Grade A1 Certification
            </span>
          ) : (
            <span className="text-zinc-500 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Complete all 4 checklist points to certify
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={!allChecked}
          onClick={handleCertify}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            allChecked
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
          }`}
        >
          Certify AGMARK Grade
        </button>
      </div>
    </div>
  );
}
