const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean up existing data
  await prisma.application.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned up existing data.');

  // 2. Create mock user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo@jobautofiller.ai',
      name: 'Demo User',
      password: hashedPassword,
    },
  });

  console.log('👤 Created demo user (demo@jobautofiller.ai / password123)');

  // 3. Create mock profile
  await prisma.profile.create({
    data: {
      userId: user.id,
      firstName: 'Demo',
      lastName: 'User',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      headline: 'Senior Full-Stack Engineer',
      summary: 'Experienced software engineer specializing in React, Node.js, and cloud architectures. Passionate about building scalable applications and intuitive user interfaces.',
      linkedinUrl: 'https://linkedin.com/in/demouser',
      githubUrl: 'https://github.com/demouser',
      portfolioUrl: 'https://demouser.dev',
      yearsOfExp: 5,
      skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'AWS'],
      experience: [
        { title: 'Senior Engineer', company: 'Tech Corp', startDate: '2020-01', current: true },
        { title: 'Software Engineer', company: 'Startup Inc', startDate: '2017-05', endDate: '2019-12', current: false }
      ],
      education: [
        { institution: 'University of Technology', degree: 'B.S.', field: 'Computer Science', startDate: '2013-09', endDate: '2017-05', current: false }
      ]
    },
  });

  console.log('📝 Created demo profile');

  // 4. Create mock applications
  await prisma.application.createMany({
    data: [
      { userId: user.id, company: 'Google', role: 'Software Engineer', status: 'interview', portal: 'Greenhouse' },
      { userId: user.id, company: 'Stripe', role: 'Frontend Engineer', status: 'applied', portal: 'Lever' },
      { userId: user.id, company: 'Netflix', role: 'Senior UI Engineer', status: 'rejected', portal: 'Workday' },
      { userId: user.id, company: 'Airbnb', role: 'Full-Stack Developer', status: 'offer', portal: 'Ashby' },
    ]
  });

  console.log('📋 Created demo applications');

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
