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

  // 🏋️ Crear Gym (idempotente)
  let gym = await prisma.gym.findFirst({ where: { name: "Gym Demo" } });
  if (!gym) {
    gym = await prisma.gym.create({
      data: {
        name: "Gym Demo",
        street: "Av. Siempre Viva 742",
        city: "Buenos Aires",
        province: "Buenos Aires",
        phone: "1122334455",
        email: "demo@gym.com",
        accessUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // 🔐 Hash password
  const hashedPassword = await bcrypt.hash("asd123", 10);

  // 👑 Crear Admin del sistema (sin gymId)
  const admin = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {
      role: UserRole.ADMIN,
      password: {
        update: { hash: hashedPassword },
      },
    },
    create: {
      email: "admin@gmail.com",
      role: UserRole.ADMIN,
      password: {
        create: { hash: hashedPassword },
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

  // 💳 Catálogo de planes SaaS (días de uso que paga el gimnasio por usar el sistema)
  const saasPlans = [
    { name: "Plan 30 días", days: 30, price: 10000 },
    { name: "Plan 90 días", days: 90, price: 27000 },
    { name: "Plan 365 días", days: 365, price: 90000 },
  ];

  for (const plan of saasPlans) {
    const existing = await prisma.subscriptionPlan.findFirst({
      where: { days: plan.days },
    });
    if (existing) {
      await prisma.subscriptionPlan.update({
        where: { id: existing.id },
        data: { name: plan.name, price: plan.price, active: true },
      });
    } else {
      await prisma.subscriptionPlan.create({
        data: { name: plan.name, days: plan.days, price: plan.price, active: true },
      });
    }
  }

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
