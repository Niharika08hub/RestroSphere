import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChefHat,
  Clock3,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  ShoppingBag,
  StickyNote,
  UtensilsCrossed,
  XCircle,
  Zap,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

type KitchenOrder = {
  _id: string;
  orderNumber?: string;
  customerName?: string;
  tableNumber?: string | number;
  items: {
    name: string;
    price?: number;
    quantity: number;
  }[];
  totalAmount?: number;
  status: OrderStatus;
  paymentStatus?: "pending" | "paid" | "failed";
  specialInstructions?: string;
  instructions?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

type Priority = "normal" | "high" | "urgent";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
};

type KitchenApiResponse = {
  data?: unknown;
  orders?: unknown;
  message?: string;
};

const isKitchenOrderArray = (
  value: unknown
): value is KitchenOrder[] => {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as KitchenOrder)._id === "string"
    )
  );
};

const extractKitchenOrders = (
  result: KitchenApiResponse
): KitchenOrder[] => {
  if (isKitchenOrderArray(result.data)) {
    return result.data;
  }

  if (isKitchenOrderArray(result.orders)) {
    return result.orders;
  }

  if (
    result.data &&
    typeof result.data === "object" &&
    "orders" in result.data
  ) {
    const nested = (result.data as { orders?: unknown }).orders;

    if (isKitchenOrderArray(nested)) {
      return nested;
    }
  }

  return [];
};

