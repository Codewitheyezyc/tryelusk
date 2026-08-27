import type { StoryboardScene } from "@/app/actions/storyboard";

export interface FCPXMLExportOptions {
  fps?: 24 | 25 | 30 | 60;
  width?: number;
  height?: number;
}

export function generateFCPXML(
  scenes: StoryboardScene[],
  projectTitle: string = "Untitled Cinema Sequence",
  options: FCPXMLExportOptions = {}
): string {
  const fps = options.fps || 24;
  const width = options.width || 1920;
  const height = options.height || 1080;

  // Calculate total sequence duration in frames & seconds
  const totalDurationSec = scenes.reduce((acc, s) => acc + (s.durationSeconds || 5), 0);
  const totalDurationVal = totalDurationSec * fps;
  const timebase = `${fps}/1s`;

  const cleanTitle = projectTitle.replace(/[<>&"']/g, "");

  let currentOffsetSec = 0;

  const assetDeclarations = scenes
    .map((scene, idx) => {
      const durSec = scene.durationSeconds || 5;
      const durVal = durSec * fps;
      const cleanUrl = (scene.mediaUrl || "").replace(/[<>&"']/g, "");
      return `    <asset id="asset_${idx + 1}" name="Scene_${idx + 1}" src="${cleanUrl}" start="0s" duration="${durVal}/${fps}s" hasVideo="1" hasAudio="${scene.audioUrl ? "1" : "0"}"/>`;
    })
    .join("\n");

  const spineClips = scenes
    .map((scene, idx) => {
      const durSec = scene.durationSeconds || 5;
      const durVal = durSec * fps;
      const offsetVal = currentOffsetSec * fps;
      currentOffsetSec += durSec;

      const cleanPrompt = (scene.prompt || "").replace(/[<>&"']/g, "");
      const cleanName = (scene.title || `Scene ${idx + 1}`).replace(/[<>&"']/g, "");

      let audioTag = "";
      if (scene.audioUrl) {
        const cleanAudioUrl = scene.audioUrl.replace(/[<>&"']/g, "");
        audioTag = `
        <audio lane="-1" offset="${offsetVal}/${fps}s" duration="${durVal}/${fps}s" ref="asset_${idx + 1}" src="${cleanAudioUrl}" role="dialogue"/>`;
      }

      return `      <video name="${cleanName}" offset="${offsetVal}/${fps}s" ref="asset_${idx + 1}" duration="${durVal}/${fps}s" start="0s">
        <marker start="0s" duration="1/${fps}s" value="${cleanPrompt}"/>${audioTag}
      </video>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
  <resources>
    <format id="r_format" name="FFVideoFormat${height}p${fps}" frameDuration="1/${fps}s" width="${width}" height="${height}"/>
${assetDeclarations}
  </resources>
  <library>
    <event name="TryElusk Cinema Production">
      <project name="${cleanTitle}">
        <sequence format="r_format" duration="${totalDurationVal}/${fps}s" tcStart="0s" tcFormat="NDF">
          <spine>
${spineClips}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>`;
}
