/**
 * Single source of truth for shop details. Change values here and the site,
 * emails, calendar events and availability engine all follow.
 */
export interface DayHours {
  /** Minutes after midnight, or null when closed */
  open: number | null;
  close: number | null;
}

const h = (hours: number, minutes = 0) => hours * 60 + minutes;

export const shop = {
  name: "Copperline Barbers",
  shortName: "Copperline",
  phone: "+27 58 668 0142",
  phoneHref: "tel:+27586680142",
  email: "copperline@gmail.com",
  address: {
    street: "150 Tshiame A",
    suburb: "Harrismith",
    city: "Harrismith",
    postcode: "9880",
    country: "South Africa",
  },
  mapQuery: "Tshiame A, Harrismith, South Africa",
  timezone: "Africa/Johannesburg",
  currency: "ZAR",
  locale: "en-ZA",
  social: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
  },
  /** Booking rules */
  slotIntervalMinutes: 15,
  minLeadMinutes: 60,
  maxAdvanceDays: 28,
  newClientDiscountRand: 50,
  /** Index 0 = Sunday */
  hours: [
    { open: null, close: null },
    { open: null, close: null },
    { open: h(9), close: h(18) },
    { open: h(9), close: h(18) },
    { open: h(9), close: h(19, 30) },
    { open: h(9), close: h(18) },
    { open: h(8), close: h(15) },
  ] as DayHours[],
} as const;

export function fullAddress(): string {
  const a = shop.address;
  return `${a.street}, ${a.suburb}, ${a.city} ${a.postcode}, ${a.country}`;
}

export const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
