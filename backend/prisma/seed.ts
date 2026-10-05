import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing records in correct relation order
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@123', salt);
  const ownerPassword = await bcrypt.hash('Owner@123', salt);
  const userPassword = await bcrypt.hash('User@123', salt);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator Roxiler',
      email: 'admin@roxiler.com',
      password: adminPassword,
      address: 'Roxiler Systems HQ, Baner Road, Baner, Pune, Maharashtra 411045',
      role: Role.ADMIN,
    },
  });

  // 2. Create Store Owners
  const owner1 = await prisma.user.create({
    data: {
      name: 'Rajesh Sharma Store Manager',
      email: 'rajesh.owner@store.com',
      password: ownerPassword,
      address: 'Shop 12, Phoenix Marketcity, Viman Nagar, Pune, Maharashtra 411014',
      role: Role.STORE_OWNER,
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Sunita Deshmukh Enterprise',
      email: 'sunita.owner@store.com',
      password: ownerPassword,
      address: 'Commercial Bay 4, Aundh High Street, Aundh, Pune, Maharashtra 411007',
      role: Role.STORE_OWNER,
    },
  });

  // 3. Create Normal Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Rahul Sitaram Sharma Pune',
      email: 'rahul.sharma@example.com',
      password: userPassword,
      address: 'Flat 402, Green Acres Society, Tathawade, Pune, Maharashtra 411033',
      role: Role.USER,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Ananya Vikram Joshi Tech',
      email: 'ananya.joshi@example.com',
      password: userPassword,
      address: 'Plot 18, Model Colony, Shivajinagar, Pune, Maharashtra 411016',
      role: Role.USER,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Rohan Mahendra Kulkarni IT',
      email: 'rohan.kulkarni@example.com',
      password: userPassword,
      address: 'Tower B, Blue Ridge Township, Hinjawadi Phase 1, Pune 411057',
      role: Role.USER,
    },
  });

  // 4. Create Stores
  const store1 = await prisma.store.create({
    data: {
      name: 'TechNova Electronics Superstore',
      email: 'contact@technovastore.com',
      address: 'Shop 12, Phoenix Marketcity, Viman Nagar, Pune, Maharashtra 411014',
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Organic Harvest Market & Cafe',
      email: 'info@organicharvest.com',
      address: 'Commercial Bay 4, Aundh High Street, Aundh, Pune, Maharashtra 411007',
      ownerId: owner2.id,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Apex Sports and Fitness Center',
      email: 'support@apexsports.com',
      address: 'Building 7, Balewadi High Street, Baner, Pune, Maharashtra 411045',
    },
  });

  // 5. Create Ratings
  await prisma.rating.createMany({
    data: [
      { userId: user1.id, storeId: store1.id, rating: 5 },
      { userId: user1.id, storeId: store2.id, rating: 4 },
      { userId: user2.id, storeId: store1.id, rating: 4 },
      { userId: user2.id, storeId: store2.id, rating: 5 },
      { userId: user3.id, storeId: store1.id, rating: 5 },
      { userId: user3.id, storeId: store3.id, rating: 4 },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('Admin:', admin.email);
  console.log('Store Owners:', owner1.email, owner2.email);
  console.log('Users:', user1.email, user2.email, user3.email);
  console.log('Stores created:', store1.name, store2.name, store3.name);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
