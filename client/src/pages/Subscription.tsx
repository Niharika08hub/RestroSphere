import React, { useEffect, useMemo, useState } from "react";
import { Check, Crown, ExternalLink, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

type PlanKey = "monthly" | "quarterly" | "yearly";

const PLANS: Record<PlanKey, {
  name: string;
  duration: string;
  amount: number;
  months: number;
  badge?: string;
  features: string[];
}> = {
  monthly: {
    name: "Monthly",
    duration: "1 month",
    amount: 999,
    months: 1,
    features: [
      "Full restaurant management dashboard",
      "Restaurant public website",
      "Orders, reservations & tables",
      "Kitchen, waiter & manager access",
      "Analytics & AI features",
    ],
  },
  quarterly: {
    name: "3 Months",
    duration: "3 months",
    amount: 2699,
    months: 3,
    badge: "Most Popular",
    features: [
      "Everything in Monthly",
      "3 months uninterrupted access",
      "Custom restaurant URL",
      "Priority operational access",
      "No monthly renewal for 3 months",
    ],
  },
  yearly: {
    name: "Yearly",
    duration: "12 months",
    amount: 8999,
    months: 12,
    badge: "Best Value",
    features: [
      "Everything in Monthly",
      "12 months uninterrupted access",
      "Custom restaurant URL",
      "Best effective monthly price",
      "No monthly renewal for 1 year",
    ],
  },
};

const loadRazorpay = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const getToken = () =>
  sessionStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  "";

const getRole = () => {
  // The app stores the logged-in user separately as well.
  // Prefer it when available because some auth flows do not
  // put the role in the JWT payload.
  try {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const userRole = String(user?.role || "").trim().toLowerCase();
      if (userRole) return userRole;
    }
  } catch {
    // Fall through to JWT role.
  }

  try {
    const token = getToken();
    if (!token) return "";

    const parts = token.split(".");
    if (parts.length !== 3) return "";

    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    return String(payload?.role || "").trim().toLowerCase();
  } catch {
    return "";
  }
};

async function api(path: string, options: RequestInit = {}) {
  const token = getToken();

  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Invalid response received from server.");
  }

  if (!response.ok) {
    throw new Error(data?.message || "Request failed.");
  }

  return data;
}

