import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sentinellink.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password';

    console.log(`Seed: Checking for existing admin user (${adminEmail})...`);

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (existingAdmin) {
        console.log('Seed: Admin user already exists. Updating password...');
        const hashed = await bcrypt.hash(adminPassword, 12);
        await prisma.user.update({
            where: { email: adminEmail },
            data: { passwordHash: hashed, role: 'ADMIN' },
        });
    } else {
        console.log('Seed: Creating new admin user...');
        const hashed = await bcrypt.hash(adminPassword, 12);
        await prisma.user.create({
            data: {
                name: 'Super Admin',
                email: adminEmail,
                passwordHash: hashed,
                role: 'ADMIN',
            },
        });
    }

    console.log('Seed: Completed successfully!');
}

main()
    .catch((e) => {
        console.error('Seed Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
