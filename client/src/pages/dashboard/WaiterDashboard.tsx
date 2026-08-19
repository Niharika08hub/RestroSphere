import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle, Bell, CheckCircle2, ChefHat, Clock3, CreditCard,
  Info, LogOut, Menu, RefreshCw, Search, ShoppingBag, Table2, User,
  UtensilsCrossed, X,
} from "lucide-react";

type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";
type PaymentStatus = "pending" | "paid" | "failed";
type QueueFilter = "all" | OrderStatus | "payment";

type OrderItem = { name: string; price: number; quantity: number };
type WaiterOrder = {
  _id: string;
  orderNumber?: string;
  customerName?: string;
  customer?: { name?: string; fullName?: string };
  customerId?: string;
  tableNumber?: string | number;
  tableNo?: string | number;
  table?: string | number | { number?: string | number; tableNumber?: string | number };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  createdAt: string;
  updatedAt?: string;
  specialInstructions?: string;
  notes?: string;
  allergy?: string;
  allergyAlert?: string;
  allergies?: string | string[];
  dietaryRequirement?: string;
  dietaryNotes?: string;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  tone: "orange" | "blue" | "green" | "red";
  orderId?: string;
};

const getToken = () =>
  sessionStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  "";
  const API_ORIGIN =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

const orderNumber = (o: WaiterOrder) =>
  (o.orderNumber || o._id.slice(-6)).toString().toUpperCase();

const customerDisplayName = (o: WaiterOrder) =>
  o.customerName ||
  o.customer?.name ||
  o.customer?.fullName ||
  "Guest";

const tableDisplayName = (o: WaiterOrder) => {
  const value =
    o.tableNumber ??
    o.tableNo ??
    (typeof o.table === "object"
      ? o.table?.number ?? o.table?.tableNumber
      : o.table);

  return value !== undefined && value !== null && String(value).trim() !== ""
    ? String(value)
    : "—";
};

const activeQueue = (list: WaiterOrder[]) =>
  list
    .filter(o => ["pending", "preparing", "ready"].includes(o.status))
    .sort((a, b) => {
      const rank = (s: OrderStatus) =>
        s === "ready" ? 0 : s === "preparing" ? 1 : 2;
      return rank(a.status) - rank(b.status) ||
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

const money = (v: number) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const dateTime = (v?: string) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      });
};

const elapsed = (o: WaiterOrder, now: number) => {
  const start =
    o.status === "ready" ? o.updatedAt || o.createdAt : o.createdAt;
  const t = new Date(start).getTime();
  return Number.isFinite(t) ? Math.max(0, Math.floor((now - t) / 60000)) : 0;
};

const dietary = (o: WaiterOrder) => {
  const values: string[] = [];
  if (o.allergy) values.push(o.allergy);
  if (o.allergyAlert) values.push(o.allergyAlert);
  if (Array.isArray(o.allergies)) values.push(...o.allergies);
  else if (o.allergies) values.push(o.allergies);
  if (o.dietaryRequirement) values.push(o.dietaryRequirement);
  if (o.dietaryNotes) values.push(o.dietaryNotes);
  return [...new Set(values.map(String).map(v => v.trim()).filter(Boolean))].join(" · ");
};

const statusLabel = (s: OrderStatus) =>
  ({
    pending: "New Order",
    preparing: "Preparing",
    ready: "Ready to Serve",
    completed: "Served",
    cancelled: "Cancelled",
  } as Record<OrderStatus, string>)[s];

const statusClass = (s: OrderStatus) =>
  ({
    pending: "bg-orange-50 text-orange-600",
    preparing: "bg-blue-50 text-blue-600",
    ready: "bg-green-50 text-green-600",
    completed: "bg-gray-100 text-gray-600",
    cancelled: "bg-red-50 text-red-600",
  } as Record<OrderStatus, string>)[s];

const WaiterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const restaurantSlug =
    location.pathname.startsWith("/r/")
      ? location.pathname.split("/")[2]
      : null;

  const [restaurantBrand, setRestaurantBrand] = useState<{
    _id?: string;
    name?: string;
    logo?: string;
    slug?: string;
  } | null>(null);

  const [orders, setOrders] = useState<WaiterOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [paymentUpdating, setPaymentUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<QueueFilter>("all");
  const [now, setNow] = useState(Date.now());
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selected, setSelected] = useState<WaiterOrder | null>(null);
  const [error, setError] = useState("");
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("waiterReadNotifications") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
  const loadRestaurantBrand = async () => {
    try {
      // 1. Check already selected restaurant
      const savedRestaurant =
        sessionStorage.getItem("selectedRestaurant");

      if (savedRestaurant) {
        try {
          const restaurant =
            JSON.parse(savedRestaurant);

          setRestaurantBrand({
            _id:
              restaurant._id ||
              restaurant.id,
            name: restaurant.name,
            logo: restaurant.logo,
            slug: restaurant.slug,
          });

          if (restaurant._id || restaurant.id) {
            sessionStorage.setItem(
              "restaurantId",
              restaurant._id ||
                restaurant.id
            );
          }

          return;
        } catch {
          sessionStorage.removeItem(
            "selectedRestaurant"
          );
        }
      }

      // 2. Direct restaurant URL
      if (!restaurantSlug) return;

      const response = await fetch(
        `${API_ORIGIN}/api/restaurants/public/${restaurantSlug}`
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data?.success ||
        !data?.data
      ) {
        console.error(
          "WAITER RESTAURANT LOAD ERROR:",
          data?.message
        );
        return;
      }

      const restaurant = data.data;

      setRestaurantBrand({
        _id:
          restaurant._id ||
          restaurant.id,
        name: restaurant.name,
        logo: restaurant.logo,
        slug: restaurant.slug,
      });

      sessionStorage.setItem(
        "selectedRestaurant",
        JSON.stringify(restaurant)
      );

      if (restaurant._id || restaurant.id) {
        sessionStorage.setItem(
          "restaurantId",
          restaurant._id ||
            restaurant.id
        );
      }

      if (restaurant.slug) {
        sessionStorage.setItem(
          "restaurantSlug",
          restaurant.slug
        );
      }
    } catch (error) {
      console.error(
        "WAITER RESTAURANT BRAND ERROR:",
        error
      );
    }
  };

  loadRestaurantBrand();
}, [restaurantSlug]);

  const fetchOrders = useCallback(async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError("");
      const token = getToken();
      const response = await fetch("/api/orders/waiter", {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const text = await response.text();
      let result: any = {};
      try { result = text ? JSON.parse(text) : {}; }
      catch { throw new Error("Invalid response received from server."); }
      if (!response.ok) throw new Error(result?.message || "Unable to fetch waiter orders.");
      const data = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.data?.orders)
        ? result.data.orders
        : [];
      setOrders(data);
    } catch (e) {
      console.error("WAITER ORDERS ERROR:", e);
      setError(e instanceof Error ? e.message : "Unable to load waiter orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const id = window.setInterval(() => fetchOrders(true), 15000);
    return () => window.clearInterval(id);
  }, [fetchOrders]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    const active = orders.filter(o => ["pending", "preparing", "ready"].includes(o.status));
    const occupied = new Set(
      active.filter(o => tableDisplayName(o) !== "—")
        .map(o => tableDisplayName(o))
    );
    return {
      active: active.length,
      preparing: orders.filter(o => o.status === "preparing").length,
      ready: orders.filter(o => o.status === "ready").length,
      served: orders.filter(o => o.status === "completed").length,
      tables: occupied.size,
    payments: orders.filter(
  o =>
    o.status === "completed" &&
    o.paymentStatus === "paid"
).length,
    };
  }, [orders]);

  const notifications = useMemo<Notification[]>(() => {
    const list: Notification[] = [];
    orders.forEach(o => {
      const no = orderNumber(o);
      const mins = elapsed(o, now);
      const diet = dietary(o);

      if (o.status === "ready") {
        list.push({
          id: `ready-${o._id}`,
          title: `Order #${no} ready`,
          message: `Ready to serve${tableDisplayName(o) !== "—" ? ` · Table ${tableDisplayName(o)}` : ""}.`,
          tone: "green",
          orderId: o._id,
        });
      }
      if (
        (o.status === "ready" && mins >= 8) ||
        (o.status === "pending" && mins >= 10)
      ) {
        list.push({
          id: `delay-${o._id}`,
          title: `Order #${no} needs attention`,
          message: `Waiting for ${mins} minutes.`,
          tone: "orange",
          orderId: o._id,
        });
      }
      if (diet) {
        list.push({
          id: `diet-${o._id}`,
          title: `Dietary alert · #${no}`,
          message: diet,
          tone: "red",
          orderId: o._id,
        });
      }
      if (o.status === "completed" && (o.paymentStatus || "pending") === "pending") {
        list.push({
          id: `payment-${o._id}`,
          title: `Payment pending · #${no}`,
          message: `Collect ${money(o.totalAmount)}.`,
          tone: "orange",
          orderId: o._id,
        });
      }
    });
    return list.slice(0, 12);
  }, [orders, now]);

  const unread = notifications.filter(n => !readIds.includes(n.id));

  const markRead = (id: string) => {
    setReadIds(current => {
      if (current.includes(id)) return current;
      const next = [...current, id].slice(-100);
      localStorage.setItem("waiterReadNotifications", JSON.stringify(next));
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...orders]
      .filter(o =>
        filter === "payment"
          ? o.status === "completed" && (o.paymentStatus || "pending") === "pending"
          : filter === "all" || o.status === filter
      )
      .filter(o => {
        if (!q) return true;
        const text = [
          orderNumber(o), customerDisplayName(o), tableDisplayName(o),
          ...(o.items || []).map(i => i.name), dietary(o),
          o.specialInstructions || "", o.notes || "",
        ].join(" ").toLowerCase();
        return text.includes(q);
      })
      .sort((a, b) => {
        const rank = (o: WaiterOrder) =>
          o.status === "ready" ? 0 :
          o.status === "pending" ? 1 :
          o.status === "preparing" ? 2 :
          o.status === "completed" ? 3 : 4;
        return rank(a) - rank(b) ||
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }, [orders, filter, search]);

  const updateStatus = async (id: string, status: "completed" | "cancelled") => {
    try {
      setUpdating(id);
      const token = getToken();
      const response = await fetch(`/api/orders/waiter/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      const text = await response.text();
      let result: any = {};
      try { result = text ? JSON.parse(text) : {}; }
      catch { throw new Error("Invalid response received from server."); }
      if (!response.ok) throw new Error(result?.message || "Unable to update order.");
      if (result?.data?._id) {
        setOrders(current => current.map(o => o._id === id ? result.data : o));
        setSelected(result.data);
      } else {
        await fetchOrders(true);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Unable to update order.");
    } finally {
      setUpdating(null);
    }
  };

  const updatePayment = async (id: string, paymentStatus: "paid" | "failed") => {
    try {
      setPaymentUpdating(id);
      const token = getToken();
      const response = await fetch(`/api/orders/waiter/${id}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ paymentStatus }),
      });
      const text = await response.text();
      let result: any = {};
      try { result = text ? JSON.parse(text) : {}; }
      catch { throw new Error("Invalid response received from server."); }
      if (!response.ok) throw new Error(result?.message || "Unable to update payment.");
      if (result?.data?._id) {
        setOrders(current => current.map(o => o._id === id ? result.data : o));
        setSelected(result.data);
      } else {
        await fetchOrders(true);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Unable to update payment.");
    } finally {
      setPaymentUpdating(null);
    }
  };

  const logout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    sessionStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f8] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={32} className="mx-auto text-orange-500 animate-spin" />
          <p className="mt-3 text-sm text-gray-500">Loading waiter dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#17345c]">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="h-[76px] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-orange-50 flex items-center justify-center">
  {restaurantBrand?.logo ? (
    <img
      src={restaurantBrand.logo}
      alt={restaurantBrand.name || "Restaurant"}
      className="w-full h-full object-cover"
    />
  ) : (
    <UtensilsCrossed
      size={22}
      className="text-orange-500"
    />
  )}
