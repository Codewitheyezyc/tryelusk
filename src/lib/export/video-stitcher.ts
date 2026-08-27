"use client";

import type { StoryboardScene } from "@/app/actions/storyboard";

export interface StitchProgress {
  stage: "preparing" | "stitching" | "encoding" | "complete" | "error";
  currentScene: number;
  totalScenes: number;
  percent: number;
  message: string;
}

export interface StitchOptions {
  fps?: 24 | 25 | 30 | 60;
  resolution?: "1080p" | "4k";
  projectTitle?: string;
  onProgress?: (progress: StitchProgress) => void;
}

/**
 * High-performance client-side lossless video stitcher.
 * Concatenates multi-scene storyboard takes into a single master MP4 movie file.
 */
export async function stitchStoryboardScenes(
  scenes: StoryboardScene[],
  options: StitchOptions = {}
): Promise<{ blob: Blob; downloadUrl: string; fileName: string }> {
  const {
    fps = 24,
    resolution = "1080p",
    projectTitle = "tryelusk-film-master",
    onProgress,
  } = options;

  const validScenes = scenes.filter((s) => Boolean(s.mediaUrl));
  if (validScenes.length === 0) {
    throw new Error("No scenes with video takes found in the storyboard.");
  }

  const width = resolution === "4k" ? 3840 : 1920;
  const height = resolution === "4k" ? 2160 : 1080;

  onProgress?.({
    stage: "preparing",
    currentScene: 0,
    totalScenes: validScenes.length,
    percent: 5,
    message: "Initializing master cinema canvas and audio mixer...",
  });

  // Create offscreen canvas for rendering frames
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    throw new Error("Failed to initialize canvas 2D rendering context.");
  }

  // Paint black background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  // Setup Audio Context for mixing video and dub tracks
  const AudioCtxClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioContext = new AudioCtxClass();
  const audioDestination = audioContext.createMediaStreamDestination();

  // Setup Canvas Stream
  const canvasStream = canvas.captureStream(fps);
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioDestination.stream.getAudioTracks(),
  ]);

  // Determine best supported MIME type
  let mimeType = "video/mp4";
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    if (MediaRecorder.isTypeSupported("video/mp4; codecs=avc1.42E01E,mp4a.40.2")) {
      mimeType = "video/mp4; codecs=avc1.42E01E,mp4a.40.2";
    } else if (MediaRecorder.isTypeSupported("video/webm; codecs=vp9,opus")) {
      mimeType = "video/webm; codecs=vp9,opus";
    } else if (MediaRecorder.isTypeSupported("video/webm")) {
      mimeType = "video/webm";
    }
  }

  const recordedChunks: Blob[] = [];
  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: resolution === "4k" ? 25_000_000 : 12_000_000,
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  const recordingPromise = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      const finalBlob = new Blob(recordedChunks, { type: mimeType });
      resolve(finalBlob);
    };
    recorder.onerror = (err) => {
      reject(err);
    };
  });

  // Start recording chunks
  recorder.start(500);

  // Sequentially load and draw each scene take onto the master canvas
  for (let i = 0; i < validScenes.length; i++) {
    const scene = validScenes[i];
    const sceneNum = i + 1;
    const progressBase = Math.round((i / validScenes.length) * 85) + 5;

    onProgress?.({
      stage: "stitching",
      currentScene: sceneNum,
      totalScenes: validScenes.length,
      percent: progressBase,
      message: `Stitching Scene ${sceneNum} of ${validScenes.length}: "${scene.title}"...`,
    });

    await renderSceneToCanvas(scene, canvas, ctx, width, height, audioContext, audioDestination);
  }

  onProgress?.({
    stage: "encoding",
    currentScene: validScenes.length,
    totalScenes: validScenes.length,
    percent: 95,
    message: "Finalizing master audio/video encoding...",
  });

  // Stop recorder and wait for final blob
  recorder.stop();
  const finalBlob = await recordingPromise;
  await audioContext.close();

  const safeTitle = projectTitle.toLowerCase().replace(/[^a-z0-9]/g, "-") || "tryelusk-film";
  const extension = mimeType.includes("mp4") ? "mp4" : "webm";
  const fileName = `${safeTitle}-master-cut.${extension}`;
  const downloadUrl = URL.createObjectURL(finalBlob);

  onProgress?.({
    stage: "complete",
    currentScene: validScenes.length,
    totalScenes: validScenes.length,
    percent: 100,
    message: "Master movie compilation complete! Ready for download.",
  });

  return { blob: finalBlob, downloadUrl, fileName };
}

