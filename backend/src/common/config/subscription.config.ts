import { SubscriptionPlan } from '@prisma/client';

export const SUBSCRIPTION_LIMITS: Record<SubscriptionPlan, number> = {
  LITE: 50,
  PRO: 200,
  ENTERPRISE: Infinity,
};