</div>

<div>
  <p className="text-lg font-extrabold text-gray-900">
    {restaurantBrand?.name || "RestroSphere"}
  </p>

  <p className="text-xs text-gray-400">
    Waiter Operations
  </p>
</div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button type="button" onClick={() => fetchOrders(true)}
              className="p-2.5 rounded-xl border border-gray-200 hover:border-orange-300 hover:text-orange-500">
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            </button>

            <div className="relative">
              <button type="button" onClick={() => setNotificationsOpen(v => !v)}
                className="relative p-2.5 rounded-xl border border-gray-200 hover:border-orange-300 hover:text-orange-500">
                <Bell size={18} />
                {unread.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {Math.min(unread.length, 9)}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-12 w-[330px] max-w-[calc(100vw-32px)] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex justify-between">
                    <div>
                      <p className="font-bold text-gray-800">Notifications</p>
                      <p className="text-xs text-gray-400 mt-1">{unread.length} unread</p>
                    </div>
                    <button type="button" onClick={() => setNotificationsOpen(false)} className="text-gray-400">
                      <X size={17} />
                    </button>
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <CheckCircle2 size={28} className="mx-auto text-green-500" />
                        <p className="mt-2 text-sm font-semibold text-gray-700">You're all caught up</p>
                      </div>
                    ) : notifications.map(n => (
                      <button key={n.id} type="button"
                        onClick={() => {
                          markRead(n.id);
                          if (n.orderId) {
                            const order = orders.find(o => o._id === n.orderId);
                            if (order) setSelected(order);
                          }
                        }}
                        className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 ${!readIds.includes(n.id) ? "bg-orange-50/40" : ""}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            n.tone === "red" ? "bg-red-50 text-red-500" :
                            n.tone === "green" ? "bg-green-50 text-green-500" :
                            n.tone === "blue" ? "bg-blue-50 text-blue-500" :
                            "bg-orange-50 text-orange-500"
                          }`}>
                            {n.tone === "red" ? <AlertTriangle size={16} /> : <Bell size={16} />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800">{n.title}</p>
                            <p className="mt-1 text-xs text-gray-500">{n.message}</p>
                          </div>
                          {!readIds.includes(n.id) && <span className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                <User size={19} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Waiter</p>
                <p className="text-xs text-gray-400">Service Team</p>
              </div>
            </div>

            <button type="button" onClick={logout}
              className="p-2.5 rounded-xl border border-gray-200 hover:border-red-200 hover:text-red-500" title="Logout">
              <LogOut size={18} />
            </button>

            <button type="button" onClick={() => setMobileMenu(v => !v)}
              className="lg:hidden p-2.5 rounded-xl border border-gray-200">
              <Menu size={18} />
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="lg:hidden px-4 pb-4 border-t border-gray-100 pt-3 text-sm text-gray-500">
            Waiter service dashboard
          </div>
        )}
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-7 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">Waiter Staff</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">Waiter Dashboard</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-500">
              Manage service, ready orders, tables and customer requests.
            </p>
          </div>
          <div className="text-sm text-gray-400">Auto-refreshes every 15 seconds</div>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
            <AlertTriangle className="text-red-500 shrink-0" size={19} />
            <div>
              <p className="font-bold text-red-700">Unable to load waiter orders</p>
              <p className="mt-1 text-sm text-red-600">{error}</p>
              <button type="button" onClick={() => fetchOrders(true)}
                className="mt-3 text-sm font-bold text-red-700 underline">Try again</button>
            </div>
          </div>
        )}

        <section className="mt-7 grid grid-cols-2 xl:grid-cols-5 gap-4">
          {[
            ["Active Orders", stats.active, ShoppingBag, "bg-orange-50 text-orange-500"],
            ["Preparing", stats.preparing, ChefHat, "bg-blue-50 text-blue-500"],
            ["Ready to Serve", stats.ready, CheckCircle2, "bg-green-50 text-green-500"],
            ["Tables Active", stats.tables, Table2, "bg-purple-50 text-purple-500"],
["Payments Received", stats.payments, CreditCard, "bg-green-50 text-green-500"],
          ].map(([label, value, Icon, cls]) => {
            const Component = Icon as React.ElementType;
            return (
              <div key={String(label)} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${String(cls)}`}>
                  <Component size={19} />
                </div>
                <p className="mt-5 text-3xl font-extrabold text-gray-800">{String(value)}</p>
                <p className="mt-1 text-sm font-medium text-gray-500">{String(label)}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center"><CheckCircle2 size={19} /></div>
              <div><p className="text-sm font-bold text-gray-800">Ready for Service</p><p className="text-xs text-gray-400 mt-1">{stats.ready} order{stats.ready === 1 ? "" : "s"} waiting.</p></div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center"><Clock3 size={19} /></div>
              <div><p className="text-sm font-bold text-gray-800">Service Focus</p><p className="text-xs text-gray-400 mt-1">Serve oldest ready orders first.</p></div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"><CreditCard size={19} /></div>
              <div><p className="text-sm font-bold text-gray-800">Payment Follow-up</p><p className="text-xs text-gray-400 mt-1">{stats.payments} completed order{stats.payments === 1 ? "" : "s"} need payment.</p></div>
            </div>
          </div>
        </section>

        <section className="mt-7 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-800">Live Service Queue</h2>
                <p className="mt-1 text-sm text-gray-400">Serve ready orders and monitor service delays.</p>
              </div>
              <div className="relative w-full xl:w-[330px]">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Order / customer / table / item"
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm" />
              </div>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {([
                ["all", "All"], ["pending", "New"], ["preparing", "Preparing"],
                ["ready", "Ready to Serve"], ["payment", "Payment Pending"],
                ["completed", "Served"], ["cancelled", "Cancelled"],
              ] as [QueueFilter, string][]).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setFilter(value)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${
                    filter === value ? "bg-orange-500 text-white" : "bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}>{label}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="min-h-[380px] flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 text-gray-300 flex items-center justify-center"><ShoppingBag size={26} /></div>
                <h3 className="mt-5 text-lg font-extrabold text-gray-800">No orders found</h3>
                <p className="mt-2 text-sm text-gray-400">New restaurant orders will appear here automatically.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map(order => {
                const mins = elapsed(order, now);
                const attention =
                  (order.status === "ready" && mins >= 8) ||
                  (order.status === "pending" && mins >= 10);
                const urgent =
                  (order.status === "ready" && mins >= 15) ||
                  (order.status === "pending" && mins >= 20);
                const diet = dietary(order);
                const notes = order.specialInstructions || order.notes || "";

                return (
                  <article key={order._id}
                    className={`p-5 sm:p-6 ${urgent ? "bg-red-50/40" : order.status === "ready" ? "bg-green-50/30" : ""}`}>
                    <div className="flex flex-col 2xl:flex-row 2xl:items-start gap-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-extrabold text-gray-800">Order #{orderNumber(order)}</span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusClass(order.status)}`}>{statusLabel(order.status)}</span>
                          {attention && order.status !== "completed" && order.status !== "cancelled" && (
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${urgent ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                              {urgent ? "URGENT" : "ATTENTION"}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5"><User size={14} />{customerDisplayName(order)}</span>
                          <span className="flex items-center gap-1.5"><Table2 size={14} />{tableDisplayName(order) !== "—" ? `Table ${tableDisplayName(order)}` : "Table not assigned"}</span>
                          <span className="flex items-center gap-1.5"><Clock3 size={14} />{mins} min</span>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {(order.items || []).map((item, i) => (
                            <div key={`${order._id}-${item.name}-${i}`} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
                              <span className="text-sm text-gray-700 truncate">{item.name}</span>
                              <span className="text-xs font-bold text-gray-500">× {item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {diet && (
                          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100">
                            <div className="flex items-start gap-2"><AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                              <div><p className="text-xs font-extrabold text-red-700">Allergy / Dietary Alert</p><p className="mt-1 text-xs text-red-600">{diet}</p></div>
                            </div>
                          </div>
                        )}

                        {notes && (
                          <div className="mt-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                            <div className="flex items-start gap-2"><Info size={16} className="text-orange-500 mt-0.5 shrink-0" />
                              <div><p className="text-xs font-extrabold text-orange-700">Special Instructions</p><p className="mt-1 text-xs text-orange-700">{notes}</p></div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="2xl:w-[230px] shrink-0">
                        <div className="rounded-2xl bg-gray-50 p-4">
                          <p className="text-xs text-gray-400">Order Total</p>
                          <p className="mt-1 text-xl font-extrabold text-gray-800">{money(order.totalAmount)}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-400">Payment</span>
                            <span className={`text-xs font-bold ${
                              order.paymentStatus === "paid" ? "text-green-600" :
                              order.paymentStatus === "failed" ? "text-red-500" : "text-orange-500"
                            }`}>{(order.paymentStatus || "pending").toUpperCase()}</span>
                          </div>
                          <p className="mt-2 text-[11px] text-gray-400">{dateTime(order.createdAt)}</p>
                        </div>

                        <div className="mt-3 grid gap-2">
                          <button type="button" onClick={() => setSelected(order)}
                            className="w-full h-10 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:border-orange-300 hover:text-orange-600">
                            View Details
                          </button>

                          {order.status === "ready" && (
                            <button type="button" disabled={updating === order._id}
                              onClick={() => updateStatus(order._id, "completed")}
                              className="w-full h-10 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 disabled:opacity-50">
                              {updating === order._id ? "Serving..." : "Serve Order"}
                            </button>
                          )}

                          {order.status === "completed" && (order.paymentStatus || "pending") === "pending" && (
                            <button type="button" disabled={paymentUpdating === order._id}
                              onClick={() => updatePayment(order._id, "paid")}
                              className="w-full h-10 rounded-xl bg-green-500 text-white text-xs font-bold hover:bg-green-600 disabled:opacity-50">
                              {paymentUpdating === order._id ? "Updating..." : "Mark Payment Received"}
                            </button>
                          )}

                          {(order.status === "pending" || order.status === "preparing") && (
                            <div className="w-full h-10 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center">
                              <ChefHat size={15} className="mr-1.5" /> Kitchen is {order.status === "pending" ? "processing" : "preparing"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-7 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-gray-800">Live Customer Queue</h2>
              <p className="mt-1 text-sm text-gray-400">
                Every active customer with table number and current kitchen status.
              </p>
            </div>
            <span className="text-xs font-semibold text-gray-400">
              {activeQueue(orders).length} active customer{activeQueue(orders).length === 1 ? "" : "s"}
            </span>
          </div>

          {activeQueue(orders).length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 text-gray-300 flex items-center justify-center">
                <Table2 size={26} />
              </div>
              <h3 className="mt-4 text-base font-extrabold text-gray-800">No customers in the live queue</h3>
              <p className="mt-1 text-sm text-gray-400">New orders will appear here automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-bold text-gray-400">Customer</th>
                    <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-bold text-gray-400">Table</th>
                    <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-bold text-gray-400">Order</th>
                    <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-bold text-gray-400">Status</th>
                    <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-bold text-gray-400">Waiting</th>
                    <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-bold text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeQueue(orders).map(order => {
                    const mins = elapsed(order, now);
                    const table = tableDisplayName(order);
                    return (
                      <tr key={`live-${order._id}`} className="hover:bg-gray-50/70">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                              <User size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{customerDisplayName(order)}</p>
                              <p className="text-[11px] text-gray-400">{(order.items || []).length} item{(order.items || []).length === 1 ? "" : "s"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 text-xs font-bold">
                            <Table2 size={14} /> {table === "—" ? "Not assigned" : `Table ${table}`}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-gray-700">#{orderNumber(order)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${statusClass(order.status)}`}>
                            {order.status === "ready" ? <CheckCircle2 size={13} /> :
                             order.status === "preparing" ? <ChefHat size={13} /> :
                             <Clock3 size={13} />}
                            {statusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-gray-600">{mins} min</td>
                        <td className="px-5 py-4">
                          <button type="button" onClick={() => setSelected(order)}
                            className="px-3.5 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:border-orange-300 hover:text-orange-600">
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-7 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-gray-800">Service Summary</h2>
              <p className="mt-1 text-sm text-gray-400">Current waiter-side operational snapshot.</p>
            </div>
            <span className="text-xs text-gray-400">{new Date().toLocaleDateString("en-IN")}</span>
          </div>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-orange-50 p-4"><p className="text-[10px] uppercase font-bold text-orange-500">Active</p><p className="mt-1 text-2xl font-extrabold">{stats.active}</p></div>
            <div className="rounded-xl bg-green-50 p-4"><p className="text-[10px] uppercase font-bold text-green-500">Ready</p><p className="mt-1 text-2xl font-extrabold">{stats.ready}</p></div>
            <div className="rounded-xl bg-blue-50 p-4"><p className="text-[10px] uppercase font-bold text-blue-500">Served</p><p className="mt-1 text-2xl font-extrabold">{stats.served}</p></div>
            <div className="rounded-xl bg-red-50 p-4"><p className="text-[10px] uppercase font-bold text-red-500">Payments</p><p className="mt-1 text-2xl font-extrabold">{stats.payments}</p></div>
          </div>
        </section>
        <section className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ["New", stats.active - stats.preparing - stats.ready, "bg-orange-50 text-orange-600"],
            ["Preparing", stats.preparing, "bg-blue-50 text-blue-600"],
            ["Ready", stats.ready, "bg-green-50 text-green-600"],
            ["Served", stats.served, "bg-gray-100 text-gray-600"],
          ].map(([label, value, cls]) => (
            <div key={String(label)} className={`rounded-xl px-4 py-3 ${String(cls)}`}>
              <p className="text-[10px] uppercase font-bold">{String(label)}</p>
              <p className="mt-1 text-xl font-extrabold">{String(value)}</p>
            </div>
          ))}
        </section>
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between">
              <div><p className="text-xs uppercase font-bold tracking-wider text-orange-500">Order Details</p><h2 className="mt-1 text-2xl font-extrabold text-gray-800">#{orderNumber(selected)}</h2></div>
              <button type="button" onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><X size={19} /></button>
            </div>
            <div className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-gray-50 p-3"><p className="text-[10px] uppercase font-bold text-gray-400">Customer</p><p className="mt-1 text-sm font-bold">{customerDisplayName(selected)}</p></div>
                <div className="rounded-xl bg-gray-50 p-3"><p className="text-[10px] uppercase font-bold text-gray-400">Table</p><p className="mt-1 text-sm font-bold">{tableDisplayName(selected) !== "—" ? `Table ${tableDisplayName(selected)}` : "Not assigned"}</p></div>
                <div className="rounded-xl bg-gray-50 p-3"><p className="text-[10px] uppercase font-bold text-gray-400">Status</p><p className="mt-1 text-sm font-bold">{statusLabel(selected.status)}</p></div>
                <div className="rounded-xl bg-gray-50 p-3"><p className="text-[10px] uppercase font-bold text-gray-400">Payment</p><p className="mt-1 text-sm font-bold">{(selected.paymentStatus || "pending").toUpperCase()}</p></div>
              </div>

              <div>
                <h3 className="font-bold text-gray-800">Items</h3>
                <div className="mt-3 space-y-2">
                  {(selected.items || []).map((item, i) => (
                    <div key={`${item.name}-${i}`} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                      <div><p className="text-sm font-semibold">{item.name}</p><p className="text-xs text-gray-400">{money(item.price)} each</p></div>
                      <p className="text-sm font-bold">× {item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {dietary(selected) && <div className="rounded-xl bg-red-50 border border-red-100 p-4"><p className="text-xs font-extrabold text-red-700">Allergy / Dietary Alert</p><p className="mt-1 text-sm text-red-600">{dietary(selected)}</p></div>}
              {(selected.specialInstructions || selected.notes) && <div className="rounded-xl bg-orange-50 border border-orange-100 p-4"><p className="text-xs font-extrabold text-orange-700">Special Instructions</p><p className="mt-1 text-sm text-orange-700">{selected.specialInstructions || selected.notes}</p></div>}

              <div className="rounded-2xl bg-gray-900 text-white p-5 flex items-center justify-between"><span className="text-sm text-gray-300">Order Total</span><span className="text-2xl font-extrabold">{money(selected.totalAmount)}</span></div>

              <div className="flex flex-col sm:flex-row gap-3">
                {selected.status === "ready" && <button type="button" disabled={updating === selected._id} onClick={() => updateStatus(selected._id, "completed")} className="flex-1 h-11 rounded-xl bg-orange-500 text-white text-sm font-bold disabled:opacity-50">{updating === selected._id ? "Serving..." : "Serve Order"}</button>}
                {selected.status === "completed" && (selected.paymentStatus || "pending") === "pending" && <button type="button" disabled={paymentUpdating === selected._id} onClick={() => updatePayment(selected._id, "paid")} className="flex-1 h-11 rounded-xl bg-green-500 text-white text-sm font-bold disabled:opacity-50">{paymentUpdating === selected._id ? "Updating..." : "Mark Payment Received"}</button>}
                <button type="button" onClick={() => setSelected(null)} className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaiterDashboard;