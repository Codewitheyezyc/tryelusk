export interface ProductionElement {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  category: "character" | "location" | "prop";
  description: string;
  visual_spec: string | null;
  reference_image_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Helper to encode category metadata inside the database description / visual_spec
 */
export function parseElementFromCharacterRow(row: any): ProductionElement {
  let category: "character" | "location" | "prop" = "character";
  let cleanDescription = row.description || "";
  let cleanVisualSpec = row.visual_spec || "";

  if (row.description?.startsWith("[LOCATION]") || row.visual_spec?.startsWith("[LOCATION]")) {
    category = "location";
    cleanDescription = cleanDescription.replace("[LOCATION]", "").trim();
  } else if (row.description?.startsWith("[PROP]") || row.visual_spec?.startsWith("[PROP]")) {
    category = "prop";
    cleanDescription = cleanDescription.replace("[PROP]", "").trim();
  }

  const slug = (row.name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_");

  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    slug,
    category,
    description: cleanDescription,
    visual_spec: cleanVisualSpec,
    reference_image_url: row.reference_sheet_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
