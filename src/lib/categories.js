export const CATEGORY_OPTIONS = [
  { id: "repair", label: "Maintenance & Repair" },
  { id: "homehelp", label: "Home Help & Cleaning" },
  { id: "cooking", label: "Cooking & Catering" },
  { id: "delivery", label: "Delivery & Transport" },
  { id: "education", label: "Tuition & Training" },
  { id: "labor", label: "Manual Labor" },
  { id: "other", label: "Other Services" },
];

const LEGACY_CATEGORY_MAP = {
  Repair: "repair",
  repair: "repair",
  "Home Help": "homehelp",
  homehelp: "homehelp",
  Cook: "cooking",
  cooking: "cooking",
  Delivery: "delivery",
  delivery: "delivery",
  Tutor: "education",
  education: "education",
  Labor: "labor",
  labor: "labor",
  Other: "other",
  other: "other",
};

export const normalizeCategory = (value) => {
  if (!value) return "";
  const normalized = String(value).trim();
  return LEGACY_CATEGORY_MAP[normalized] || normalized.toLowerCase();
};

export const getCategoryLabel = (value) => {
  const normalized = normalizeCategory(value);
  const match = CATEGORY_OPTIONS.find((option) => option.id === normalized);
  return match?.label || value || "Other";
};
