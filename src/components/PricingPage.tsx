import { useState, useEffect } from 'react';
import { Check, Crown, Zap, Server, X, CreditCard, DollarSign } from 'lucide-react';
import { Tier, fetchSubscriptionTier, setSubscriptionTier, fetchApiUsage } from '@/lib/supabase';

interface PricingPageProps {
  onClose: () => void;
  onTierChange: (tier: Tier) => void;
}

interface Plan {
  tier: Tier;
  name: string;
  price: number;
  period: string;
  tagline: string;
  features: { text: string; included: boolean }[];
  apiRequests: string;
  highlight?: boolean;
  icon: typeof Crown;
  color: string;
}

const PLANS: Plan[] = [
  {
    tier: 'free',
    name: 'Free',
    price: 0,
    period: 'mo',
    tagline: 'Get started with global trade intelligence',
    icon: Zap,
    color: 'blue',
    features: [
      { text: 'Global interactive map access', included: true },
      { text: 'Standard market research', included: true },
      { text: 'Regular AI assistant', included: true },
      { text: 'Basic seller information', included: true },
      { text: 'PRO AI assistant', included: false },
      { text: 'Premium supplier contacts', included: false },
      { text: 'Priority support', included: false },
      { text: 'Custom dataset downloads', included: false },
    ],
    apiRequests: '1,000/mo',
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: 10,
    period: 'mo',
    tagline: 'Advanced trade optimization for professionals',
    icon: Crown,
    color: 'amber',
    highlight: true,
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'PRO AI assistant', included: true },
      { text: 'Unlocked premium sellers & suppliers', included: true },
      { text: 'Unlimited market research', included: true },
      { text: 'Bulk discount pricing', included: true },
      { text: 'Verified supplier contacts', included: true },
      { text: 'Priority support', included: false },
      { text: 'Custom dataset downloads', included: false },
    ],
    apiRequests: '10,000/mo',
  },
  {
    tier: 'platinum',
    name: 'Platinum',
    price: 25,
    period: 'mo',
    tagline: 'Maximum power for enterprise trade operations',
    icon: Server,
    color: 'purple',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom dataset downloads', included: true },
      { text: 'Advanced analytics dashboard', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom API integrations', included: true },
      { text: 'White-label options', included: true },
      { text: 'Team collaboration tools', included: true },
    ],
    apiRequests: '100,000+/mo',
  },
];

