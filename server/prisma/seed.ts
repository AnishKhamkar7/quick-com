import { PrismaClient, ProductCategory } from "@prisma/client";
import prisma from "../src/db";
import { products } from "./products";

async function main() {
  console.log("🌱 Seeding products...");

  await prisma.product.createMany({
    data: products,
  });

  console.log("✅ Products seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
