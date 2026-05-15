export type PlanType = "FREE" | "PRO";

export const PLAN_LIMITS: Record<
  PlanType,
  { prs: number; prsCreated: number; issues: number; chat: number }
> = {
  FREE: {
    prs: 50,
    prsCreated: 15,
    issues: 50,
    chat: 200,
  },
  PRO: {
    prs: 150,
    prsCreated: 50,
    issues: 200,
    chat: 1000,
  },
};

export type PlanType = keyof typeof PLAN_LIMITS;
