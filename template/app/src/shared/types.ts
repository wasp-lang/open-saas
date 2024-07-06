import { PrismaClient } from '@prisma/client';

export type PrismaUserDelegate = PrismaClient['user']

export type SubscriptionStatusOptions = 'past_due' | 'cancel_at_period_end' | 'active' | 'deleted';
