"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Mic,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomAudioPlayerProps {
  src: string;
  voiceName?: string;
  onDownload?: () => void;
  className?: string;
}

export function CustomAudioPlayer({
  src,
  voiceName = "Voice Master HD",
  onDownload,
  className,
}: CustomAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const next = !isMuted;
    audioRef.current.muted = next;
    setIsMuted(next);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "relative w-full rounded-xl border border-[#26262E] bg-[#0B0B0F]/95 p-3.5 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-3",
        className
      )}
    >
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Top Header: Voice Badge & Equalizer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FBBF24]/15 border border-[#FBBF24]/30 text-[#FBBF24]">
            <Mic className="h-3 w-3" />
          </div>
          <span className="text-[11px] font-bold text-[#F2F2F5] tracking-wide uppercase font-mono">
            {voiceName}
          </span>
        </div>

        {/* Animated Waveform Equalizer */}
        <div className="flex items-center gap-0.5 h-4">
          {[40, 75, 100, 60, 90, 45, 80, 60, 95, 50, 70, 85].map((h, i) => (
            <span
              key={i}
              className={cn(
                "w-0.5 rounded-full transition-all duration-200",
                isPlaying ? "bg-[#FBBF24]" : "bg-[#26262E]"
              )}
              style={{
                height: isPlaying ? `${Math.max(20, (h * Math.sin((currentTime * 4) + i)))}%` : "25%",
              }}
            />
          ))}
        </div>
      </div>

      {/* Center Controls: Play Button & Scrubber */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/30 hover:bg-[#6D3EFF] hover:scale-105 transition-all"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
        </button>

        {/* Custom Scrubber */}
        <div className="flex-1 space-y-1">
          <div className="relative h-1.5 w-full rounded-full bg-[#1E1E26] overflow-hidden">
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#7C5CFF] to-[#FBBF24] rounded-full transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8B8B96]">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Download */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 rounded-lg text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-[#16161C] transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>

          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="p-1.5 rounded-lg text-[#8B8B96] hover:text-[#7C5CFF] hover:bg-[#16161C] transition-colors"
              title="Download Audio File"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
