const fmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const inr = (n: number) => fmt.format(Math.round(n));

export const km = (n: number) => `${n < 10 ? n.toFixed(1) : Math.round(n)} km`;

export const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/** yyyy-mm-dd shifted by `days`, timezone-safe (works on the date part only). */
export function addDays(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Local calendar date as yyyy-mm-dd (en-CA formats that way). */
export const todayIso = () => new Date().toLocaleDateString("en-CA");
