import { useEffect, useRef, useState } from 'react';
import { PAYPAL_CLIENT_ID } from '../lib/paypal';
import { activatePlanSubscription, createPlanSubscription, type PlanKey } from '../lib/subscriptions';

let sdkPromise: Promise<void> | null = null;
function loadPaypalSdk(): Promise<void> {
  if ((window as any).paypal) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load PayPal'));
    document.body.appendChild(script);
  });
  return sdkPromise;
}

interface Props {
  planKey: PlanKey;
  userId: string;
  email: string;
  onSuccess: () => void;
}

export default function PaypalButton({ planKey, userId, email, onSuccess }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    loadPaypalSdk()
      .then(() => {
        const paypal = (window as any).paypal;
        if (cancelled || rendered.current || !ref.current || !paypal?.Buttons) return;
        rendered.current = true;
        paypal
          .Buttons({
            style: { shape: 'pill', color: 'black', label: 'subscribe' },
            createSubscription: () => createPlanSubscription(planKey, email),
            onApprove: async (data: { subscriptionID: string }) => {
              try {
                await activatePlanSubscription(data.subscriptionID, userId, email, planKey);
                onSuccess();
              } catch {
                setError('Payment received — activating shortly. Please refresh in a moment.');
              }
            },
            onError: () => setError('Something went wrong with PayPal. Please try again.'),
          })
          .render(ref.current);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load PayPal. Please try again.');
      });
    return () => {
      cancelled = true;
    };
  }, [planKey, userId, email, onSuccess]);

  return (
    <div>
      <div ref={ref} style={{ minHeight: 44 }} />
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