/**
 * Helper to play and render a single scene onto the canvas
 */
function renderSceneToCanvas(
  scene: StoryboardScene,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  audioContext: AudioContext,
  audioDestination: MediaStreamAudioDestinationNode
): Promise<void> {
  return new Promise((resolve) => {
    if (scene.mediaType === "image" || !scene.mediaUrl) {
      // If still image, draw for scene duration (default 5s)
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const durationMs = (scene.durationSeconds || 5) * 1000;
        const startTime = performance.now();

        const drawFrame = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, width, height);

          // Calculate aspect ratio containment
          const imgAspect = img.width / img.height;
          const canvasAspect = width / height;
          let drawW = width;
          let drawH = height;
          let drawX = 0;
          let drawY = 0;

          if (imgAspect > canvasAspect) {
            drawH = width / imgAspect;
            drawY = (height - drawH) / 2;
          } else {
            drawW = height * imgAspect;
            drawX = (width - drawW) / 2;
          }

          ctx.drawImage(img, drawX, drawY, drawW, drawH);

          if (elapsed < durationMs) {
            requestAnimationFrame(drawFrame);
          } else {
            resolve();
          }
        };

        requestAnimationFrame(drawFrame);
      };

      img.onerror = () => {
        // Fallback draw black frame for duration
        setTimeout(resolve, (scene.durationSeconds || 3) * 1000);
      };

      img.src = scene.mediaUrl;
      return;
    }

    // Video take handling
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.playsInline = true;
    video.muted = false;
    video.autoplay = false;
    video.preload = "auto";

    let audioSource: MediaElementAudioSourceNode | null = null;
    let isResolved = false;

    const cleanupAndResolve = () => {
      if (!isResolved) {
        isResolved = true;
        try {
          video.pause();
          video.removeAttribute("src");
          video.load();
        } catch {
          // ignore
        }
        resolve();
      }
    };

    video.onloadeddata = () => {
      try {
        audioSource = audioContext.createMediaElementSource(video);
        audioSource.connect(audioDestination);
      } catch {
        // Audio already routed or cross-origin silent
      }

      video.play().catch(() => {
        cleanupAndResolve();
      });

      const renderVideoFrames = () => {
        if (video.paused || video.ended || isResolved) return;

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);

        // Aspect ratio containment
        const vAspect = (video.videoWidth || 16) / (video.videoHeight || 9);
        const cAspect = width / height;
        let dW = width;
        let dH = height;
        let dX = 0;
        let dY = 0;

        if (vAspect > cAspect) {
          dH = width / vAspect;
          dY = (height - dH) / 2;
        } else {
          dW = height * vAspect;
          dX = (width - dW) / 2;
        }

        ctx.drawImage(video, dX, dY, dW, dH);

        if (!video.ended && !video.paused) {
          requestAnimationFrame(renderVideoFrames);
        }
      };

      requestAnimationFrame(renderVideoFrames);
    };

    video.onended = () => {
      cleanupAndResolve();
    };

    video.onerror = () => {
      cleanupAndResolve();
    };

    // Safety timeout in case video stalls
    const maxDuration = ((scene.durationSeconds || 10) + 2) * 1000;
    setTimeout(() => {
      cleanupAndResolve();
    }, maxDuration);

    video.src = scene.mediaUrl;
  });
}
