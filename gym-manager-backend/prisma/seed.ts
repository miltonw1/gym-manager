import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcrypt";

async function main() {
  // 🔌 Crear conexión PG
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);

  const prisma = new PrismaClient({
    adapter,
  });

  console.log("🌱 Seeding database...");

  // 🏋️ Crear Gym
  const gym = await prisma.gym.create({
    data: {
      name: "Gym Demo",
      street: "Av. Siempre Viva 742",
      city: "Buenos Aires",
      province: "Buenos Aires",
      phone: "1122334455",
      email: "demo@gym.com",
    },
  });

  // 🔐 Hash password
  const hashedPassword = await bcrypt.hash("asd123", 10);

  // 👑 Crear Admin del sistema (sin gymId)
  const admin = await prisma.user.create({
    data: {
      email: "admin@gmail.com",
      role: UserRole.ADMIN,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  // 👨‍💼 Crear Staff del gym
  // const staff = await prisma.user.create({
  //   data: {
  //     email: "staff@gym.com",
  //     role: UserRole.STAFF,
  //     gymId: gym.id,
  //     password: {
  //       create: {
  //         hash: hashedPassword,
  //       },
  //     },
  //   },
  // });

  console.log("✅ Seed completed");
  console.log("Admin:", admin.email);
  // console.log("Staff:", staff.email);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error("❌ Seed error:", e);
  process.exit(1);
});
