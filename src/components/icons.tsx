/** One consistent 24px, 1.8-stroke icon family. */
const PATHS = {
  home: "M4 11 12 4l8 7M6 9.5V20h12V9.5M10 20v-5h4v5",
  food: "M5 11h14a7 7 0 0 1-14 0ZM8 7c0-1 1-1.5 1-2.5M12 7c0-1 1-1.5 1-2.5M16 7c0-1 1-1.5 1-2.5M9 20h6",
  bus: "M6 4h12a2 2 0 0 1 2 2v10H4V6a2 2 0 0 1 2-2ZM4 11h16M7.5 19.5V16M16.5 19.5V16M7.5 14h.01M16.5 14h.01",
  wifi: "M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.6 16a5 5 0 0 1 6.8 0M12 19.5h.01",
  sofa: "M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3ZM6 18v2M18 18v2",
  laundry: "M5 3h14v18H5ZM5 7h14M8 5h.01M11 5h.01M12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  sparkle: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18",
  basket: "M3 10h18l-2 9H5ZM8 10l3-6M16 10l-3-6M9 14v2M15 14v2",
  pin: "M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  check: "M5 12.5 10 17l9-10",
  calendar: "M4 6h16v14H4ZM4 10h16M8 3v4M16 3v4",
  wallet: "M4 7h15a1 1 0 0 1 1 1v11H4a1 1 0 0 1-1-1V6a2 2 0 0 1 2-2h11v3M16 13h.01",
  building: "M5 21V5l7-2v18M12 8h7v13M8 8h.01M8 12h.01M8 16h.01M15 12h.01M15 16h.01M3 21h18",
  truck: "M2 6h11v10H2ZM13 9h4l3 3v4h-7M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  shield: "M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6ZM9 12l2 2 4-4",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z",
  compare: "M4 6h7v14H4ZM13 4h7v16h-7ZM7 10h1M16 9h1M16 13h1",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4",
  filter: "M4 6h16M7 12h10M10 18h4",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2ZM9 4v14M15 6v14",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  play: "M8 5v14l11-7Z",
  plus: "M12 5v14M5 12h14",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  edit: "M4 20h4L19 9l-4-4L4 16ZM13 7l4 4",
  briefcase: "M3 8h18v11H3ZM8 8V5h8v3M3 13h18",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 8h.01",
  x: "M6 6l12 12M18 6 6 18",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
  mail: "M3 6h18v12H3ZM3 7l9 6 9-6",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, className = "" }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={PATHS[name]} />
    </svg>
  );
}

export const KIND_ICON: Record<string, IconName> = {
  pg: "home", flat: "building", hostel: "home",
  tiffin: "food", mess: "food", "home-meals": "food", "meal-subscription": "food",
  metro: "bus", bus: "bus", "bike-rental": "bus", "shared-ride": "bus", cab: "bus", walk: "pin",
  wifi: "wifi", laundry: "laundry", cleaning: "sparkle", furniture: "sofa", moving: "truck", grocery: "basket", household: "home", maintenance: "edit",
};