const extractUpdatedOrder = (
  result: KitchenApiResponse
): KitchenOrder | null => {
  if (
    result.data &&
    typeof result.data === "object" &&
    "_id" in result.data
  ) {
    return result.data as KitchenOrder;
  }

  if (
    result.data &&
    typeof result.data === "object" &&
    "order" in result.data
  ) {
    const order = (result.data as { order?: unknown }).order;

    if (
      order &&
      typeof order === "object" &&
      "_id" in order
    ) {
      return order as KitchenOrder;
    }
  }

  if (
    result.orders &&
    typeof result.orders === "object" &&
    "_id" in result.orders
  ) {
    return result.orders as KitchenOrder;
  }

  return null;
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusClasses: Record<OrderStatus, string> = {
  pending: "bg-orange-50 text-orange-600 border-orange-100",
  preparing: "bg-blue-50 text-blue-600 border-blue-100",
  ready: "bg-green-50 text-green-600 border-green-100",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
  cancelled: "bg-red-50 text-red-600 border-red-100",
};
function KitchenDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // -----------------------------------------
  // RESTAURANT CONTEXT
  // /r/cafe-da-flora/kitchen/dashboard
  // -----------------------------------------
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

  const API_ORIGIN = "http://localhost:5000";

  const imageSrc = (value?: string) => {
    if (!value) return "";

    if (/^(https?:|data:|blob:)/i.test(value)) {
      return value;
    }

    if (value.startsWith("/")) {
      return `${API_ORIGIN}${value}`;
    }

    return value;
  };

  const restaurantLogo = imageSrc(restaurantBrand?.logo);

  const restaurantName =
    restaurantBrand?.name || "RestroSphere";

  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  const [mobileMenu, setMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  const [now, setNow] = useState(Date.now());
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [kitchenNotes, setKitchenNotes] = useState<Record<string, string>>(
    {}
  );

  const getToken = () =>
    sessionStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";
useEffect(() => {
  const loadRestaurantBrand = async () => {
    try {
      const savedRestaurant =
        sessionStorage.getItem(
          "selectedRestaurant"
        );

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

          return;
        } catch {
          sessionStorage.removeItem(
            "selectedRestaurant"
          );
        }
      }

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
          "KITCHEN RESTAURANT LOAD ERROR:",
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

      sessionStorage.setItem(
        "restaurantId",
        restaurant._id ||
          restaurant.id
      );

      sessionStorage.setItem(
        "restaurantSlug",
        restaurant.slug
      );
    } catch (error) {
      console.error(
        "KITCHEN RESTAURANT BRAND ERROR:",
        error
      );
    }
  };

  loadRestaurantBrand();
}, [restaurantSlug]);
  useEffect(() => {
    const saved = localStorage.getItem("restrosphere_kitchen_notes");

    if (saved) {
      try {
        setKitchenNotes(JSON.parse(saved));
      } catch {
        setKitchenNotes({});
      }
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(
      "restrosphere_kitchen_read_notifications"
    );

    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved);

        if (
          Array.isArray(parsed) &&
          parsed.every((item) => typeof item === "string")
        ) {
          setReadNotificationIds(parsed);
        }
      } catch {
        setReadNotificationIds([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "restrosphere_kitchen_read_notifications",
      JSON.stringify(readNotificationIds)
    );
  }, [readNotificationIds]);

  useEffect(() => {
    localStorage.setItem(
      "restrosphere_kitchen_notes",
      JSON.stringify(kitchenNotes)
    );
  }, [kitchenNotes]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const fetchOrders = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = getToken();
const restaurantId =
  sessionStorage.getItem("restaurantId") || "";

const kitchenOrdersUrl = restaurantId
  ? `/api/orders/kitchen?restaurantId=${encodeURIComponent(
      restaurantId
    )}`
  : "/api/orders/kitchen";

const response = await fetch(kitchenOrdersUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result: KitchenApiResponse = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.message || "Unable to fetch kitchen orders."
        );
      }

      setOrders(extractKitchenOrders(result));
    } catch (error) {
      console.error("KITCHEN ORDERS ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to load kitchen orders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [restaurantBrand?._id]);

  useEffect(() => {
    fetchOrders();

    const interval = window.setInterval(() => {
      fetchOrders(true);
    }, 15000);

    return () => window.clearInterval(interval);
  }, [fetchOrders]);

const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
) => {
  try {
    setUpdatingOrderId(orderId);

    const token = getToken();

    const response = await fetch(
      `/api/orders/kitchen/${orderId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
        body: JSON.stringify({ status }),
      }
    );

    const result: KitchenApiResponse = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result?.message || "Unable to update order."
      );
    }

    const updatedOrder = extractUpdatedOrder(result);

    if (!updatedOrder) {
      await fetchOrders(true);
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        order._id === orderId
          ? updatedOrder
          : order
      )
    );
  } catch (error) {
    console.error(
      "KITCHEN UPDATE ERROR:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Unable to update order."
    );
  } finally {
    setUpdatingOrderId(null);
  }
};

      

      

  const elapsedMinutes = (order: KitchenOrder) => {
    const start =
      order.status === "preparing"
        ? order.updatedAt || order.createdAt
        : order.createdAt;

    return Math.max(
      0,
      Math.floor((now - new Date(start).getTime()) / 60000)
    );
  };

  const getPriority = (order: KitchenOrder): Priority => {
    const minutes = elapsedMinutes(order);

    if (
      (order.status === "pending" && minutes >= 25) ||
      (order.status === "preparing" && minutes >= 40)
    ) {
      return "urgent";
    }

    if (
      (order.status === "pending" && minutes >= 15) ||
      (order.status === "preparing" && minutes >= 25)
    ) {
      return "high";
    }

    return "normal";
  };

  const priorityClass: Record<Priority, string> = {
    normal: "bg-gray-50 text-gray-500 border-gray-200",
    high: "bg-orange-50 text-orange-600 border-orange-200",
    urgent: "bg-red-50 text-red-600 border-red-200",
  };

  const stats = useMemo(
    () => ({
      pending: orders.filter((o) => o.status === "pending").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      ready: orders.filter((o) => o.status === "ready").length,
      completed: orders.filter((o) => o.status === "completed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    }),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const value = search.trim().toLowerCase();

    return [...orders]
      .filter((order) => filter === "all" || order.status === filter)
      .filter((order) => {
        if (!value) return true;

        const orderNumber = (
          order.orderNumber || order._id.slice(-6)
        ).toLowerCase();

        const customer = (order.customerName || "Guest").toLowerCase();

        const items = (order.items || [])
          .map((item) => item.name)
          .join(" ")
          .toLowerCase();

        const table = String(order.tableNumber || "").toLowerCase();

        return `${orderNumber} ${customer} ${items} ${table}`.includes(
          value
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }, [orders, filter, search]);

  const notifications = useMemo<NotificationItem[]>(() => {
    const result: NotificationItem[] = [];

    orders.forEach((order) => {
      const number = (
        order.orderNumber || order._id.slice(-6)
      ).toString().toUpperCase();

      const customer = order.customerName || "Guest";
      const priority = getPriority(order);

      if (order.status === "pending") {
        const id = `pending-${order._id}`;

        result.push({
          id,
          title: "New order received",
          message: `Order #${number} from ${customer} is waiting in the kitchen.`,
          time: order.createdAt,
          unread: !readNotificationIds.includes(id),
        });
      }

      if (
        order.status === "pending" &&
        (priority === "high" || priority === "urgent")
      ) {
        const id = `delay-${order._id}`;

        result.push({
          id,
          title:
            priority === "urgent"
              ? "Urgent kitchen alert"
              : "Order delay alert",
          message: `Order #${number} has been active for ${elapsedMinutes(
            order
          )} minutes.`,
          time: order.createdAt,
          unread: !readNotificationIds.includes(id),
        });
      }

      if (order.status === "preparing") {
        const id = `preparing-${order._id}`;

        result.push({
          id,
          title: "Order preparing",
          message: `Order #${number} is currently being prepared.`,
          time: order.updatedAt || order.createdAt,
          unread: !readNotificationIds.includes(id),
        });
      }

      if (order.status === "ready") {
        const id = `ready-${order._id}`;

        result.push({
          id,
          title: "Order ready",
          message: `Order #${number} is ready for serving.`,
          time: order.updatedAt || order.createdAt,
          unread: !readNotificationIds.includes(id),
        });
      }

      if (order.status === "cancelled") {
        const id = `cancelled-${order._id}`;

        result.push({
          id,
          title: "Order cancelled",
          message: `Order #${number} from ${customer} was cancelled.`,
          time: order.updatedAt || order.createdAt,
          unread: !readNotificationIds.includes(id),
        });
      }

      if (order.status === "completed") {
        const id = `completed-${order._id}`;

        result.push({
          id,
          title: "Order completed",
          message: `Order #${number} has been completed.`,
          time: order.updatedAt || order.createdAt,
          unread: !readNotificationIds.includes(id),
        });
      }
    });

    return result.sort(
      (a, b) =>
        new Date(b.time).getTime() - new Date(a.time).getTime()
    );
  }, [orders, readNotificationIds, now]);

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const markRead = (id: string) => {
    setReadNotificationIds((current) =>
      current.includes(id) ? current : [...current, id]
    );
  };

  const markAllRead = () => {
    setReadNotificationIds(notifications.map((item) => item.id));
  };

  const timeAgo = (date: string) => {
    const minutes = Math.max(
      Math.floor((Date.now() - new Date(date).getTime()) / 60000),
      0
    );

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours}h ago`;

    return `${Math.floor(hours / 24)}d ago`;
  };

  const formatDateTime = (date?: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimer = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return hours > 0
      ? `${hours}h ${String(mins).padStart(2, "0")}m`
      : `${mins}m`;
  };

  const saveNote = (orderId: string, value: string) => {
    setKitchenNotes((current) => ({
      ...current,
      [orderId]: value,
    }));
  };

  // ============================================================
  // KITCHEN OPERATIONS INSIGHTS
  // ============================================================

  const activeOrderCount =
    stats.pending + stats.preparing + stats.ready;

  const delayedOrders = useMemo(
    () =>
      orders
        .filter(
          (order) =>
            order.status === "pending" ||
            order.status === "preparing"
        )
        .filter((order) => {
          const minutes = elapsedMinutes(order);

          return (
            (order.status === "pending" && minutes >= 15) ||
            (order.status === "preparing" && minutes >= 25)
          );
        })
        .sort(
          (a, b) => elapsedMinutes(b) - elapsedMinutes(a)
        ),
    [orders, now]
  );

  const averagePreparationTime = useMemo(() => {
    const completedWithTimes = orders
      .filter(
        (order) =>
          order.status === "completed" &&
          order.updatedAt &&
          order.createdAt
      )
      .map((order) => {
        const created = new Date(order.createdAt).getTime();
        const updated = new Date(order.updatedAt as string).getTime();

        return Math.max(0, (updated - created) / 60000);
      })
      .filter((minutes) => Number.isFinite(minutes));

    if (!completedWithTimes.length) return 0;

    return Math.round(
      completedWithTimes.reduce((sum, value) => sum + value, 0) /
        completedWithTimes.length
    );
  }, [orders]);

  const completionRate = useMemo(() => {
    const finished =
      stats.completed + stats.cancelled;

    if (!finished) return 0;

    return Math.round(
      (stats.completed / finished) * 100
    );
  }, [stats.completed, stats.cancelled]);

  const itemWorkload = useMemo(() => {
    const map = new Map<string, number>();

    orders
      .filter(
        (order) =>
          order.status !== "completed" &&
          order.status !== "cancelled"
      )
      .forEach((order) => {
        (order.items || []).forEach((item) => {
          map.set(
            item.name,
            (map.get(item.name) || 0) +
              Number(item.quantity || 0)
          );
        });
      });

    return [...map.entries()]
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6);
  }, [orders]);

  const recentCompletedOrders = useMemo(
    () =>
      [...orders]
        .filter((order) => order.status === "completed")
        .sort(
          (a, b) =>
            new Date(
              b.updatedAt || b.createdAt
            ).getTime() -
            new Date(
              a.updatedAt || a.createdAt
            ).getTime()
        )
        .slice(0, 5),
    [orders]
  );

  const busiestHour = useMemo(() => {
    const hours = new Array(24).fill(0) as number[];

    orders.forEach((order) => {
      const date = new Date(order.createdAt);

      if (!Number.isNaN(date.getTime())) {
        hours[date.getHours()] += 1;
      }
    });

    const max = Math.max(...hours);

    if (!max) return "—";

    const hour = hours.indexOf(max);
    const start = new Date();
    start.setHours(hour, 0, 0, 0);

    return start.toLocaleTimeString("en-IN", {
      hour: "numeric",
    });
  }, [orders]);

  const operationalAlerts = useMemo(() => {
    const alerts: {
      id: string;
      title: string;
      message: string;
      tone: "red" | "orange" | "blue";
    }[] = [];

    delayedOrders.slice(0, 4).forEach((order) => {
      const number =
        order.orderNumber || order._id.slice(-6);

      const minutes = elapsedMinutes(order);

      alerts.push({
        id: `delay-${order._id}`,
        title:
          order.status === "pending"
            ? "Pending order needs attention"
            : "Preparation taking longer",
        message: `Order #${number} has been active for ${minutes} minutes.`,
        tone: minutes >= 40 ? "red" : "orange",
      });
    });

    if (stats.ready > 0) {
      alerts.push({
        id: "ready-queue",
        title: "Orders waiting for serving",
        message: `${stats.ready} order${
          stats.ready === 1 ? "" : "s"
        } ready to be picked up.`,
        tone: "blue",
      });
    }

    return alerts;
  }, [delayedOrders, stats.ready, now]);

  /*
   * Chart data:
   * The kitchen API currently returns the orders available to the
   * logged-in kitchen user. We compare the current period with the
   * immediately previous period using those real orders.
   */
  const chartData = useMemo(() => {
    const today = new Date();
    const startToday = new Date(today);
    startToday.setHours(0, 0, 0, 0);

    const endToday = new Date(today);
    endToday.setHours(23, 59, 59, 999);

    const yesterdayStart = new Date(startToday);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const yesterdayEnd = new Date(endToday);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    const startWeek = new Date(startToday);
    const day = startWeek.getDay();
    const mondayOffset = day === 0 ? 6 : day - 1;
    startWeek.setDate(startWeek.getDate() - mondayOffset);

    const startLastWeek = new Date(startWeek);
    startLastWeek.setDate(startLastWeek.getDate() - 7);

    const endLastWeek = new Date(startWeek);
    endLastWeek.setDate(endLastWeek.getDate() - 1);
    endLastWeek.setHours(23, 59, 59, 999);

    const startMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const startLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );

    const endLastMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    );
    endLastMonth.setHours(23, 59, 59, 999);

    const count = (from: Date, to: Date) =>
      orders.filter((order) => {
        const created = new Date(order.createdAt).getTime();

        return (
          created >= from.getTime() &&
          created <= to.getTime() &&
          order.status !== "cancelled"
        );
      }).length;

    return [
      {
        label: "Day",
        current: count(startToday, endToday),
        previous: count(yesterdayStart, yesterdayEnd),
      },
      {
        label: "Week",
        current: count(startWeek, endToday),
        previous: count(startLastWeek, endLastWeek),
      },
      {
        label: "Month",
        current: count(startMonth, endToday),
        previous: count(startLastMonth, endLastMonth),
      },
    ];
  }, [orders]);

  const maxChartValue = Math.max(
    1,
    ...chartData.flatMap((item) => [item.current, item.previous])
  );

 const logout = () => {
  const confirmed = window.confirm(
    "Are you sure you want to logout?"
  );

  if (!confirmed) return;

sessionStorage.removeItem("token");
localStorage.removeItem("accessToken");
sessionStorage.removeItem("user");

sessionStorage.removeItem("restaurantId");
sessionStorage.removeItem("selectedRestaurant");
sessionStorage.removeItem("restaurantSlug");

navigate("/login");
};

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f8] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={32}
            className="mx-auto text-orange-500 animate-spin"
          />
          <p className="mt-3 text-sm text-gray-500">
            Loading kitchen dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#172033]">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenu((value) => !value)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu size={21} />
            </button>
