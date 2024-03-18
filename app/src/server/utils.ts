import { PrismaClient } from '@prisma/client';

// we export this instance of PrismaClient to be used in our e2e tests
export const prisma = new PrismaClient();
