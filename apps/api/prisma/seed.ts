import { PrismaClient } from '@prisma/client';
import { Prisma, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Demo phones mapped to roles
  const phoneToRole: Record<string, Role> = {
    '9899000001': 'farmer',     // farmer
    '9899000002': 'consumer',   // consumer
    '9899000003': 'bulk_buyer', // buyer
    '9899000004': 'warehouse_operator', // warehouse operator
    '9899000005': 'operations_admin', // ops admin
    '9899000006': 'platform_admin',   // platform admin
    '9899000007': 'finance_partner',  // finance partner
  };

  for (const [phone, role] of Object.entries(phoneToRole)) {
    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: {
        phone,
        name: `Demo ${role}`,
        role,
        lang: 'en',
        status: 'ACTIVE',
        email: `${role}@demo.local`,
      },
    });
    console.log(`Created user: ${user.phone} ${user.name} (${user.role})`);
  }

  // OTP code used for all demo logins
  const otpCode = '123456';

  console.log('Seed complete. Demo OTP: 123456');
  console.log('Demo login flow: POST /auth/demo/login {role} → {identifier, demoCode, user}; then POST /auth/otp/verify {identifier, channel:"phone", code:demoCode}');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });