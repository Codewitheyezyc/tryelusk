export interface InspirationScene {
  id: string;
  title: string;
  genre: "Sci-Fi" | "Cyberpunk" | "Commercial" | "Film Noir" | "Fantasy" | "Action";
  prompt: string;
  mediaType: "video" | "image";
  model: string;
  videoUrl?: string;
  imageUrl: string;
  cameraMovement?: string;
  lightingMood?: string;
  aspectRatio: string;
}

export const INSPIRATION_SCENES: InspirationScene[] = [
  {
    id: "scifi-hovercar",
    title: "Neo-Shinjuku Flight",
    genre: "Cyberpunk",
    prompt: "A sleek chrome hovercar gliding through towering neo-tokyo skyscrapers in pouring rain, neon reflections on wet metallic hull",
    mediaType: "video",
    model: "kling-3.0-cinema-pro",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80",
    cameraMovement: "Smooth continuous steadicam tracking shot moving dynamically through the environment",
    lightingMood: "Vibrant cyan, electric purple, and neon magenta reflections on wet dark surfaces",
    aspectRatio: "16:9",
  },
  {
    id: "feudal-ronin",
    title: "Golden Hour Duel",
    genre: "Action",
    prompt: "A weathered ronin drawing a steel katana in front of a glowing ancient temple during sunset, drifting cherry blossom leaves",
    mediaType: "video",
    model: "seedance-2.0-motion",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    cameraMovement: "Slow cinematic push-in camera movement focusing on emotional intensity",
    lightingMood: "Warm golden hour sunlight with amber rim lighting and soft wrap-around glow",
    aspectRatio: "16:9",
  },
  {
    id: "artisan-bakery",
    title: "Morning Oven Glow",
    genre: "Commercial",
    prompt: "Master baker sliding a golden rustic sourdough loaf from a blazing stone hearth, steam billowing in early morning light",
    mediaType: "video",
    model: "kling-2.5-turbo",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
    cameraMovement: "Slow cinematic push-in camera movement focusing on emotional intensity",
    lightingMood: "Luminous soft-diffused natural daylight with clean open shadows",
    aspectRatio: "16:9",
  },
  {
    id: "cosmic-flora",
    title: "Exoplanet Bioluminescence",
    genre: "Sci-Fi",
    prompt: "Astronaut in sleek explorer suit kneeling before glowing cyan alien crystal flora on a foggy obsidian landscape",
    mediaType: "video",
    model: "kling-3.0-cinema-pro",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    cameraMovement: "Elevated sweeping 360-degree aerial drone orbit capturing scale",
    lightingMood: "Atmospheric volumetric god rays penetrating through dense misty haze",
    aspectRatio: "16:9",
  },
  {
    id: "noir-detective",
    title: "Shadows in the Rain",
    genre: "Film Noir",
    prompt: "Trenchcoat detective lighting a match under a streetlight in a dark alley, smoke rising past Venetian blind shadows",
    mediaType: "video",
    model: "seedance-2.0-motion",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    imageUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80",
    cameraMovement: "Tilted Dutch angle perspective creating dramatic suspense and psychological tension",
    lightingMood: "Severe high-contrast chiaroscuro lighting with deep obsidian shadows and sharp key lights",
    aspectRatio: "16:9",
  },
  {
    id: "hypercar-drift",
    title: "Midnight Mountain Drift",
    genre: "Action",
    prompt: "Matte-black aerodynamic hypercar drifting around a rain-soaked mountain hairpin turn with glowing red brake calipers",
    mediaType: "video",
    model: "kling-3.0-cinema-pro",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    imageUrl: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80",
    cameraMovement: "Kinetic whip pan transition with fast motion blur",
    lightingMood: "Vibrant cyan, electric purple, and neon magenta reflections on wet dark surfaces",
    aspectRatio: "16:9",
  },
];
