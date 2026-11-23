/**
 * Species-aware fallback pet photos
 * Ensures appropriate photography when a pet does not have an uploaded dynamic avatar.
 */

export function getSpeciesDefaultPhoto(_species?: string, _breed?: string): string {
  // Static image fallbacks have been removed to prevent automatic static image additions.
  // Dynamic images or UI avatars (initials/paw icons) are used instead.
  return "";
}
