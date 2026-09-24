import { catalogBarbers, catalogServices } from "@/config/catalog";
import { barberRepository, serviceRepository } from "@/repositories/prisma";
import type { BarberDto, ServiceDto } from "@/types";

/** For marketing pages: use the database, but keep the pages up if it is unreachable. */
export async function getServices(): Promise<ServiceDto[]> {
  try {
    const rows = await serviceRepository.listActive();
    if (rows.length) return rows;
  } catch (error) {
    console.error("Service lookup failed, using catalogue fallback:", (error as Error).message);
  }
  return catalogServices.map((s) => ({ ...s, id: s.slug }));
}

export async function getBarbers(): Promise<BarberDto[]> {
  try {
    const rows = await barberRepository.listActive();
    if (rows.length) return rows;
  } catch (error) {
    console.error("Barber lookup failed, using catalogue fallback:", (error as Error).message);
  }
  return catalogBarbers.map((b) => ({ ...b, id: b.slug }));
}
