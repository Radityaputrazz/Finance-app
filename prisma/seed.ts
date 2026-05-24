import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { DEFAULT_CATEGORIES } from "../config/app";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Starting seed...");

  // Create demo user
  const hashedPassword = await bcrypt.hash("Demo@12345", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@financeku.app" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@financeku.app",
      password: hashedPassword,
    },
  });

  console.log(`✅ User: ${user.email}`);

  // Seed default categories
  const existingCats = await prisma.category.count({ where: { userId: user.id } });
  if (existingCats === 0) {
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        userId: user.id,
        isDefault: true,
      })),
    });
    console.log(`✅ Categories: ${DEFAULT_CATEGORIES.length} created`);
  }

  // Seed default wallet
  const existingWallets = await prisma.wallet.count({ where: { userId: user.id } });
  if (existingWallets === 0) {
    await prisma.wallet.create({
      data: {
        name: "Dompet Tunai",
        type: "CASH",
        balance: 5000000,
        userId: user.id,
        icon: "💵",
        color: "#10b981",
      },
    });
    console.log("✅ Wallet: Dompet Tunai created");
  }

  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });