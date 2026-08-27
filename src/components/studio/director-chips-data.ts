export interface DirectorChipData {
  id: string;
  label: string;
  category: "camera" | "lighting";
  promptModifier: string;
  description: string;
}

export const CAMERA_CHIPS_DATA: DirectorChipData[] = [
  {
    id: "push-in",
    label: "Slow Push-In",
    category: "camera",
    promptModifier: "Slow cinematic push-in camera movement focusing on emotional intensity",
    description: "Gradually zooms toward subject with shallow depth of field",
  },
  {
    id: "steadicam",
    label: "Steadicam Track",
    category: "camera",
    promptModifier: "Smooth continuous steadicam tracking shot moving dynamically through the environment",
    description: "Fluid camera glide maintaining steady eye-level framing",
  },
  {
    id: "drone-orbit",
    label: "Drone Orbit",
    category: "camera",
    promptModifier: "Elevated sweeping 360-degree aerial drone orbit capturing scale",
    description: "Wide cinematic rotation revealing surrounding scope",
  },
  {
    id: "dutch-angle",
    label: "Dutch Angle",
    category: "camera",
    promptModifier: "Tilted Dutch angle perspective creating dramatic suspense and psychological tension",
    description: "Off-axis canted angle for high drama or disorientation",
  },
  {
    id: "whip-pan",
    label: "Whip Pan",
    category: "camera",
    promptModifier: "Kinetic whip pan transition with fast motion blur",
    description: "High-speed directional camera flick",
  },
  {
    id: "handheld",
    label: "Handheld Drift",
    category: "camera",
    promptModifier: "Intimate organic handheld camera with natural documentary micro-shake",
    description: "Authentic grounded documentary realism",
  },
];

export const LIGHTING_CHIPS_DATA: DirectorChipData[] = [
  {
    id: "golden-hour",
    label: "Golden Hour",
    category: "lighting",
    promptModifier: "Warm golden hour sunlight with amber rim lighting and soft wrap-around glow",
    description: "Warm sunset/sunrise magical cinema glow",
  },
  {
    id: "cyberpunk-neon",
    label: "Cyberpunk Neon",
    category: "lighting",
    promptModifier: "Vibrant cyan, electric purple, and neon magenta reflections on wet dark surfaces",
    description: "Futuristic high-contrast neon illumination",
  },
  {
    id: "chiaroscuro",
    label: "Chiaroscuro Noir",
    category: "lighting",
    promptModifier: "Severe high-contrast chiaroscuro lighting with deep obsidian shadows and sharp key lights",
    description: "Classic film noir shadow-and-light tension",
  },
  {
    id: "volumetric-haze",
    label: "Volumetric Mist",
    category: "lighting",
    promptModifier: "Atmospheric volumetric god rays penetrating through dense misty haze",
    description: "Ethereal shafts of light through smoke or fog",
  },
  {
    id: "high-key",
    label: "Clean Daylight",
    category: "lighting",
    promptModifier: "Luminous soft-diffused natural daylight with clean open shadows",
    description: "Crisp, airy natural commercial exposure",
  },
];
