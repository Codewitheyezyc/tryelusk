import type { StoryboardScene } from "@/app/actions/storyboard";

function formatSMPTETimecode(seconds: number, fps: number = 24): string {
  const totalFrames = Math.floor(seconds * fps);
  const hrs = Math.floor(totalFrames / (3600 * fps));
  const mins = Math.floor((totalFrames % (3600 * fps)) / (60 * fps));
  const secs = Math.floor((totalFrames % (60 * fps)) / fps);
  const frames = totalFrames % fps;

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`;
}

export function generateCMX3600EDL(
  scenes: StoryboardScene[],
  projectTitle: string = "Untitled Cinema Sequence",
  fps: number = 24
): string {
  let edlText = `TITLE: ${projectTitle.toUpperCase().slice(0, 32)}\nFCM: NON-DROP FRAME\n\n`;

  let masterTimelineSec = 3600; // Start at 01:00:00:00 (industry standard starting timecode)

  scenes.forEach((scene, idx) => {
    const editNum = String(idx + 1).padStart(3, "0");
    const durSec = scene.durationSeconds || 5;

    const srcIn = formatSMPTETimecode(0, fps);
    const srcOut = formatSMPTETimecode(durSec, fps);

    const recIn = formatSMPTETimecode(masterTimelineSec, fps);
    masterTimelineSec += durSec;
    const recOut = formatSMPTETimecode(masterTimelineSec, fps);

    const cleanName = `SCENE_${idx + 1}`;
    const cleanPrompt = scene.prompt ? scene.prompt.replace(/\r?\n/g, " ").slice(0, 80) : "";

    edlText += `${editNum}  AX       V     C        ${srcIn} ${srcOut} ${recIn} ${recOut}\n`;
    edlText += `* FROM CLIP NAME: ${cleanName}.MP4\n`;
    if (cleanPrompt) {
      edlText += `* COMMENT: ${cleanPrompt}\n`;
    }
    edlText += `\n`;
  });

  return edlText;
}
