"use client";

import { useUsage } from "@/components/providers/usage-provider";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { SubscriptionCard } from "./_components/subscription-card";
import BillingLoading from "./loading";
export default function BillingPage() {
  const { isLoaded, isSignedIn } = useAuthRedirect();
  const { usage, loading: usageLoading } = useUsage();

  if (!isLoaded || usageLoading) {
    return <BillingLoading />;
  }

  if (!isSignedIn) {
    return null;
  }

  const isPro = usage?.plan === "PRO";

  const handleUpgrade = () => {
    // Razorpay is coming soon, do nothing or show alert
    alert("Paid billing is coming soon!");
  };

  const handleManageSubscription = () => {
    alert("Paid billing is coming soon!");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="app-header">
        <div className="app-kicker">Plans</div>
        <h1 className="app-title text-white mt-3">Billing</h1>
        <p className="app-subtitle mt-1">
          Choose the plan that fits your review volume.
        </p>
      </div>

      <SubscriptionCard
        isPro={isPro}
        onUpgrade={handleUpgrade}
        onManageSubscription={handleManageSubscription}
        loading={false}
      />
    </div>
  );
}
