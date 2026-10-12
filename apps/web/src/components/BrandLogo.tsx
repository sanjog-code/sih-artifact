import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  priority?: boolean;
}

export default function BrandLogo({
  className = '',
  size = 'md',
  showTagline = true,
  priority = false,
}: BrandLogoProps) {
  // Height configurations for optimal crisp rendering
  const dimensions = {
    sm: { height: 28, width: 50, textClass: 'text-sm', subClass: 'text-[9px]' },
    md: { height: 36, width: 64, textClass: 'text-base', subClass: 'text-[10px]' },
    lg: { height: 44, width: 78, textClass: 'text-lg', subClass: 'text-[11px]' },
    xl: { height: 56, width: 100, textClass: 'text-2xl', subClass: 'text-xs' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative shrink-0 flex items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-1 shadow-xs">
        <Image
          src="/logo.png"
          alt="FasalMatrix Official Logo"
          width={dimensions.width}
          height={dimensions.height}
          priority={priority}
          className="object-contain h-auto w-auto max-h-full"
        />
      </div>
      <div className="flex flex-col text-left">
        <span
          className={`font-black tracking-tight leading-tight text-zinc-950 dark:text-zinc-50 ${dimensions.textClass}`}
        >
          FasalMatrix
        </span>
        {showTagline && (
          <span
            className={`font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold -mt-0.5 ${dimensions.subClass}`}
          >
            Growing Trust. Connecting Markets.
          </span>
        )}
      </div>
    </div>
  );
}
