import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'technology' },
      update: {},
      create: { name: 'technology' },
    }),
    prisma.tag.upsert({
      where: { name: 'programming' },
      update: {},
      create: { name: 'programming' },
    }),
    prisma.tag.upsert({
      where: { name: 'web-development' },
      update: {},
      create: { name: 'web-development' },
    }),
    prisma.tag.upsert({
      where: { name: 'ai' },
      update: {},
      create: { name: 'ai' },
    }),
  ]);

  console.log(
    '✅ Tags created:',
    tags.map((tag) => tag.name)
  );

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@niunmango.com' },
    update: {},
    create: {
      email: 'admin@niunmango.com',
      name: 'Admin User',
      password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', // password: admin123
      role: 'ADMIN',
      profile: {
        create: {
          bio: 'System Administrator',
          location: 'San Francisco, CA',
          website: 'https://niunmango.com',
        },
      },
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create regular user
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@niunmango.com' },
    update: {},
    create: {
      email: 'user@niunmango.com',
      name: 'Regular User',
      password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', // password: user123
      role: 'USER',
      profile: {
        create: {
          bio: 'Regular user of the platform',
          location: 'New York, NY',
        },
      },
    },
  });

  console.log('✅ Regular user created:', regularUser.email);

  // Create sample posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Welcome to NiunMango',
        content: 'This is the first post on our platform. Welcome everyone!',
        published: true,
        authorId: adminUser.id,
        tags: {
          connect: [{ name: 'technology' }, { name: 'web-development' }],
        },
      },
    }),
    prisma.post.create({
      data: {
        title: 'Getting Started with Prisma',
        content:
          'Prisma is a modern database toolkit that makes database access easy and type-safe.',
        published: true,
        authorId: regularUser.id,
        tags: {
          connect: [{ name: 'programming' }, { name: 'web-development' }],
        },
      },
    }),
    prisma.post.create({
      data: {
        title: 'The Future of AI in Web Development',
        content:
          'Artificial Intelligence is revolutionizing how we build and maintain web applications.',
        published: false,
        authorId: adminUser.id,
        tags: {
          connect: [{ name: 'ai' }, { name: 'technology' }],
        },
      },
    }),
  ]);

  console.log(
    '✅ Posts created:',
    posts.map((post) => post.title)
  );

  // Create sample comments
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        content: 'Great post! Looking forward to more content.',
        authorId: regularUser.id,
        postId: posts[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Very informative article about Prisma.',
        authorId: adminUser.id,
        postId: posts[1].id,
      },
    }),
  ]);

  console.log('✅ Comments created:', comments.length);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
