import { supabase } from './supabase';
import type { BadgeId } from '../types';

export type PlanKey = 'society' | BadgeId;

const FN_URL = 'https://rqlucgdeuvpkkrbnvjex.supabase.co/functions/v1/pd-paypal';

async function callFn(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch(FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'PayPal request failed');
  return data;
}

export async function createPlanSubscription(planKey: PlanKey, email: string): Promise<string> {
  const data = await callFn({ action: 'create-subscription', planKey, email });
  return data.subscriptionId as string;
}

export async function activatePlanSubscription(
  subscriptionId: string,
  userId: string,
  email: string,
  planKey: PlanKey,
): Promise<void> {
  await callFn({ action: 'activate', subscriptionId, userId, email, planKey });
}

export async function cancelPlanSubscription(userId: string, planKey: PlanKey): Promise<void> {
  await callFn({ action: 'cancel-subscription', userId, planKey });
}

// Best-effort: returns [] on failure so identity building never breaks on a
// subscriptions-table hiccup.
export async function fetchActivePlans(userId: string): Promise<PlanKey[]> {
  const { data, error } = await supabase
    .from('pd_subscriptions')
    .select('plan_key')
    .eq('user_id', userId)
    .eq('status', 'active');
  if (error) return [];
  return ((data ?? []) as { plan_key: PlanKey }[]).map((r) => r.plan_key);
}
