import { prisma } from "../src/client";

async function main() {
  // Entry point for reference data. No demo data.
  void prisma;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
