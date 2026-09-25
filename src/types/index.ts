export interface Interval {
  start: number;
  end: number;
}

export interface ServiceDto {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  priceCents: number;
  durationMinutes: number;
}

export interface BarberDto {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  workingDays: number[];
}

export interface BookingDetails {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  newClient: boolean;
  discountCents: number;
  date: string;
  startMinutes: number;
  endMinutes: number;
  service: Pick<ServiceDto, "id" | "name" | "priceCents" | "durationMinutes">;
  barber: Pick<BarberDto, "id" | "name">;
}

export interface Slot {
  start: string;
  end: string;
  label: string;
}

export interface BookingResponse {
  booking: {
    reference: string;
    date: string;
    dateLabel: string;
    startLabel: string;
    endLabel: string;
    serviceName: string;
    barberName: string;
    priceCents: number;
    discountCents: number;
    finalPriceCents: number;
    location: string;
  };
  calendar: { googleUrl: string; icsUrl: string };
  emailSent: boolean;
  notice?: string;
}
