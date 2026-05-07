/**
 * Converts any string into a clean, URL-safe slug.
 *
 * Examples:
 *   "Plumbing & Repairs!"  → "plumbing-repairs"
 *   "Café & Résumé"        → "cafe-resume"
 *   "  Hello   World  "    → "hello-world"
 *   "AC/DC Service"        → "ac-dc-service"
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")                         // decompose accented chars: é → e + ́
    .replace(/[\u0300-\u036f]/g, "")          // strip accent marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")            // remove all non-alphanumeric except spaces/hyphens
    .replace(/[\s]+/g, "-")                   // replace whitespace runs with single hyphen
    .replace(/-+/g, "-")                      // collapse multiple hyphens
    .replace(/^-+|-+$/g, "");                 // strip leading/trailing hyphens
}