function Subscription() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<PlanKey>("quarterly");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const plan = useMemo(() => PLANS[selected], [selected]);

  useEffect(() => {
    const token = getToken();
    const role = getRole();

    // Plans are public. Only load private subscription data for an owner.
    if (!token || role !== "owner") {
      setLoadingData(false);
      return;
    }

    api("/api/subscriptions/me")
      .then((data) => {
        setSubscription(data.subscription || null);
        setRestaurant(data.restaurant || null);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Unable to load subscription.");
      })
      .finally(() => setLoadingData(false));
  }, []);

  const startPayment = async () => {
    setError("");
    setMessage("");

    const token = getToken();

    // The backend is responsible for authorizing the owner.
    // On the frontend, an existing auth token is enough to start
    // the payment flow. Do not redirect a valid logged-in user
    // just because the role is stored differently in the JWT/user object.
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const loaded = await loadRazorpay();
      if (!loaded) {
        throw new Error("Razorpay checkout could not be loaded.");
      }

      const orderData = await api("/api/subscriptions/create-order", {
        method: "POST",
        body: JSON.stringify({ plan: selected }),
      });

      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "RestroSphere",
        description: `${plan.name} Restaurant Subscription`,
        order_id: orderData.order.id,
        prefill: {
          name: orderData.owner?.fullName || "",
          email: orderData.owner?.email || "",
          contact: orderData.owner?.phone || "",
        },
        theme: {
          color: "#ff6500",
        },
        modal: {
          confirm_close: true,
          animation: true,
        },
        handler: async (response: any) => {
          try {
            setLoading(true);

            const verified = await api("/api/subscriptions/verify", {
              method: "POST",
              body: JSON.stringify({
                plan: selected,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            setSubscription(verified.subscription);
            setRestaurant(verified.restaurant);
            setMessage(
              "Payment verified successfully. Your restaurant website is now active."
            );
          } catch (e) {
            setError(
              e instanceof Error
                ? e.message
                : "Payment verification failed."
            );
          } finally {
            setLoading(false);
          }
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response: any) => {
        setError(
          response?.error?.description ||
            "Payment failed. Please try again."
        );
        setLoading(false);
      });

      razorpay.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to start payment.");
      setLoading(false);
    }
  };

  const publicUrl = restaurant?.slug
    ? `${window.location.origin}/r/${restaurant.slug}`
    : "";

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#172033]">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-2xl font-extrabold"
          >
            Restro<span className="text-orange-500">Sphere</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/owner/dashboard")}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold hover:border-orange-300 hover:text-orange-600"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-12 lg:py-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
            <Crown size={15} />
            RestroSphere Subscription
          </div>

          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Grow your restaurant with{" "}
            <span className="text-orange-500">one platform.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-gray-500 leading-7">
            Choose your access period, complete secure payment, and get your
            restaurant's public website URL immediately.
          </p>
        </div>

        {message && (
          <div className="mt-8 max-w-3xl mx-auto rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-8 max-w-3xl mx-auto rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {!loadingData && subscription?.status === "active" && publicUrl && (
          <div className="mt-8 max-w-4xl mx-auto rounded-3xl border border-orange-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-600">
                  Subscription Active
                </p>
                <h2 className="mt-2 text-2xl font-extrabold">
                  Your restaurant is live
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Valid until{" "}
                  {subscription.endDate
                    ? new Date(subscription.endDate).toLocaleDateString("en-IN")
                    : "—"}
                </p>
              </div>

              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                Open Restaurant Website
                <ExternalLink size={16} />
              </a>
            </div>

            <div className="mt-5 rounded-2xl bg-gray-50 px-4 py-3 text-sm">
              <span className="font-semibold">Your URL: </span>
              <span className="text-orange-600 break-all">{publicUrl}</span>
            </div>
          </div>
        )}

        <section className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(
            ([key, item]) => {
              const active = selected === key;

              return (
                <div
                  key={key}
                  className={`relative text-left rounded-3xl border p-6 sm:p-7 bg-white transition ${
                    active
                      ? "border-orange-500 ring-2 ring-orange-100 shadow-lg"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  {item.badge && (
                    <span className="absolute right-5 top-5 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
                      {item.badge}
                    </span>
                  )}

                  <p className="text-sm font-bold text-gray-400">
                    {item.name}
                  </p>

                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-4xl font-extrabold">
                      ₹{item.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="pb-1 text-sm text-gray-400">
                      / {item.duration}
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    {item.features.map((feature) => (
                      <div key={feature} className="flex gap-2 text-sm text-gray-600">
                        <Check size={18} className="mt-0.5 shrink-0 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelected(key);
                      setError("");
                      setMessage("");
                    }}
                    className={`mt-7 w-full h-11 rounded-xl flex items-center justify-center text-sm font-extrabold transition ${
                      active
                        ? "bg-orange-500 text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    {active ? "Selected" : "Choose Plan"}
                  </button>

                  {active && (
                    <button
                      type="button"
                      onClick={startPayment}
                      disabled={loading}
                      className="mt-3 w-full h-11 rounded-xl bg-[#172033] text-white flex items-center justify-center gap-2 text-sm font-extrabold hover:bg-[#202b42] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Pay Now"
                      )}
                    </button>
                  )}
                </div>
              );
            }
          )}
        </section>

        <section className="mt-8 rounded-3xl bg-[#172033] text-white p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <ShieldCheck className="text-orange-400 shrink-0" />
              <div>
                <p className="font-bold">Verified payment</p>
                <p className="mt-1 text-xs text-white/60">
                  Payment is verified on the server before access is activated.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Sparkles className="text-orange-400 shrink-0" />
              <div>
                <p className="font-bold">Instant activation</p>
                <p className="mt-1 text-xs text-white/60">
                  Your restaurant URL becomes active after successful payment.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <ExternalLink className="text-orange-400 shrink-0" />
              <div>
                <p className="font-bold">Custom URL</p>
                <p className="mt-1 text-xs text-white/60">
                  Change the restaurant slug later from Owner Settings.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 text-center text-xs text-gray-400">
          Payments are processed securely by Razorpay. RestroSphere never stores
          card, UPI PIN or banking credentials.
        </div>
      </main>
    </div>
  );
}

export default Subscription;