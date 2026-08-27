import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon";
  href?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({
  className,
  variant = "full",
  href = "/",
  size = "md",
}: LogoProps) {
  const sizeClasses = {
    sm: "h-7",
    md: "h-9",
    lg: "h-11",
  };

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* 6-blade Aperture Iris Mark */}
      <svg
        className={cn(sizeClasses[size], "aspect-square flex-shrink-0")}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="TryElusk Aperture Mark"
      >
        <defs>
          <radialGradient id="irisGradientMark" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#A78BFF" />
            <stop offset="100%" stopColor="#6D3EFF" />
          </radialGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="#0B0B0F" />
        <g transform="translate(32,32)">
          <g fill="url(#irisGradientMark)">
            <polygon points="0,0 0,-20 8,-16" transform="rotate(0)" />
            <polygon points="0,0 0,-20 8,-16" transform="rotate(60)" />
            <polygon points="0,0 0,-20 8,-16" transform="rotate(120)" />
            <polygon points="0,0 0,-20 8,-16" transform="rotate(180)" />
            <polygon points="0,0 0,-20 8,-16" transform="rotate(240)" />
            <polygon points="0,0 0,-20 8,-16" transform="rotate(300)" />
          </g>
          <circle r="5.5" fill="#0B0B0F" />
        </g>
      </svg>

      {/* Wordmark */}
      {variant === "full" && (
        <span className="text-lg sm:text-xl md:text-2xl tracking-tight font-medium">
          <span className="text-[#8B8B96]">Try</span>
          <span className="text-[#F2F2F5] font-bold">Elusk</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF] rounded-lg"
      >
        {content}
      </Link>
    );
  }

  return content;
}
