// Central place for the organization's public details — edit here to update
// the whole site (footer, contact page, emails, structured data).
export const site = {
  name: "Castle Rock Tabernacle",
  tagline: "Christ in the Ancient Tabernacle",
  description:
    "Walk through a full-scale recreation of the ancient Tabernacle in Castle Rock, Colorado. A free, guided experience that reveals how its design, furnishings, and ordinances point to Jesus Christ.",
  address: {
    line1: "950 S Plum Creek Blvd",
    city: "Castle Rock",
    state: "CO",
    zip: "80104",
  },
  // Public-facing tour window shown in banners.
  season: "June 21–28, 2026",
  email: "info@castlerocktabernacle.com",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=950+S+Plum+Creek+Blvd+Castle+Rock+CO+80104",
} as const;

export function fullAddress() {
  const { line1, city, state, zip } = site.address;
  return `${line1}, ${city}, ${state} ${zip}`;
}