<div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center overflow-hidden shrink-0">
  {restaurantLogo ? (
    <img
      src={restaurantLogo}
      alt={restaurantName}
      className="w-full h-full object-contain"
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  ) : (
    <ChefHat
      size={21}
      className="text-orange-500"
    />
  )}
</div>

<div className="min-w-0">
  <p className="font-extrabold text-gray-800 truncate max-w-[220px]">
    {restaurantName}
  </p>

  <p className="text-[11px] text-gray-400">
    Kitchen Operations
  </p>
</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchOrders(true)}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:text-orange-500"
              title="Refresh"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowNotifications((value) => !value)
                }
                className="relative p-2.5 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:text-orange-500"
                title="Notifications"
              >
                <Bell size={19} />

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white border-2 border-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-[min(390px,calc(100vw-24px))] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800">
                        Kitchen Notifications
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {unreadCount} unread
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={markAllRead}
                      disabled={unreadCount === 0}
                      className="text-xs font-semibold text-orange-500 disabled:text-gray-300"
                    >
                      Mark all
                    </button>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center">
                        <CheckCircle2
                          size={30}
                          className="mx-auto text-green-500"
                        />
                        <p className="mt-3 text-sm font-semibold text-gray-600">
                          All caught up
                        </p>
                      </div>
                    ) : (
                      notifications.slice(0, 15).map(
                        (notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() =>
                              markRead(notification.id)
                            }
                            className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 ${
                              notification.unread
                                ? "bg-orange-50/40"
                                : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                {notification.title
                                  .toLowerCase()
                                  .includes("alert") ? (
                                  <AlertTriangle size={17} />
                                ) : (
                                  <Bell size={17} />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-gray-800">
                                    {notification.title}
                                  </p>

                                  {notification.unread && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                  )}
                                </div>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                  {notification.message}
                                </p>

                                <p className="mt-1 text-[10px] text-gray-400">
                                  {timeAgo(notification.time)}
                                </p>
                              </div>
                            </div>
                          </button>
                        )
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-2.5 rounded-xl border border-gray-200 hover:border-red-200 hover:text-red-500"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {mobileMenu && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="px-4 py-3 rounded-xl bg-orange-50 text-orange-600 font-semibold">
            Kitchen Dashboard
          </div>
        </div>
      )}

      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto">
        {/* PAGE HEADING */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-orange-500 font-bold">
              Kitchen Staff
            </p>

            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold">
              Kitchen Dashboard
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage incoming orders, preparation and ready-to-serve orders.
            </p>
          </div>

          <p className="text-sm text-gray-400">
            Auto-refreshes every 15 seconds
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            {
              label: "Pending Orders",
              value: stats.pending,
              icon: Clock3,
              style: "bg-orange-50 text-orange-500",
            },
            {
              label: "Preparing",
              value: stats.preparing,
              icon: ChefHat,
              style: "bg-blue-50 text-blue-500",
            },
            {
              label: "Ready",
              value: stats.ready,
              icon: CheckCircle2,
              style: "bg-green-50 text-green-500",
            },
            {
              label: "Completed",
              value: stats.completed,
              icon: UtensilsCrossed,
              style: "bg-gray-100 text-gray-600",
            },
            {
              label: "Cancelled",
              value: stats.cancelled,
              icon: XCircle,
              style: "bg-red-50 text-red-500",
            },
          ].map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="bg-white border border-gray-200 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.style}`}
                  >
                    <Icon size={21} />
                  </div>

                  <span className="text-[10px] font-bold uppercase text-gray-400">
                    LIVE
                  </span>
                </div>

                <p className="mt-5 text-3xl font-extrabold text-gray-800">
                  {card.value}
                </p>

                <p className="mt-1 text-sm font-medium text-gray-500">
                  {card.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* PERFORMANCE CHART - CSS ONLY, NO RECHARTS */}
        <section className="mt-6 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Order Performance
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Current period compared with the previous period.
            </p>
          </div>

          <div className="mt-6 space-y-6">
            {chartData.map((row) => {
              const currentWidth =
                (row.current / maxChartValue) * 100;

              const previousWidth =
                (row.previous / maxChartValue) * 100;

              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700">
                      {row.label}
                    </span>

                    <span className="text-xs text-gray-400">
                      Current {row.current} · Previous {row.previous}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="w-16 text-[10px] font-bold text-orange-500">
                        CURRENT
                      </span>

                      <div className="h-3 flex-1 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-orange-500 transition-all duration-500"
                          style={{ width: `${currentWidth}%` }}
                        />
                      </div>

                      <span className="w-7 text-right text-xs font-bold text-gray-700">
                        {row.current}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-16 text-[10px] font-bold text-gray-400">
                        PREVIOUS
                      </span>

                      <div className="h-3 flex-1 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gray-300 transition-all duration-500"
                          style={{ width: `${previousWidth}%` }}
                        />
                      </div>

                      <span className="w-7 text-right text-xs font-bold text-gray-500">
                        {row.previous}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* KITCHEN PULSE */}
        <section className="mt-6">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Kitchen Pulse
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Live workload and service health.
              </p>
            </div>
            <span className="hidden sm:block text-xs text-gray-400">
              Updated automatically
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Active Queue",
                value: activeOrderCount,
                sub: "Pending + preparing + ready",
                icon: ShoppingBag,
                className: "bg-orange-50 text-orange-500",
              },
              {
                label: "Needs Attention",
                value: delayedOrders.length,
                sub: "Delayed orders",
                icon: AlertTriangle,
                className: "bg-red-50 text-red-500",
              },
              {
                label: "Avg Prep Time",
                value:
                  averagePreparationTime > 0
                    ? `${averagePreparationTime}m`
                    : "—",
                sub: "Completed orders",
                icon: Clock3,
                className: "bg-blue-50 text-blue-500",
              },
              {
                label: "Completion Rate",
                value: `${completionRate}%`,
                sub: `${stats.completed} completed`,
                icon: CheckCircle2,
                className: "bg-green-50 text-green-500",
              },
            ].map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.className}`}
                    >
                      <Icon size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-400 truncate">
                        {card.label}
                      </p>
                      <p className="mt-0.5 text-xl font-extrabold text-gray-800">
                        {card.value}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] text-gray-400">
                    {card.sub}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ALERTS + WORKLOAD */}
        <section className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-gray-800">
                  Kitchen Alerts
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  Issues that may require immediate attention.
                </p>
              </div>

              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                <AlertTriangle size={17} />
              </div>
            </div>

            <div className="p-4 space-y-3">
              {operationalAlerts.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle2
                    size={30}
                    className="mx-auto text-green-500"
                  />
                  <p className="mt-3 text-sm font-bold text-gray-700">
                    Kitchen is running smoothly
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    No delayed or urgent kitchen issues.
                  </p>
                </div>
              ) : (
                operationalAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border ${
                      alert.tone === "red"
                        ? "bg-red-50 border-red-100"
                        : alert.tone === "orange"
                        ? "bg-orange-50 border-orange-100"
                        : "bg-blue-50 border-blue-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        size={17}
                        className={
                          alert.tone === "red"
                            ? "text-red-500"
                            : alert.tone === "orange"
                            ? "text-orange-500"
                            : "text-blue-500"
                        }
                      />

                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {alert.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-gray-800">
                  Current Item Workload
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  Items currently being prepared or waiting.
                </p>
              </div>

              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <UtensilsCrossed size={17} />
              </div>
            </div>

            <div className="p-5">
              {itemWorkload.length === 0 ? (
                <div className="py-8 text-center">
                  <ShoppingBag
                    size={28}
                    className="mx-auto text-gray-300"
                  />
                  <p className="mt-3 text-sm font-semibold text-gray-600">
                    No active items
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {itemWorkload.map((item) => {
                    const maxQuantity = Math.max(
                      1,
                      itemWorkload[0]?.quantity || 1
                    );

                    return (
                      <div key={item.name}>
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <span className="text-xs font-semibold text-gray-700 truncate">
                            {item.name}
                          </span>
                          <span className="text-xs font-bold text-gray-500">
                            {item.quantity}
                          </span>
                        </div>

                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-orange-500 transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                100,
                                (item.quantity /
                                  maxQuantity) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SHIFT SUMMARY */}
        <section className="mt-6 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Shift Summary
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Quick operational snapshot from available order data.
              </p>
            </div>

            <span className="text-xs font-semibold text-gray-400">
              Peak order hour:{" "}
              <span className="text-gray-700">
                {busiestHour}
              </span>
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-orange-50 p-4">
              <p className="text-[10px] uppercase font-bold text-orange-500">
                New
              </p>
              <p className="mt-1 text-2xl font-extrabold text-gray-800">
                {stats.pending}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-[10px] uppercase font-bold text-blue-500">
                Cooking
              </p>
              <p className="mt-1 text-2xl font-extrabold text-gray-800">
                {stats.preparing}
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-[10px] uppercase font-bold text-green-500">
                Ready
              </p>
              <p className="mt-1 text-2xl font-extrabold text-gray-800">
                {stats.ready}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-[10px] uppercase font-bold text-gray-500">
                Done
              </p>
              <p className="mt-1 text-2xl font-extrabold text-gray-800">
                {stats.completed}
              </p>
            </div>
          </div>
        </section>

        {/* RECENT COMPLETED */}
        <section className="mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">
              Recently Completed
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Latest orders finished by the kitchen.
            </p>
          </div>

          {recentCompletedOrders.length === 0 ? (
            <div className="py-10 text-center">
              <CheckCircle2
                size={30}
                className="mx-auto text-gray-300"
              />
              <p className="mt-3 text-sm font-semibold text-gray-600">
                No completed orders yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentCompletedOrders.map((order) => (
                <div
                  key={order._id}
                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      Order #
                      {(
                        order.orderNumber ||
                        order._id.slice(-6)
                      )
                        .toString()
                        .toUpperCase()}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {order.customerName || "Guest"} ·{" "}
                      {(order.items || []).length} item
                      {(order.items || []).length === 1
                        ? ""
                        : "s"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold">
                      COMPLETED
                    </span>

                    <span className="text-xs text-gray-400">
                      {formatDateTime(
                        order.updatedAt ||
                          order.createdAt
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* LIVE QUEUE */}
        <section className="mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Live Kitchen Queue
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Process orders from received to ready.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Order / customer / item"
                    className="w-full sm:w-64 h-10 pl-9 pr-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => fetchOrders(true)}
                  className="h-10 px-4 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 flex items-center justify-center gap-2"
                >
                  <RefreshCw
                    size={15}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {[
                ["all", "All"],
                ["pending", "Pending"],
                ["preparing", "Preparing"],
                ["ready", "Ready"],
                ["completed", "Completed"],
                ["cancelled", "Cancelled"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFilter(value as "all" | OrderStatus)
                  }
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold ${
                    filter === value
                      ? "bg-orange-500 text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="py-16 text-center">
                <ShoppingBag
                  size={40}
                  className="mx-auto text-gray-300"
                />

                <h3 className="mt-4 text-base font-bold text-gray-700">
                  No orders found
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  New customer orders will appear here automatically.
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const orderNumber = (
                  order.orderNumber || order._id.slice(-6)
                )
                  .toString()
                  .toUpperCase();

                const updating =
                  updatingOrderId === order._id;

                const priority = getPriority(order);
                const elapsed = elapsedMinutes(order);

                const expanded =
                  expandedOrderId === order._id;

                const instructions =
                  order.specialInstructions ||
                  order.instructions ||
                  order.notes ||
                  "";

                return (
                  <article
                    key={order._id}
                    className={`border rounded-2xl p-4 sm:p-5 ${
                      priority === "urgent"
                        ? "border-red-300 bg-red-50/20"
                        : priority === "high"
                        ? "border-orange-200"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            priority === "urgent"
                              ? "bg-red-50 text-red-500"
                              : "bg-orange-50 text-orange-500"
                          }`}
                        >
                          <ShoppingBag size={21} />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-gray-800">
                              Order #{orderNumber}
                            </h3>

                            <span
                              className={`px-3 py-1 rounded-full border text-[11px] font-bold ${statusClasses[order.status]}`}
                            >
                              {statusLabels[order.status]}
                            </span>

                            <span
                              className={`px-2.5 py-1 rounded-full border text-[10px] font-bold inline-flex items-center gap-1 ${priorityClass[priority]}`}
                            >
                              {priority === "urgent" ? (
                                <AlertTriangle size={11} />
                              ) : priority === "high" ? (
                                <Zap size={11} />
                              ) : (
                                <Clock3 size={11} />
                              )}

                              {priority}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-gray-500">
                            {order.customerName || "Guest"}

                            {order.tableNumber !== undefined &&
                            order.tableNumber !== null
                              ? ` · Table #${order.tableNumber}`
                              : ""}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Received {formatDateTime(order.createdAt)} ·{" "}
                            {timeAgo(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-5">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400">
                            Timer
                          </p>

                          <p
                            className={`mt-1 text-lg font-extrabold ${
                              priority === "urgent"
                                ? "text-red-500"
                                : priority === "high"
                                ? "text-orange-500"
                                : "text-gray-800"
                            }`}
                          >
                            {formatTimer(elapsed)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400">
                            Payment
                          </p>

                          <p
                            className={`mt-1 text-sm font-bold ${
                              order.paymentStatus === "paid"
                                ? "text-green-600"
                                : order.paymentStatus === "failed"
                                ? "text-red-500"
                                : "text-orange-500"
                            }`}
                          >
                            {order.paymentStatus || "pending"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400">
                            Total
                          </p>

                          <p className="mt-1 text-lg font-extrabold text-gray-800">
                            ₹
                            {Number(
                              order.totalAmount || 0
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed
                            size={15}
                            className="text-orange-500"
                          />

                          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                            Kitchen Items
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedOrderId(
                              expanded ? null : order._id
                            )
                          }
                          className="text-xs font-bold text-orange-500"
                        >
                          {expanded
                            ? "Hide details"
                            : "View details"}
                        </button>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {order.items.map((item, index) => (
                          <div
                            key={`${order._id}-${index}`}
                            className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl bg-gray-50"
                          >
                            <span className="text-sm font-semibold text-gray-700">
                              {item.name}
                            </span>

                            <span className="shrink-0 px-2 py-1 rounded-lg bg-white text-xs font-bold text-gray-500">
                              × {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {expanded && (
                      <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                          Special Instructions
                        </p>

                        <p className="mt-2 text-sm text-gray-600">
                          {instructions ||
                            "No special instructions."}
                        </p>

                        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-gray-400">
                          Last Updated
                        </p>

                        <p className="mt-2 text-sm text-gray-600">
                          {formatDateTime(order.updatedAt)}
                        </p>
                      </div>
                    )}

                    {/* KITCHEN NOTE */}
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <StickyNote
                          size={14}
                          className="text-orange-500"
                        />

                        <span className="text-xs font-bold text-gray-500">
                          Kitchen Note
                        </span>
                      </div>

                      <textarea
                        value={kitchenNotes[order._id] || ""}
                        onChange={(event) =>
                          saveNote(
                            order._id,
                            event.target.value
                          )
                        }
                        rows={2}
                        placeholder="Add a kitchen note..."
                        className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-orange-400"
                      />
                    </div>

                    {/* ACTIONS */}
                    {order.status !== "completed" &&
                      order.status !== "cancelled" && (
                        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                          {order.status === "pending" && (
                            <button
                              type="button"
                              disabled={updating}
                              onClick={() =>
                                updateOrderStatus(
                                  order._id,
                                  "preparing"
                                )
                              }
                              className="px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 disabled:opacity-50"
                            >
                              {updating
                                ? "Updating..."
                                : "Start Preparing"}
                            </button>
                          )}

                          {order.status === "preparing" && (
                            <button
                              type="button"
                              disabled={updating}
                              onClick={() =>
                                updateOrderStatus(
                                  order._id,
                                  "ready"
                                )
                              }
                              className="px-5 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 disabled:opacity-50"
                            >
                              {updating
                                ? "Updating..."
                                : "Mark Ready"}
                            </button>
                          )}

                          {order.status === "ready" && (
                            <button
                              type="button"
                              disabled={updating}
                              onClick={() =>
                                updateOrderStatus(
                                  order._id,
                                  "completed"
                                )
                              }
                              className="px-5 py-2.5 rounded-xl bg-gray-800 text-white text-sm font-bold hover:bg-gray-900 disabled:opacity-50"
                            >
                              {updating
                                ? "Updating..."
                                : "Mark Completed"}
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={updating}
                            onClick={() =>
                              updateOrderStatus(
                                order._id,
                                "cancelled"
                              )
                            }
                            className="px-5 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 disabled:opacity-50"
                          >
                            <span className="inline-flex items-center gap-2">
                              <XCircle size={15} />
                              Cancel Order
                            </span>
                          </button>
                        </div>
                      )}
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default KitchenDashboard;