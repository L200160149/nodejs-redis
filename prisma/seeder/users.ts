import { faker } from "@faker-js/faker";
import { prismaClient } from "../../src/applications/database";

async function main() {
  console.log("Seeding database...");

  const users = Array.from({ length: 1000 }, () => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    age: faker.number.int({ min: 18, max: 60 }),
    location: faker.location.city(),
  }));

  await prismaClient.user.createMany({ data: users });

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
