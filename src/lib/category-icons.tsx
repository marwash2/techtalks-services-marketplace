import type { LucideIcon } from "lucide-react";
import {
  BrushCleaning,
  Car,
  ChefHat,
  Dumbbell,
  Hammer,
  HeartPulse,
  Home,
  Paintbrush,
  PawPrint,
  Plug,
  Scissors,
  Shirt,
  Sparkles,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  cleaning: BrushCleaning,
  plumbing: Wrench,
  electrical: Plug,
  carpentry: Hammer,
  painting: Paintbrush,
  beauty: Scissors,
  laundry: Shirt,
  fitness: Dumbbell,
  healthcare: HeartPulse,
  petcare: PawPrint,
  moving: Home,
  catering: ChefHat,
  automotive: Car,
  restaurant: UtensilsCrossed,
  default: Sparkles,
};

export const CATEGORY_ICON_OPTIONS = [
  { value: "cleaning", label: "Cleaning" },
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "carpentry", label: "Carpentry" },
  { value: "painting", label: "Painting" },
  { value: "beauty", label: "Beauty" },
  { value: "laundry", label: "Laundry" },
  { value: "fitness", label: "Fitness" },
  { value: "healthcare", label: "Healthcare" },
  { value: "petcare", label: "Pet Care" },
  { value: "moving", label: "Moving" },
  { value: "catering", label: "Catering" },
  { value: "automotive", label: "Automotive" },
  { value: "restaurant", label: "Restaurant" },
] as const;

export function normalizeCategoryIcon(value?: string | null): string {
  if (!value) return "default";
  const key = value.toLowerCase().trim();
  if (key in CATEGORY_ICON_MAP) return key;
  return "default";
}

export function inferCategoryIconKey(
  name?: string | null,
  icon?: string | null,
): string {
  const normalizedIcon = normalizeCategoryIcon(icon);
  if (normalizedIcon !== "default") return normalizedIcon;

  const text = (name || "").toLowerCase();
  if (text.includes("clean")) return "cleaning";
  if (text.includes("plumb")) return "plumbing";
  if (text.includes("electric")) return "electrical";
  if (text.includes("carpent")) return "carpentry";
  if (text.includes("paint")) return "painting";
  if (text.includes("beaut") || text.includes("salon")) return "beauty";
  if (text.includes("laund")) return "laundry";
  if (text.includes("fit") || text.includes("gym")) return "fitness";
  if (text.includes("health") || text.includes("medical")) return "healthcare";
  if (text.includes("pet")) return "petcare";
  if (text.includes("mov")) return "moving";
  if (text.includes("cater")) return "catering";
  if (text.includes("auto") || text.includes("car")) return "automotive";
  if (text.includes("restaur") || text.includes("food")) return "restaurant";
  return "default";
}
