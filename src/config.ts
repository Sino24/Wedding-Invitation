export interface EventItem {
  key: string;
  name: string;
  start: string; // ISO with timezone
  hours: number; // duration, used for "Add to calendar"
  venue: string;
  address: string;
  map: string;
  note: string;
  schedule: [string, string][];
}

/* ===== EDIT YOUR DETAILS HERE ===== */
export const C = {
  groom: "Arjun",
  bride: "Meera",
  groomParents: "Son of Mr. & Mrs. Thomas",
  brideParents: "Daughter of Mr. & Mrs. Mathew",
  // Photos: put files in /public and use "/groom.jpg", or import from src/assets.
  // Empty string = elegant placeholder.
  groomPhoto: "",
  bridePhoto: "",
  city: "Kerala, India",
  theme: "wine" as "wine" | "navy" | "emerald", // colour theme: wine | navy | emerald
  tz: "Asia/Kolkata",
  message:
    "Along with our beloved families, we joyfully invite you to share in the blessing of our engagement and wedding, and to celebrate the beginning of our forever.",
  events: [
    {
      key: "engagement",
      name: "Engagement",
      start: "2026-12-19T16:00:00+05:30",
      hours: 3,
      venue: "Holy Family Parish Hall",
      address: "Kumbanad, Kerala",
      map: "https://maps.google.com/?q=Kumbanad+Kerala",
      note: "Ring exchange and blessings, followed by high tea.",
      schedule: [["4:00 PM", "Guests arrive"], ["4:30 PM", "Ring exchange"], ["5:30 PM", "High tea & celebration"]],
    },
    {
      key: "wedding",
      name: "Wedding",
      start: "2026-12-20T11:00:00+05:30",
      hours: 5,
      venue: "St. Mary’s Church",
      address: "Mallappally, Kerala",
      map: "https://maps.google.com/?q=Mallappally+Kerala",
      note: "Holy matrimony followed by a wedding feast and reception.",
      schedule: [["10:30 AM", "Guests arrive"], ["11:00 AM", "Wedding ceremony"], ["1:00 PM", "Wedding feast"], ["6:30 PM", "Reception"]],
    },
  ] as EventItem[],
  rsvpPhone: "919999999999",
  rsvpText: "Hi! We’d love to attend the celebrations.",
  // Optional: your own song, e.g. "/song.mp3" (file in /public). Empty = soft built-in melody.
  musicUrl: "",
};
/* =================================== */
