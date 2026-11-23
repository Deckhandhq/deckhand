import { prisma } from "../src/client";

async function main() {
  // Point d'entrée pour les données de référence. Aucune donnée de démo.
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
