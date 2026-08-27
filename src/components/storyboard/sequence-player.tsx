"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Repeat,
  Sparkles,
  Clapperboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoryboardScene } from "@/app/actions/storyboard";

interface SequencePlayerProps {
  scenes: StoryboardScene[];
  activeSceneIndex: number;
  onSelectSceneIndex: (index: number) => void;
  onContinueShot?: (scene: StoryboardScene) => void;
}

export function SequencePlayer({
  scenes,
  activeSceneIndex,
  onSelectSceneIndex,
  onContinueShot,
}: SequencePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  const currentScene = scenes[activeSceneIndex];

  // Calculate total sequence duration
  const totalDurationSeconds = scenes.reduce(
    (acc, scene) => acc + (scene.durationSeconds || 5),
    0
  );

  // Calculate global elapsed time up to current scene
  const previousScenesDuration = scenes
    .slice(0, activeSceneIndex)
    .reduce((acc, scene) => acc + (scene.durationSeconds || 5), 0);

  const globalCurrentTime = previousScenesDuration + sceneProgress;

  // Safe scene transition handler
  const handleNextScene = useCallback(() => {
    if (activeSceneIndex < scenes.length - 1) {
      setSceneProgress(0);
      setTimeout(() => {
        onSelectSceneIndex(activeSceneIndex + 1);
      }, 50);
    } else if (isLooping) {
      setSceneProgress(0);
      setTimeout(() => {
        onSelectSceneIndex(0);
      }, 50);
    } else {
      setIsPlaying(false);
      setSceneProgress(0);
    }
  }, [activeSceneIndex, scenes.length, isLooping, onSelectSceneIndex]);

  const handlePrevScene = useCallback(() => {
    if (activeSceneIndex > 0) {
      setSceneProgress(0);
      setTimeout(() => {
        onSelectSceneIndex(activeSceneIndex - 1);
      }, 50);
    }
  }, [activeSceneIndex, onSelectSceneIndex]);

  // Video Time Update: update scrubber without triggering React render warning
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setSceneProgress(videoRef.current.currentTime);
    }
  };

  // Video Ended Event: standard HTML5 video transition
  const handleVideoEnded = () => {
    handleNextScene();
  };

  // Handle Image Scene Duration Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentScene?.mediaType === "image") {
      const sceneDuration = currentScene.durationSeconds || 5;
      const interval = 100;
      timer = setInterval(() => {
        setSceneProgress((prev) => {
          const next = prev + 0.1;
          if (next >= sceneDuration) {
            handleNextScene();
            return 0;
          }
          return next;
        });
      }, interval);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeSceneIndex, currentScene, handleNextScene]);

  const togglePlay = () => {
    if (scenes.length === 0) return;
    if (isPlaying) {
      setIsPlaying(false);
      if (videoRef.current) videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
    } else {
      setIsPlaying(true);
      if (videoRef.current) videoRef.current.play().catch(() => {});
      if (audioRef.current && currentScene?.audioUrl) audioRef.current.play().catch(() => {});
    }
  };

  // Sync video/audio playback when activeSceneIndex changes
  useEffect(() => {
    setSceneProgress(0);
    if (isPlaying) {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
      if (audioRef.current && currentScene?.audioUrl) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    }
  }, [activeSceneIndex, isPlaying]);

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      ref={playerContainerRef}
      className="relative rounded-3xl border border-white/[0.1] bg-[#0A0A0E] overflow-hidden shadow-2xl group select-none"
    >
      {/* 1. CINEMA VIEWPORT (16:9 Aspect Ratio) */}
      <div className="relative aspect-video w-full bg-[#040406] flex items-center justify-center overflow-hidden">
        {currentScene ? (
          <>
            {currentScene.mediaType === "video" ? (
              <video
                key={currentScene.id}
                ref={videoRef}
                src={currentScene.mediaUrl}
                className="w-full h-full object-contain"
                playsInline
                muted={isMuted}
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
                onClick={togglePlay}
              />
            ) : (
              <img
                src={currentScene.mediaUrl}
                alt={currentScene.title}
                className="w-full h-full object-contain"
                onClick={togglePlay}
              />
            )}

            {/* Optional Attached Audio Track */}
            {currentScene.audioUrl && (
              <audio
                ref={audioRef}
                src={currentScene.audioUrl}
                muted={isMuted}
              />
            )}

            {/* Play Overlay when Paused */}
            {!isPlaying && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute h-16 w-16 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center shadow-2xl backdrop-blur-md hover:scale-110 transition-transform"
              >
                <Play className="h-7 w-7 fill-white translate-x-0.5" />
              </button>
            )}

            {/* Top Scene Overlay Pill */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="px-3 py-1 rounded-xl bg-black/80 border border-white/15 backdrop-blur-md flex items-center gap-2 shadow-lg">
                <span className="h-2 w-2 rounded-full bg-[#7C5CFF] animate-pulse" />
                <span className="text-xs font-bold text-white font-mono">
                  SCENE {String(activeSceneIndex + 1).padStart(2, "0")} /{" "}
                  {String(scenes.length).padStart(2, "0")}
                </span>
                <span className="text-xs text-[#8B8B96] max-w-[200px] truncate hidden sm:inline">
                  • {currentScene.title || currentScene.prompt}
                </span>
              </div>

              {currentScene.audioUrl && (
                <div className="px-2.5 py-1 rounded-xl bg-[#4ADE80]/20 border border-[#4ADE80]/40 text-[#4ADE80] text-[10px] font-mono font-bold backdrop-blur-md flex items-center gap-1">
                  <Volume2 className="h-3 w-3" />
                  <span>VOICE SYNC</span>
                </div>
              )}
            </div>

            {/* Continuity CTA on Top-Right */}
            {onContinueShot && (
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => onContinueShot(currentScene)}
                  className="px-3.5 py-1.5 rounded-xl border border-[#7C5CFF]/40 bg-[#7C5CFF]/80 hover:bg-[#7C5CFF] text-white text-xs font-bold shadow-lg shadow-[#7C5CFF]/30 backdrop-blur-md flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#FBBF24]" />
                  <span>Continue Shot</span>
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty Timeline State */
          <div className="text-center p-8 space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-[#8B8B96]">
              <Clapperboard className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Storyboard is Empty</h4>
              <p className="text-xs text-[#8B8B96] max-w-sm">
                Insert takes below to start assembling your continuous sequence.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. TIMELINE SEGMENT SCRUBBER & TRANSPORT CONTROLS */}
      {scenes.length > 0 && (
        <div className="p-4 bg-[#0E0E14] border-t border-white/[0.08] space-y-3">
          {/* Segmented Timeline Bar */}
          <div className="flex items-center gap-1.5 h-2 w-full">
            {scenes.map((scene, idx) => {
              const isActive = idx === activeSceneIndex;
              const isPast = idx < activeSceneIndex;
              const sceneDur = scene.durationSeconds || 5;
              const widthPct = Math.max(8, (sceneDur / (totalDurationSeconds || 1)) * 100);

              let fillPct = 0;
              if (isPast) fillPct = 100;
              else if (isActive) fillPct = Math.min(100, (sceneProgress / sceneDur) * 100);

              return (
                <div
                  key={scene.id}
                  onClick={() => onSelectSceneIndex(idx)}
                  style={{ width: `${widthPct}%` }}
                  className="relative h-2 rounded-full bg-white/[0.1] overflow-hidden cursor-pointer hover:bg-white/20 transition-colors"
                  title={`Scene ${idx + 1}: ${scene.title}`}
                >
                  <div
                    style={{ width: `${fillPct}%` }}
                    className={cn(
                      "h-full transition-all duration-100",
                      isActive
                        ? "bg-gradient-to-r from-[#7C5CFF] to-[#B066FF]"
                        : "bg-[#7C5CFF]/70"
                    )}
                  />
                </div>
              );
            })}
          </div>

          {/* Transport Bar */}
          <div className="flex items-center justify-between text-xs">
            {/* Left: Playback Controls */}
            <div className="flex items-center gap-3 text-white">
              <button
                type="button"
                onClick={handlePrevScene}
                disabled={activeSceneIndex === 0}
                className="hover:text-[#7C5CFF] disabled:opacity-40 disabled:hover:text-white"
                title="Previous Scene"
              >
                <SkipBack className="h-4 w-4 fill-current" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="h-8 w-8 rounded-xl bg-[#7C5CFF] hover:bg-[#6D3EFF] text-white flex items-center justify-center shadow-md shadow-[#7C5CFF]/30"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 fill-white" />
                ) : (
                  <Play className="h-4 w-4 fill-white translate-x-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleNextScene}
                disabled={activeSceneIndex === scenes.length - 1 && !isLooping}
                className="hover:text-[#7C5CFF] disabled:opacity-40 disabled:hover:text-white"
                title="Next Scene"
              >
                <SkipForward className="h-4 w-4 fill-current" />
              </button>

              <button
                type="button"
                onClick={() => setIsLooping(!isLooping)}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isLooping ? "text-[#7C5CFF] bg-[#7C5CFF]/15" : "text-[#8B8B96] hover:text-white"
                )}
                title="Loop Sequence"
              >
                <Repeat className="h-3.5 w-3.5" />
              </button>

              {/* Time Display */}
              <span className="font-mono text-[11px] text-[#8B8B96]">
                <strong className="text-white">{formatTime(globalCurrentTime)}</strong> /{" "}
                {formatTime(totalDurationSeconds)}
              </span>
            </div>

            {/* Right: Audio & Fullscreen */}
            <div className="flex items-center gap-3 text-[#8B8B96]">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="hover:text-white transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="hover:text-white transition-colors"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
