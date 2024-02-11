import { prismaClient } from './prisma';

const plans = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
  },
];

export default async () => {
  console.log('Seeding database');
  plans.forEach(async (plan) => {
    await prismaClient.plans.upsert({
      where: { id: plan.id },
      update: {
        price: plan.price,
        name: plan.name,
      },
      create: {
        id: plan.id,
        price: plan.price,
        name: plan.name,
      },
    });
  });
};
