import type { Workplace } from "./types";

/** Cities with configured data. Others are listed as "coming soon" only. */
export const CITIES = [
  { id: "pune", name: "Pune", live: true },
  { id: "mumbai", name: "Mumbai", live: false },
  { id: "bengaluru", name: "Bengaluru", live: false },
  { id: "hyderabad", name: "Hyderabad", live: false },
  { id: "chennai", name: "Chennai", live: false },
  { id: "delhi-ncr", name: "Delhi NCR", live: false },
] as const;

/** Approximate locality centroids (area-level, not exact addresses). */
export const LOCALITIES = [
  { name: "Hinjewadi", lat: 18.5913, lng: 73.7389, blurb: "IT parks, PGs everywhere, traffic at peak hours" },
  { name: "Wakad", lat: 18.5987, lng: 73.765, blurb: "Residential, close to Hinjewadi, good food options" },
  { name: "Baner", lat: 18.559, lng: 73.7868, blurb: "Cafés, offices, slightly pricier flats" },
  { name: "Kharadi", lat: 18.5515, lng: 73.9348, blurb: "EON IT Park, newer apartments" },
  { name: "Viman Nagar", lat: 18.5679, lng: 73.9143, blurb: "Near the airport, lively, mid-to-high rents" },
  { name: "Hadapsar", lat: 18.5089, lng: 73.926, blurb: "Magarpatta & SP Infocity nearby, value rents" },
  { name: "Pimpri-Chinchwad", lat: 18.6298, lng: 73.7997, blurb: "Industrial belt, affordable, metro-connected areas" },
] as const;

export type LocalityName = (typeof LOCALITIES)[number]["name"];

/** Common workplace areas. Coordinates are approximate area centres — enough for distance estimates. */
export const WORKPLACES: Workplace[] = [
  { name: "Hinjewadi Phase 1", area: "Hinjewadi", lat: 18.5912, lng: 73.738 },
  { name: "Hinjewadi Phase 3", area: "Hinjewadi", lat: 18.5867, lng: 73.695 },
  { name: "Kharadi (EON IT Park area)", area: "Kharadi", lat: 18.552, lng: 73.944 },
  { name: "Magarpatta City", area: "Hadapsar", lat: 18.515, lng: 73.927 },
  { name: "Baner business district", area: "Baner", lat: 18.561, lng: 73.779 },
  { name: "Viman Nagar", area: "Viman Nagar", lat: 18.566, lng: 73.912 },
  { name: "Pimpri-Chinchwad MIDC", area: "Pimpri-Chinchwad", lat: 18.627, lng: 73.8 },
  { name: "Shivajinagar", area: "Shivajinagar", lat: 18.5308, lng: 73.8475 },
];

export const PUNE_CENTER: [number, number] = [18.55, 73.84];