export default function PricingPage({ onClose, onTierChange }: PricingPageProps) {
  const [currentTier, setCurrentTier] = useState<Tier>('free');
  const [checkoutTier, setCheckoutTier] = useState<Tier | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [processing, setProcessing] = useState(false);
  const [apiUsage, setApiUsage] = useState<{ count: number; limit: number }>({ count: 0, limit: 1000 });

  useEffect(() => {
    (async () => {
      const tier = await fetchSubscriptionTier();
      setCurrentTier(tier);
      const usage = await fetchApiUsage();
      setApiUsage({ count: usage.count, limit: usage.limit });
    })();
  }, []);

  const handleSubscribe = async (tier: Tier) => {
    if (tier === 'free') {
      await setSubscriptionTier('free');
      setCurrentTier('free');
      onTierChange('free');
      return;
    }
    setCheckoutTier(tier);
  };

  const handlePayment = async () => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 1500));
    if (checkoutTier) {
      await setSubscriptionTier(checkoutTier);
      setCurrentTier(checkoutTier);
      onTierChange(checkoutTier);
    }
    setProcessing(false);
    setCheckoutTier(null);
  };

  const colorMap: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30', gradient: 'from-blue-500 to-blue-600' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30', gradient: 'from-amber-500 to-orange-500' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30', gradient: 'from-purple-500 to-purple-600' },
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--tp-bg)] animate-fade-in">
      {/* Top bar */}
      <div className="sticky top-0 z-10 px-6 py-4 bg-[var(--tp-surface)]/90 backdrop-blur border-b border-[var(--tp-border)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Crown className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--tp-text)]">Subscription Plans</h1>
            <p className="text-xs text-[var(--tp-text-muted)]">Choose your TradePulse plan</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-[var(--tp-border)] transition-colors text-[var(--tp-text-muted)]"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Current tier banner */}
        <div className="mb-8 p-4 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[currentTier === 'free' ? 'blue' : currentTier === 'pro' ? 'amber' : 'purple'].bg}`}>
              {currentTier === 'free' ? <Zap className={colorMap.blue.text} size={20} /> : currentTier === 'pro' ? <Crown className={colorMap.amber.text} size={20} /> : <Server className={colorMap.purple.text} size={20} />}
            </div>
            <div>
              <div className="text-sm text-[var(--tp-text-muted)]">Current plan</div>
              <div className="text-lg font-bold capitalize text-[var(--tp-text)]">{currentTier}</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-xs text-[var(--tp-text-muted)]">API usage this month</div>
              <div className="text-sm font-semibold text-[var(--tp-text)]">{apiUsage.count} / {apiUsage.limit} requests</div>
            </div>
            <div className="w-32 h-2 rounded-full bg-[var(--tp-border)] overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${Math.min((apiUsage.count / apiUsage.limit) * 100, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan) => {
            const colors = colorMap[plan.color];
            const Icon = plan.icon;
            const isCurrent = currentTier === plan.tier;
            return (
              <div
                key={plan.tier}
                className={`relative rounded-3xl border-2 p-6 transition-all ${
                  plan.highlight
                    ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/5 to-transparent scale-[1.02]'
                    : 'border-[var(--tp-border)] bg-[var(--tp-surface)]'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors.bg}`}>
                    <Icon className={colors.text} size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--tp-text)]">{plan.name}</h3>
                    <p className="text-xs text-[var(--tp-text-muted)]">{plan.tagline}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-[var(--tp-text)]">${plan.price}</span>
                  <span className="text-sm text-[var(--tp-text-muted)]">/{plan.period}</span>
                </div>

                <button
                  onClick={() => handleSubscribe(plan.tier)}
                  disabled={isCurrent}
                  className={`w-full py-3 rounded-xl font-semibold transition-all mb-6 ${
                    isCurrent
                      ? 'bg-[var(--tp-border)] text-[var(--tp-text-muted)] cursor-default'
                      : plan.highlight
                      ? `bg-gradient-to-r ${colors.gradient} text-white hover:scale-[1.02]`
                      : `bg-[var(--tp-bg)] border border-[var(--tp-border)] text-[var(--tp-text)] hover:border-blue-500/40`
                  }`}
                >
                  {isCurrent ? 'Current Plan' : plan.price === 0 ? 'Downgrade to Free' : 'Subscribe'}
                </button>

                <div className="space-y-3">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {f.included ? (
                        <Check size={16} className="text-emerald-500 shrink-0" />
                      ) : (
                        <X size={16} className="text-[var(--tp-text-muted)] shrink-0" />
                      )}
                      <span className={f.included ? 'text-[var(--tp-text)]' : 'text-[var(--tp-text-muted)]'}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--tp-border)]">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[var(--tp-text-muted)]">API requests:</span>
                    <span className="font-semibold text-[var(--tp-text)]">{plan.apiRequests}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note about Developer API */}
        <div className="p-4 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-border)] text-center">
          <p className="text-sm text-[var(--tp-text-muted)]">
            Looking for the Developer API Portal? Click the <span className="font-semibold text-[var(--tp-text)]">Developer API</span> tab in the navigation bar.
          </p>
        </div>
      </div>

      {/* Checkout modal */}
      {checkoutTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => !processing && setCheckoutTier(null)}>
          <div className="w-full max-w-md rounded-3xl bg-[var(--tp-surface)] border border-[var(--tp-border)] shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[var(--tp-text)]">Checkout — {PLANS.find((p) => p.tier === checkoutTier)?.name}</h3>
              {!processing && (
                <button onClick={() => setCheckoutTier(null)} className="text-[var(--tp-text-muted)] hover:text-[var(--tp-text)]">
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="mb-6 p-4 rounded-xl bg-[var(--tp-bg)] border border-[var(--tp-border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--tp-text-muted)]">Plan</span>
                <span className="text-sm font-semibold text-[var(--tp-text)]">{PLANS.find((p) => p.tier === checkoutTier)?.name}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--tp-text-muted)]">Billing</span>
                <span className="text-sm font-semibold text-[var(--tp-text)]">Monthly</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[var(--tp-border)]">
                <span className="text-sm font-semibold text-[var(--tp-text)]">Total</span>
                <span className="text-2xl font-bold text-[var(--tp-text)]">${PLANS.find((p) => p.tier === checkoutTier)?.price}/mo</span>
              </div>
            </div>

            {/* Payment method selection */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-[var(--tp-text)] mb-3">Payment Method</div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    paymentMethod === 'stripe' ? 'border-blue-500 bg-blue-500/5' : 'border-[var(--tp-border)]'
                  }`}
                >
                  <CreditCard className={paymentMethod === 'stripe' ? 'text-blue-500' : 'text-[var(--tp-text-muted)]'} size={24} />
                  <span className="text-sm font-medium text-[var(--tp-text)]">Stripe</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-500/5' : 'border-[var(--tp-border)]'
                  }`}
                >
                  <DollarSign className={paymentMethod === 'paypal' ? 'text-blue-500' : 'text-[var(--tp-text-muted)]'} size={24} />
                  <span className="text-sm font-medium text-[var(--tp-text)]">PayPal</span>
                </button>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                processing
                  ? 'bg-[var(--tp-border)] text-[var(--tp-text-muted)]'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:scale-[1.02]'
              }`}
            >
              {processing ? 'Processing...' : `Pay $${PLANS.find((p) => p.tier === checkoutTier)?.price} with ${paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'}`}
            </button>

            <p className="mt-3 text-center text-xs text-[var(--tp-text-muted)]">
              Secure checkout powered by {paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
