import { PrismaClient } from "@prisma/client";
import { catalogBarbers, catalogServices } from "../src/config/catalog";

const prisma = new PrismaClient();

async function main() {
  for (const [i, s] of catalogServices.entries()) {
    await prisma.service.upsert({ where: { slug: s.slug }, update: { ...s, sortOrder: i }, create: { ...s, sortOrder: i } });
  }
  for (const [i, b] of catalogBarbers.entries()) {
    await prisma.barber.upsert({ where: { slug: b.slug }, update: { ...b, sortOrder: i }, create: { ...b, sortOrder: i } });
  }
  console.log(`Seeded ${catalogServices.length} services and ${catalogBarbers.length} barbers.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
