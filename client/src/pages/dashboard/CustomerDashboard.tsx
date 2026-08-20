import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell, Bot, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronUp,
  Clock3, Heart, History, LogOut, Minus, Plus, RefreshCw, Search,
  ShoppingBag, Sparkles, Star, Table2, User, Utensils, Menu, X, MapPin,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

type Status = "pending" | "preparing" | "ready" | "completed" | "cancelled";
type MenuItem = {
  _id: string; name: string; description?: string; price: number;
  category?: string; image?: string; rating?: number; veg?: boolean;
  isAvailable?: boolean;
};
type OrderItem = { name: string; price: number; quantity: number };
type Order = {
  _id: string; orderNumber?: string; customerName?: string;
  items?: OrderItem[]; totalAmount?: number; status?: string;
  paymentStatus?: string; createdAt?: string; updatedAt?: string;
  tableNumber?: string | number;
};
type Table = { _id: string; tableNumber?: string | number; capacity?: number; status?: string };
type Reservation = {
  _id: string; reservationDate: string; time: string; guests: number;
  notes?: string; status: string;
  tableId?: { _id?: string; tableNumber?: string | number; capacity?: number } | string;
};
type CustomerReview = {
  _id: string;
  orderId: string;
  orderNumber?: string;
  rating: number;
  comment: string;
  createdAt: string;
};
type Section = "overview" | "menu" | "orders" | "reservations" | "tables" | "favorites" | "reviews" | "profile" | "ai";

const getToken = () => sessionStorage.getItem("token") || localStorage.getItem("accessToken") || "";
const getUser = () => {
  try {
    return JSON.parse(
      sessionStorage.getItem("user") ||
      localStorage.getItem("user") ||
      "{}"
    );
  } catch {
    return {};
  }
};
const API_ORIGIN = String(
  (import.meta as any)?.env?.VITE_API_URL ||
    "http://localhost:5000"
).replace(/\/api\/?$/, "");
async function api(path: string, options: RequestInit = {}) {
  const t = getToken();
const url = path.startsWith("http")
  ? path
  : `${API_ORIGIN}${path}`;

const response = await fetch(url, {
  ...options,
    headers: {
      "Content-Type": "application/json",
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; }
  catch { throw new Error("Invalid response received from server."); }
  if (!response.ok) throw new Error(data?.message || "Request failed.");
  return data;
}

const money = (value: number | string | undefined) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;


const imageSrc = (value?: string) => {
  if (!value) return "";
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  if (value.startsWith("/")) return `${API_ORIGIN}${value}`;
  return value;
};

const safeStatus = (value?: string): Status =>
  value === "preparing" || value === "ready" || value === "completed" || value === "cancelled"
    ? value : "pending";

const orderNo = (order: Order) =>
  String(order.orderNumber || order._id || "ORDER").slice(-8).toUpperCase();

const timeAgo = (date?: string) => {
  if (!date) return "—";
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const statusInfo: Record<Status, { label: string; cls: string }> = {
  pending: { label: "Order Placed", cls: "bg-orange-50 text-orange-600" },
  preparing: { label: "Preparing", cls: "bg-blue-50 text-blue-600" },
  ready: { label: "Ready to Serve", cls: "bg-green-50 text-green-600" },
  completed: { label: "Served", cls: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-600" },
};
const SectionCard = ({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <Icon size={17} />
          </div>

          <div className="min-w-0">
            <h2 className="font-extrabold truncate">{title}</h2>

            {subtitle && (
              <p className="text-xs text-gray-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          title={isCollapsed ? "Expand" : "Minimize"}
          className="p-2 rounded-lg border border-gray-200 hover:border-orange-300 hover:text-orange-500"
        >
          {isCollapsed ? (
            <ChevronDown size={17} />
          ) : (
            <ChevronUp size={17} />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-4 sm:p-6">
          {children}
        </div>
      )}
    </section>
  );
};

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  // -----------------------------------------
  // RESTAURANT CONTEXT
  // /r/cafe-da-flora/customer/dashboard
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

  useEffect(() => {
    const loadRestaurantBrand = async () => {
      try {
        // 1. First use restaurant already selected during login
        const savedRestaurant =
          sessionStorage.getItem("selectedRestaurant");

        if (savedRestaurant) {
          try {
            const restaurant = JSON.parse(savedRestaurant);

            setRestaurantBrand({
              _id: restaurant._id || restaurant.id,
              name: restaurant.name,
              logo: restaurant.logo,
              slug: restaurant.slug,
            });

            return;
          } catch {
            sessionStorage.removeItem("selectedRestaurant");
          }
        }

        // 2. If dashboard opened directly through /r/:slug
        if (!restaurantSlug) return;

        const response = await fetch(
          `http://localhost:5000/api/restaurants/public/${restaurantSlug}`
        );

        const data = await response.json();

        if (
          response.ok &&
          data?.success &&
          data?.data
        ) {
          const restaurant = data.data;

          setRestaurantBrand({
            _id: restaurant._id || restaurant.id,
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
              restaurant._id || restaurant.id
            );
          }

          if (restaurant.slug) {
            sessionStorage.setItem(
              "restaurantSlug",
              restaurant.slug
            );
          }
        }
      } catch (error) {
        console.error(
          "CUSTOMER RESTAURANT BRAND LOAD ERROR:",
          error
        );
      }
    };

    loadRestaurantBrand();
  }, [restaurantSlug]);

  const restaurantName =
    restaurantBrand?.name || "RestroSphere";

  const restaurantLogo = imageSrc(restaurantBrand?.logo);

  const getDashboard = (role: string) => {
    const base = restaurantSlug
      ? `/r/${restaurantSlug}`
      : "";

    switch (role) {
      case "owner":
        return `${base}/owner/dashboard`;

      case "manager":
        return `${base}/manager/dashboard`;

      case "kitchen":
        return `${base}/kitchen/dashboard`;

      case "waiter":
        return `${base}/waiter/dashboard`;

      case "customer":
      default:
        return `${base}/customer/dashboard`;
    }
  };
  useEffect(() => {
    if (authLoading || !user) return;

    const role = String(user.role || "").toLowerCase();

    if (role === "kitchen") {
  navigate(getDashboard("kitchen"), { replace: true });
  return;
}

if (role === "manager") {
  navigate(getDashboard("manager"), { replace: true });
  return;
}

if (role === "waiter") {
  navigate(getDashboard("waiter"), { replace: true });
  return;
}

if (role === "owner") {
  navigate(getDashboard("owner"), { replace: true });
  return;
}
    if (role !== "customer") {
      navigate("/login", { replace: true });
    }
  }, [authLoading, user, navigate]);
  const customer = getUser();
  const name = customer?.fullName?.trim() || customer?.name?.trim() || "Customer";

  const [active, setActive] = useState<Section>("overview");
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("restrosphereCustomerFavorites") || "[]"); }
    catch { return []; }
  });
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [selectedTableId, setSelectedTableId] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");
  const [booking, setBooking] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const [aiRecommendations, setAiRecommendations] = useState<MenuItem[]>([]);
  const [reservationForm, setReservationForm] = useState({
    tableId: "", date: new Date().toISOString().slice(0, 10),
    time: "19:00", guests: 2, notes: ""
  });

  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("restrosphereCustomerReviews") || "[]"
      );
    } catch {
      return [];
    }
  });
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewOrderId, setReviewOrderId] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const load = useCallback(async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true); else setLoading(true);
      setError("");

  const linkedRestaurantId =
  sessionStorage.getItem("restaurantId") ||
  localStorage.getItem("restaurantId") ||
  restaurantBrand?._id ||
  customer?.restaurantId ||
  customer?.restaurant?._id ||
  "";

      // Menu can be public, but when a customer is linked to a restaurant
      // we explicitly request that restaurant so another restaurant's menu
      // can never leak into this dashboard.
      const menuUrls = linkedRestaurantId
        ? [
            `/api/menu/public?restaurantId=${encodeURIComponent(linkedRestaurantId)}`,
            `/api/menu/public`,
            `/api/menu?restaurantId=${encodeURIComponent(linkedRestaurantId)}`,
          ]
        : ["/api/menu/public", "/api/menu"];

      const fetchFirstMenu = async () => {
        let lastError: unknown = null;
        for (const url of menuUrls) {
          try {
            return await api(url);
          } catch (e) {
            lastError = e;
          }
        }
        throw lastError || new Error("Unable to load menu.");
      };

      const [menuRes, ordersRes, reservationsRes, tablesRes] =
        await Promise.allSettled([
          fetchFirstMenu(),
          api("/api/orders/customer"),
          api("/api/reservations/customer"),
          api("/api/tables"),
        ]);

      if (menuRes.status === "fulfilled") {
        const value = menuRes.value;
        const items =
          Array.isArray(value) ? value :
          Array.isArray(value?.data) ? value.data :
          Array.isArray(value?.menu) ? value.menu : [];
        setMenu(items);
      } else {
        setMenu([]);
        console.error("CUSTOMER MENU LOAD ERROR:", menuRes.reason);
      }

      if (ordersRes.status === "fulfilled") {
        const value = ordersRes.value;
        setOrders(
          Array.isArray(value) ? value :
          Array.isArray(value?.data) ? value.data :
          Array.isArray(value?.orders) ? value.orders : []
        );
      } else {
        console.error("CUSTOMER ORDERS LOAD ERROR:", ordersRes.reason);
      }

      if (reservationsRes.status === "fulfilled") {
        const value = reservationsRes.value;
        setReservations(
          Array.isArray(value) ? value :
          Array.isArray(value?.reservations) ? value.reservations :
          Array.isArray(value?.data) ? value.data : []
        );
      } else {
        console.error("CUSTOMER RESERVATIONS LOAD ERROR:", reservationsRes.reason);
      }

      if (tablesRes.status === "fulfilled") {
        const value = tablesRes.value;
        const liveTables =
          Array.isArray(value) ? value :
          Array.isArray(value?.tables) ? value.tables :
          Array.isArray(value?.data?.tables) ? value.data.tables :
          Array.isArray(value?.data) ? value.data : [];

        setTables(liveTables);
      } else {
        console.error("CUSTOMER TABLES LOAD ERROR:", tablesRes.reason);
      }

      const failed = [menuRes, ordersRes, reservationsRes, tablesRes]
        .filter(r => r.status === "rejected").length;

      if (failed === 4) {
        setError("Unable to connect to restaurant data. Please check the server and customer restaurant link.");
      } else if (failed > 0) {
        setError("Some live restaurant data could not be loaded. Refreshing automatically.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load customer dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
}, [
  customer?.restaurantId,
  customer?.restaurant?._id,
  restaurantBrand?._id,
]);

  useEffect(() => {
    load();
    const interval = window.setInterval(() => load(true), 15000);
    return () => window.clearInterval(interval);
  }, [load]);

  useEffect(() => {
    localStorage.setItem("restrosphereCustomerFavorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(
      "restrosphereCustomerReviews",
      JSON.stringify(reviews)
    );
  }, [reviews]);

  const activeOrders = useMemo(
    () => orders.filter(o => ["pending", "preparing", "ready"].includes(safeStatus(o.status))),
    [orders]
  );

  const notifications = useMemo(() => {
    const list: { id: string; title: string; message: string; order?: Order }[] = [];
    orders.slice(0, 20).forEach(o => {
      const status = safeStatus(o.status);
      if (status === "ready") list.push({ id: `ready-${o._id}`, title: "Order ready", message: `Order #${orderNo(o)} is ready to serve.`, order: o });
      else if (status === "preparing") list.push({ id: `prep-${o._id}`, title: "Order preparing", message: `Order #${orderNo(o)} is being prepared.`, order: o });
      else if (status === "pending") list.push({ id: `pending-${o._id}`, title: "Order received", message: `Order #${orderNo(o)} has reached the restaurant.`, order: o });
    });
    reservations.filter(r => r.status === "confirmed").slice(0, 5).forEach(r => {
      const table = typeof r.tableId === "object" ? r.tableId?.tableNumber : "—";
      list.push({ id: `reservation-${r._id}`, title: "Reservation confirmed", message: `Table ${table} is confirmed for ${r.time}.` });
    });
    return list.slice(0, 12);
  }, [orders, reservations]);

  const categories = useMemo(
    () => [
  "all",
  ...Array.from(
    new Set(
      menu
        .map(i => i.category)
        .filter(Boolean)
        .filter(c => String(c).toLowerCase() !== "all") as string[]
    )
  ),
],
    [menu]
  );

  const filteredMenu = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menu.filter(item =>
      item.isAvailable !== false &&
      (category === "all" || item.category === category) &&
      (!q || `${item.name} ${item.description || ""} ${item.category || ""}`.toLowerCase().includes(q))
    );
  }, [menu, search, category]);

  const favoriteItems = useMemo(() => menu.filter(item => favorites.includes(item._id)), [menu, favorites]);

  const availableTables = useMemo(
    () =>
      tables
        .filter(t => String(t.status || "available").toLowerCase() === "available")
        .sort((a, b) => Number(a.tableNumber || 0) - Number(b.tableNumber || 0)),
    [tables]
  );

  const selectedTable = useMemo(
    () => tables.find(t => t._id === selectedTableId),
    [tables, selectedTableId]
  );

  const cartCount = cart.reduce((sum, x) => sum + x.quantity, 0);
  const cartSubtotal = cart.reduce((sum, x) => sum + Number(x.item.price) * x.quantity, 0);
  const gstAmount = Math.round(cartSubtotal * 0.05 * 100) / 100;
  const serviceCharge = 0;
  const cartTotal = cartSubtotal + gstAmount + serviceCharge;

  const stats = {
    active: activeOrders.length,
    ready: activeOrders.filter(o => safeStatus(o.status) === "ready").length,
    reservations: reservations.filter(r => ["pending", "confirmed"].includes(r.status)).length,
    history: orders.filter(o => safeStatus(o.status) === "completed").length,
  };

  const addToCart = (item: MenuItem) => {
    if (item.isAvailable === false) return;
    setCart(current => {
      const found = current.find(x => x.item._id === item._id);
      if (found) {
        return current.map(x =>
          x.item._id === item._id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }
      return [...current, { item, quantity: 1 }];
    });
    setOrderError("");
  };

  const changeQty = (id: string, delta: number) =>
    setCart(current =>
      current
        .map(x => x.item._id === id ? { ...x, quantity: x.quantity + delta } : x)
        .filter(x => x.quantity > 0)
    );

  const removeFromCart = (id: string) =>
    setCart(current => current.filter(x => x.item._id !== id));

  const toggleFavorite = (id: string) =>
    setFavorites(current =>
      current.includes(id) ? current.filter(x => x !== id) : [...current, id]
    );

  const placeOrder = async () => {
    if (!cart.length) {
      setOrderError("Your cart is empty.");
      return;
    }

    if (!selectedTableId && !tableNumber.trim()) {
      setOrderError("Please select an available table before placing your dine-in order.");
      return;
    }

    setOrderError("");
    setOrderSuccess("");

    try {
      setPlacing(true);

      const payload = {
        items: cart.map(x => ({
          name: x.item.name,
          price: Number(x.item.price),
          quantity: Number(x.quantity),
        })),
        // Backend recalculates the total from item prices.
        totalAmount: Number(cartSubtotal),
        tableNumber: selectedTable
          ? String(selectedTable.tableNumber)
          : tableNumber.trim(),
      };

      const result = await api("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setCart([]);
      setCheckoutOpen(false);
      setTableNumber("");
      setSelectedTableId("");
      setOrderSuccess(result?.message || "Order placed successfully.");

      await load(true);
      setActive("orders");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Unable to place order. Please try again.";
      console.error("CUSTOMER PLACE ORDER ERROR:", e);
      setOrderError(message);
    } finally {
      setPlacing(false);
    }
  };

  const bookReservation = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reservationForm.tableId) return alert("Please select a table.");

    try {
      setBooking(true);
      const result = await api("/api/reservations", {
        method: "POST",
        body: JSON.stringify({
          customerId: customer?._id || customer?.id,
          tableId: reservationForm.tableId,
          reservationDate: reservationForm.date,
          time: reservationForm.time,
          guests: Number(reservationForm.guests),
          notes: reservationForm.notes,
        }),
      });

      await load(true);
      setReservationForm(v => ({ ...v, notes: "", tableId: "" }));
      alert(result?.message || "Reservation requested successfully.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Unable to create reservation.");
    } finally {
      setBooking(false);
    }
  };

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!reviewOrderId) {
      setReviewMessage("Please select an order to review.");
      return;
    }

    if (!reviewRating) {
      setReviewMessage("Please select a rating.");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewMessage("Please write your feedback.");
      return;
    }

    const order = orders.find(o => o._id === reviewOrderId);

    try {
      setReviewSubmitting(true);
      setReviewMessage("");

      /*
       * The current project files do not contain a review/feedback API.
       * So this section stores customer reviews locally for now instead
       * of pretending that an unavailable backend endpoint exists.
       */
      const newReview: CustomerReview = {
        _id: `review_${Date.now()}`,
        orderId: reviewOrderId,
        orderNumber: order ? orderNo(order) : undefined,
        rating: reviewRating,
        comment: reviewComment.trim(),
        createdAt: new Date().toISOString(),
      };

      setReviews(current => [newReview, ...current]);
      setReviewRating(0);
      setReviewComment("");
      setReviewOrderId("");
      setReviewMessage("Thank you! Your review has been submitted.");
    } catch (e) {
      setReviewMessage(
        e instanceof Error ? e.message : "Unable to submit review."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const deleteReview = (reviewId: string) => {
    if (!window.confirm("Delete this review?")) return;
    setReviews(current => current.filter(review => review._id !== reviewId));
  };

  const completedOrders = useMemo(
    () => orders.filter(o => safeStatus(o.status) === "completed"),
    [orders]
  );

  const averageReviewRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const buildLocalAIRecommendations = (prompt: string) => {
    const q = prompt.toLowerCase();
    let picks = menu.filter(i => i.isAvailable !== false);

    if (q.includes("veg")) picks = picks.filter(i => i.veg !== false);
    if (q.includes("non-veg") || q.includes("non veg")) picks = picks.filter(i => i.veg === false);

    const budget = q.match(/(?:under|below|within|budget|₹)\s*(\d+)/);
    if (budget) picks = picks.filter(i => Number(i.price) <= Number(budget[1]));

    if (q.includes("drink") || q.includes("beverage"))
      picks = picks.filter(i => /drink|beverage|shake|coffee|mojito|soda|juice/i.test(`${i.category} ${i.name}`));

    return picks
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 3);
  };

  const askAI = async () => {
    const prompt = aiInput.trim();
    if (!prompt || aiLoading) return;

    const userQuestion = prompt;

    setAiInput("");
    setAiLoading(true);
    setAiReply("");
    setAiRecommendations(buildLocalAIRecommendations(userQuestion));
    setAiMessages((current) => [
      ...current,
      { role: "user", text: userQuestion },
    ]);

    try {
      const result = await api("/api/ai/customer-assistant", {
        method: "POST",
        body: JSON.stringify({
          prompt: userQuestion,
          question: userQuestion,
          message: userQuestion,
          menu: menu
            .filter(i => i.isAvailable !== false)
            .map(i => ({
              name: i.name,
              price: i.price,
              category: i.category,
              description: i.description,
              veg: i.veg,
              rating: i.rating,
            })),
          recentOrders: orders.slice(0, 5).map(o => ({
            orderNumber: orderNo(o),
            items: o.items || [],
            status: safeStatus(o.status),
            totalAmount: o.totalAmount || 0,
          })),
        }),
      });

      const reply =
        result?.reply ||
        result?.response ||
        result?.message ||
        "I could not generate a response right now.";

      setAiReply(reply);
      setAiMessages((current) => [
        ...current,
        { role: "assistant", text: reply },
      ]);
    } catch (e) {
      const picks = buildLocalAIRecommendations(userQuestion);
      const fallback = picks.length
        ? `I can help with your menu. Based on the live RestroSphere menu, I recommend: ${picks
            .map(i => `${i.name} (${money(i.price)})`)
            .join(", ")}.`
        : "Gemini is currently unavailable. Please check that the AI backend endpoint is running.";

      setAiReply(fallback);
      setAiMessages((current) => [
        ...current,
        { role: "assistant", text: fallback },
      ]);
      console.error("CUSTOMER AI ERROR:", e);
    } finally {
      setAiLoading(false);
    }
  };

  const logout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    sessionStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const go = (section: Section) => {
    setActive(section);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (authLoading || loading) return (
    <div className="min-h-screen bg-[#f7f7f8] flex items-center justify-center">
      <div className="text-center">
        <RefreshCw size={32} className="mx-auto text-orange-500 animate-spin"/>
        <p className="mt-3 text-sm text-gray-500">Loading your dashboard...</p>
      </div>
    </div>
  );

  const NavButton = ({ section, icon: Icon, label }: { section: Section; icon: React.ElementType; label: string }) => (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        go(section);
      }}
      className={`relative z-[100] pointer-events-auto w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer select-none ${
        active === section
          ? "bg-orange-500 text-white shadow-sm"
          : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
      }`}
    >
      <Icon size={17}/><span>{label}</span>
    </button>
  );



  const renderMenuCards = (items: MenuItem[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.length === 0 ? (
        <div className="col-span-full py-14 text-center text-gray-400">
          <Utensils size={38} className="mx-auto text-gray-300"/>
          <p className="mt-3 font-bold text-gray-600">No dishes found</p>
        </div>
      ) : items.map(item => (
        <article key={item._id} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition bg-white">
<div className="w-full h-56 bg-white overflow-hidden">

            {item.image ? <img src={imageSrc(item.image)} alt={item.name}className="w-full h-full object-contain"
              onError={e => { e.currentTarget.style.display = "none"; }}/> : null}
            <div className="absolute inset-0 flex items-center justify-center text-orange-300 -z-0"><Utensils size={36}/></div>
            <button type="button" onClick={() => toggleFavorite(item._id)}
              className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 shadow flex items-center justify-center ${favorites.includes(item._id) ? "text-red-500" : "text-gray-400"}`}
              title="Favorite">
              <Heart size={17} fill={favorites.includes(item._id) ? "currentColor" : "none"}/>
            </button>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-extrabold leading-5">{item.name}</h3>
              {item.veg !== undefined && <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded ${item.veg ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>{item.veg ? "VEG" : "NON-VEG"}</span>}
            </div>
            <p className="mt-1 text-xs text-gray-400 line-clamp-2">{item.description || "Freshly prepared."}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <Star size={14} className="text-amber-400" fill="currentColor"/><span>{item.rating || "New"}</span>{item.category && <span>• {item.category}</span>}
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <b className="text-lg">{money(item.price)}</b>
              {(() => {
  const cartItem = cart.find(x => x.item._id === item._id);

  if (cartItem) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => changeQty(item._id, -1)}
          className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
        >
          <Minus size={15} />
        </button>

        <span className="w-6 text-center font-extrabold">
          {cartItem.quantity}
        </span>

        <button
          type="button"
          onClick={() => changeQty(item._id, 1)}
          className="w-9 h-9 rounded-xl bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center"
        >
          <Plus size={15} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addToCart(item)}
      className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-orange-600"
    >
      <Plus size={15} />
      Add
    </button>
  );
})()}
            </div>
          </div>
        </article>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#172033]">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-3">
          <button
  type="button"
  onClick={() => setMobileSidebarOpen(true)}
  className="lg:hidden p-2.5 rounded-xl border border-gray-200 hover:border-orange-300 shrink-0"
  title="Open menu"
>
  <Menu size={20} />
</button>
          <div className="flex items-center gap-3 min-w-0">
  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 overflow-hidden">
    {restaurantLogo ? (
      <img
        src={restaurantLogo}
        alt={restaurantName}
        className="w-full h-full object-contain"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    ) : (
      <Utensils
        size={20}
        className="text-orange-500"
      />
    )}
  </div>

  <div className="min-w-0">
    <p className="font-extrabold text-lg truncate max-w-[220px]">
      {restaurantName}
    </p>

    <p className="text-[11px] text-gray-400">
      Customer Dashboard
    </p>
  </div>
</div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => load(true)} className="p-2.5 rounded-xl border border-gray-200 hover:border-orange-300" title="Refresh"><RefreshCw size={17} className={refreshing ? "animate-spin" : ""}/></button>
            <div className="relative">
              <button type="button" onClick={() => setNotificationsOpen(v => !v)} className="relative p-2.5 rounded-xl border border-gray-200 hover:border-orange-300" title="Notifications">
                <Bell size={17}/>{notifications.length > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{notifications.length > 9 ? "9+" : notifications.length}</span>}
              </button>
{notificationsOpen && <div className="fixed lg:absolute top-[76px] lg:top-12 left-3 right-3 lg:left-auto lg:right-0 w-auto lg:w-[380px] max-w-[calc(100vw-24px)] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-[60]">                <div className="p-4 border-b flex items-center justify-between"><div><b>Notifications</b><p className="text-xs text-gray-400 mt-1">{notifications.length} live updates</p></div><button type="button" onClick={() => setNotificationsOpen(false)}><X size={17}/></button></div>
                <div className="max-h-80 overflow-y-auto">{notifications.length === 0 ? <p className="p-8 text-center text-sm text-gray-400">You're all caught up.</p> : notifications.map(n =>
                  <button key={n.id} type="button" onClick={() => { setNotificationsOpen(false); if (n.order) { setSelectedOrder(n.order); go("orders"); } }} className="w-full text-left p-4 border-b hover:bg-gray-50">
                    <p className="text-sm font-bold">{n.title}</p><p className="mt-1 text-xs text-gray-500">{n.message}</p>
                  </button>)}</div>
              </div>}
            </div>
            <div className="hidden md:flex items-center gap-2 pl-2 border-l"><div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center"><User size={16}/></div><div><p className="text-xs font-bold">{name}</p><p className="text-[10px] text-gray-400">Customer</p></div></div>
            <button type="button" onClick={logout} className="p-2.5 rounded-xl border border-gray-200 hover:border-red-200 hover:text-red-500" title="Logout"><LogOut size={17}/></button>
          </div>
        </div>
      </header>
      {mobileSidebarOpen && (
  <div className="lg:hidden fixed inset-0 z-[80]">
    {/* Overlay */}
    <button
      type="button"
      aria-label="Close menu"
      onClick={() => setMobileSidebarOpen(false)}
      className="absolute inset-0 bg-black/40"
    />

    {/* Sidebar */}
    <aside className="absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-white shadow-2xl p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
            Customer
          </p>
          <p className="font-extrabold text-lg mt-1">
            Customer Menu
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMobileSidebarOpen(false)}
          className="p-2 rounded-xl border border-gray-200 hover:border-orange-300"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="space-y-1">
  <NavButton section="overview" icon={ShoppingBag} label="Overview"/>
  <NavButton section="menu" icon={Utensils} label="Menu & Order"/>
  <NavButton section="orders" icon={History} label="My Orders"/>
  <NavButton section="reservations" icon={CalendarDays} label="Reservations"/>
  <NavButton section="tables" icon={Table2} label="Tables"/>
  <NavButton section="favorites" icon={Heart} label="Favorites"/>
  <NavButton section="reviews" icon={Star} label="Feedback & Reviews"/>
  <NavButton section="ai" icon={Sparkles} label="AI Assistant"/>
  <NavButton section="profile" icon={User} label="Profile"/>
</nav>

      <div className="mt-6 p-4 rounded-2xl bg-orange-50 border border-orange-100">
        <Sparkles size={18} className="text-orange-500"/>
        <p className="mt-2 text-sm font-bold">Need a dish?</p>
        <p className="mt-1 text-xs text-gray-500">
          Ask the Gemini-powered assistant.
        </p>

        <button
          type="button"
          onClick={() => {
            go("ai");
            setMobileSidebarOpen(false);
          }}
          className="mt-3 text-xs font-bold text-orange-600"
        >
          Open AI →
        </button>
      </div>
    </aside>
  </div>
)}

      <div className="max-w-[1600px] mx-auto flex">
        <aside className="relative z-[90] hidden lg:block w-60 shrink-0 border-r border-gray-200 bg-white min-h-[calc(100vh-68px)] p-4 sticky top-[68px] self-start pointer-events-auto">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-2">Customer</p>
          <nav className="space-y-1">
  <NavButton section="overview" icon={ShoppingBag} label="Overview"/>
  <NavButton section="menu" icon={Utensils} label="Menu & Order"/>
  <NavButton section="orders" icon={History} label="My Orders"/>
  <NavButton section="reservations" icon={CalendarDays} label="Reservations"/>
  <NavButton section="tables" icon={Table2} label="Tables"/>
  <NavButton section="favorites" icon={Heart} label="Favorites"/>
  <NavButton section="reviews" icon={Star} label="Feedback & Reviews"/>
  <NavButton section="ai" icon={Sparkles} label="AI Assistant"/>
  <NavButton section="profile" icon={User} label="Profile"/>
</nav>
          <div className="mt-6 p-4 rounded-2xl bg-orange-50 border border-orange-100">
            <Sparkles size={18} className="text-orange-500"/><p className="mt-2 text-sm font-bold">Need a dish?</p><p className="mt-1 text-xs text-gray-500">Ask the Gemini-powered assistant.</p>
            <button type="button" onClick={() => go("ai")} className="mt-3 text-xs font-bold text-orange-600">Open AI →</button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 px-3 sm:px-5 lg:px-7 py-5">
          {error && <div className="mb-5 p-4 rounded-2xl border border-red-200 bg-red-50 text-sm text-red-600">{error}</div>}
          {orderSuccess && (
            <div className="mb-5 p-4 rounded-2xl border border-green-200 bg-green-50 text-sm text-green-700 flex items-center gap-2">
              <CheckCircle2 size={18}/>
              <span>{orderSuccess}</span>
            </div>
          )}

          <section className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-7">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
              <div><p className="text-xs uppercase tracking-[0.16em] text-orange-500 font-bold">CUSTOMER EXPERIENCE</p><h1 className="mt-1 text-2xl sm:text-4xl font-extrabold">Welcome, {name.split(" ")[0]} 👋</h1><p className="mt-2 text-sm sm:text-base text-gray-500">Order food, reserve a table and track everything live.</p></div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => go("menu")} className="px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold inline-flex items-center gap-2"><Utensils size={16}/> Order Now</button>
                <button type="button" onClick={() => go("reservations")} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold inline-flex items-center gap-2"><CalendarDays size={16}/> Reserve Table</button>
                <button type="button" onClick={() => go("ai")} className="px-4 py-2.5 rounded-xl bg-[#172033] text-white text-sm font-bold inline-flex items-center gap-2"><Sparkles size={16}/> Ask AI</button>
              </div>
            </div>
          </section>

         

          {active === "overview" && <div className="mt-5 space-y-5">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              {[
                ["Active Orders",stats.active,ShoppingBag,"bg-orange-50 text-orange-500"],["Ready to Serve",stats.ready,CheckCircle2,"bg-green-50 text-green-500"],
                ["Reservations",stats.reservations,CalendarDays,"bg-purple-50 text-purple-500"],["Past Orders",stats.history,History,"bg-blue-50 text-blue-500"]
              ].map(([label,value,Icon,cls]: any) => <div key={label} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cls}`}><Icon size={18}/></div><p className="mt-4 text-2xl font-extrabold">{value}</p><p className="text-xs sm:text-sm text-gray-500">{label}</p></div>)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <p className="text-xs text-gray-400">Pending Payments</p>
                <p className="mt-1 text-2xl font-extrabold text-red-500">{orders.filter(o => String(o.paymentStatus || "pending").toLowerCase() === "pending").length}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <p className="text-xs text-gray-400">Paid Orders</p>
                <p className="mt-1 text-2xl font-extrabold text-green-600">{orders.filter(o => String(o.paymentStatus || "").toLowerCase() === "paid").length}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <p className="text-xs text-gray-400">Live Tables</p>
                <p className="mt-1 text-2xl font-extrabold">{tables.length}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <SectionCard id="overview-orders" title="Live Order Tracking" subtitle="Your current orders update automatically." icon={Clock3}>
                {activeOrders.length === 0 ? <div className="py-10 text-center text-gray-400"><ShoppingBag size={36} className="mx-auto text-gray-300"/><p className="mt-3 font-bold text-gray-600">No active orders</p><button type="button" onClick={() => go("menu")} className="mt-3 text-orange-500 font-bold text-sm">Browse Menu</button></div> :
                <div className="space-y-3">{activeOrders.slice(0,4).map(order => <button type="button" key={order._id} onClick={() => setSelectedOrder(order)} className="w-full text-left border rounded-xl p-4 hover:border-orange-300"><div className="flex items-center justify-between gap-3"><div><b>Order #{orderNo(order)}</b><p className="text-xs text-gray-400 mt-1">{timeAgo(order.createdAt)}</p></div><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusInfo[safeStatus(order.status)].cls}`}>{statusInfo[safeStatus(order.status)].label}</span></div><div className="mt-4 grid grid-cols-4 gap-1">{["pending","preparing","ready","completed"].map((step,i) => { const currentIndex = ["pending","preparing","ready","completed"].indexOf(safeStatus(order.status)); return <div key={step} className={`h-1.5 rounded-full ${i <= currentIndex ? "bg-orange-500" : "bg-gray-100"}`}/>; })}</div></button>)}</div>}
              </SectionCard>
              <SectionCard id="overview-ai" title="Gemini Food Assistant" subtitle="Recommendations based on the live menu." icon={Sparkles}>
                <div className="rounded-2xl bg-[#172033] text-white p-5"><div className="flex items-center gap-3"><Bot size={24} className="text-orange-400"/><div><b>Ask RestroSphere AI</b><p className="text-xs text-white/60 mt-1">Diet, budget, cravings, menu questions.</p></div></div><button type="button" onClick={() => go("ai")} className="mt-5 w-full py-3 rounded-xl bg-orange-500 font-bold">Open AI Assistant</button></div>
              </SectionCard>
            </div>
            <SectionCard id="overview-menu" title="Popular / Available Dishes" subtitle={`${menu.filter(i => i.isAvailable !== false).length} live menu items available.`} icon={Utensils}>{renderMenuCards(menu.filter(i => i.isAvailable !== false).slice(0,6))}</SectionCard>
          </div>}

          {active === "menu" && <div className="mt-5 space-y-5">
            <SectionCard id="menu-section" title="Digital Menu & Ordering" subtitle={`${menu.filter(i => i.isAvailable !== false).length} dishes available right now. Menu changes from Owner/Manager appear automatically.`} icon={Utensils}>
              <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {categories.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                        category === c ? "bg-orange-500 text-white" : "bg-gray-50 text-gray-600 hover:bg-orange-50"
                      }`}
                    >
                      {c === "all" ? "All" : c}
                    </button>
                  ))}
                </div>

                <div className="relative w-full lg:w-72 shrink-0">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search dishes..."
                    className="w-full h-10 rounded-xl border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 cursor-text"
                  />
                </div>
              </div>
              <div className="mt-5">{renderMenuCards(filteredMenu)}</div>
            </SectionCard>
            {cartCount > 0 && <div className="sticky bottom-4 z-30 bg-[#172033] text-white rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between shadow-2xl"><div><b>{cartCount} item{cartCount > 1 ? "s" : ""}</b><span className="text-white/60"> · {money(cartTotal)}</span></div><button type="button" onClick={() => setCheckoutOpen(true)} className="px-5 py-2.5 rounded-xl bg-orange-500 font-bold">View Cart & Checkout</button></div>}
          </div>}

          {active === "orders" && <div className="mt-5"><SectionCard id="orders-section" title="My Orders" subtitle="Track every order from received to served." icon={History}>
            {orders.length === 0 ? <div className="py-16 text-center text-gray-400"><ShoppingBag size={40} className="mx-auto text-gray-300"/><p className="mt-3 font-bold text-gray-600">No orders yet</p><button type="button" onClick={() => go("menu")} className="mt-3 text-orange-500 font-bold">Browse Menu</button></div> :
            <div className="space-y-4">{orders.map(order => { const status = safeStatus(order.status); return <button type="button" key={order._id} onClick={() => setSelectedOrder(order)} className="w-full text-left border rounded-2xl p-4 sm:p-5 hover:border-orange-300"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><h3 className="font-extrabold">Order #{orderNo(order)}</h3><p className="text-xs text-gray-400 mt-1">{order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "—"} · {order.tableNumber ? `Table ${order.tableNumber}` : "Takeaway / unspecified table"}</p></div><div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold w-fit ${statusInfo[status].cls}`}>{statusInfo[status].label}</span>
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold ${String(order.paymentStatus || "pending").toLowerCase() === "paid" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                    Payment: {String(order.paymentStatus || "pending")}
                  </span>
                </div></div><div className="mt-4 space-y-1 text-sm text-gray-600">{(order.items || []).map((item,idx) => <div key={`${item.name}-${idx}`} className="flex justify-between gap-3"><span>{item.name} × {item.quantity}</span><span>{money(Number(item.price) * Number(item.quantity))}</span></div>)}</div><div className="mt-4 pt-3 border-t flex justify-between font-extrabold"><span>Total</span><span>{money(order.totalAmount)}</span></div></button>; })}</div>}
          </SectionCard></div>}

          {active === "reservations" && <div className="mt-5 grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-5">
            <SectionCard id="reservation-form" title="Reserve a Table" subtitle="Choose from the live table list." icon={CalendarDays}>
              <form onSubmit={bookReservation} className="space-y-3">
                <select
                  required
                  value={reservationForm.tableId}
                  onChange={e => setReservationForm(v => ({...v,tableId:e.target.value}))}
                  className="w-full h-11 border rounded-xl px-3 bg-white"
                >
                  <option value="">Select available table</option>
                  {availableTables.map(t => (
                    <option key={t._id} value={t._id}>
                      Table {t.tableNumber} · {t.capacity || "—"} seats
                    </option>
                  ))}
                </select>
                {tables.length > 0 && availableTables.length === 0 && (
                  <p className="text-xs text-red-500">
                    No tables are currently available. Please choose another time.
                  </p>
                )}
                <input required type="date" min={new Date().toISOString().slice(0,10)} value={reservationForm.date} onChange={e => setReservationForm(v => ({...v,date:e.target.value}))} className="w-full h-11 border rounded-xl px-3"/>
                <input required type="time" value={reservationForm.time} onChange={e => setReservationForm(v => ({...v,time:e.target.value}))} className="w-full h-11 border rounded-xl px-3"/>
                <input required min={1} type="number" value={reservationForm.guests} onChange={e => setReservationForm(v => ({...v,guests:Number(e.target.value)}))} className="w-full h-11 border rounded-xl px-3" placeholder="Guests"/>
                <textarea value={reservationForm.notes} onChange={e => setReservationForm(v => ({...v,notes:e.target.value}))} className="w-full border rounded-xl p-3 min-h-24" placeholder="Special notes (optional)"/>
                <button disabled={booking} className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold disabled:opacity-60">{booking ? "Booking..." : "Request Reservation"}</button>
              </form>
            </SectionCard>
            <SectionCard id="my-reservations" title="My Reservations" subtitle="Live reservation status." icon={CalendarDays}>
              {reservations.length === 0 ? <div className="py-14 text-center text-gray-400"><CalendarDays size={38} className="mx-auto text-gray-300"/><p className="mt-3 font-bold text-gray-600">No reservations yet</p></div> :
              <div className="space-y-3">{reservations.map(r => {
                const table = typeof r.tableId === "object" ? r.tableId?.tableNumber : "—";
                const capacity = typeof r.tableId === "object" ? r.tableId?.capacity : undefined;
                return (
                  <div key={r._id} className="border rounded-2xl p-4 hover:border-orange-200 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <b>Table {table}</b>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${r.status === "confirmed" ? "bg-green-50 text-green-600" : r.status === "cancelled" ? "bg-red-50 text-red-500" : "bg-orange-50 text-orange-600"}`}>{r.status}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(r.reservationDate).toLocaleDateString("en-IN")} · {r.time} · {r.guests} guests
                          {capacity ? ` · ${capacity} seats` : ""}
                        </p>
                        {r.notes && <p className="text-xs text-gray-500 mt-2">{r.notes}</p>}
                      </div>
                      <CalendarDays size={20} className="text-purple-500 shrink-0"/>
                    </div>
                  </div>
                );
              })}</div>}
            </SectionCard>
          </div>}

          {active === "tables" && <div className="mt-5"><SectionCard id="tables-section" title="Restaurant Tables" subtitle={`${tables.length} tables from your restaurant · status refreshes every 15 seconds.`} icon={Table2}>
            <div className="mb-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-green-50 border border-green-100 p-4">
                <p className="text-xs font-bold text-green-600">AVAILABLE</p>
                <p className="mt-1 text-2xl font-extrabold text-green-700">{availableTables.length}</p>
              </div>
              <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4">
                <p className="text-xs font-bold text-orange-600">RESERVED</p>
                <p className="mt-1 text-2xl font-extrabold text-orange-700">
                  {tables.filter(t => String(t.status || "").toLowerCase() === "reserved").length}
                </p>
              </div>
              <div className="rounded-2xl bg-red-50 border border-red-100 p-4 col-span-2 sm:col-span-1">
                <p className="text-xs font-bold text-red-600">OCCUPIED</p>
                <p className="mt-1 text-2xl font-extrabold text-red-700">
                  {tables.filter(t => String(t.status || "").toLowerCase() === "occupied").length}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
              {tables.length === 0 ? (
                <div className="col-span-full py-14 text-center text-gray-400">
                  <Table2 size={38} className="mx-auto text-gray-300"/>
                  <p className="mt-3 font-bold text-gray-600">No table data available</p>
                  <p className="mt-1 text-xs">Refresh after the owner creates or updates tables.</p>
                </div>
              ) : (
                tables.map(table => {
                  const status = String(table.status || "available").toLowerCase();
                  const available = status === "available";
                  const reserved = status === "reserved";

                  return (
                    <div key={table._id} className="border border-gray-200 rounded-2xl p-4 bg-white">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        available ? "bg-green-50 text-green-600"
                        : reserved ? "bg-orange-50 text-orange-600"
                        : "bg-red-50 text-red-500"
                      }`}>
                        <Table2 size={20}/>
                      </div>

                      <p className="mt-3 font-extrabold">Table {table.tableNumber}</p>
                      <p className="text-xs text-gray-400">{table.capacity || "—"} seats</p>

                      <span className={`inline-flex mt-3 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        available ? "bg-green-50 text-green-600"
                        : reserved ? "bg-orange-50 text-orange-600"
                        : "bg-red-50 text-red-500"
                      }`}>
                        {status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard></div>}

          {active === "favorites" && <div className="mt-5"><SectionCard id="favorites-section" title="Favorite Dishes" subtitle="Your saved menu items." icon={Heart}>{renderMenuCards(favoriteItems)}</SectionCard></div>}

          {active === "reviews" && <div className="mt-5 space-y-5">
            <SectionCard
  id="reviews-section"
  title="Feedback & Reviews"
  subtitle="Share your experience with us."
  icon={Star}
>
              <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-5">
                <div className="rounded-2xl bg-[#172033] text-white p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-orange-400 font-bold">
                        Your Experience
                      </p>
                      <h3 className="mt-1 text-xl font-extrabold">
                        How was your visit?
                      </h3>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-orange-500 flex items-center justify-center">
                      <Star size={22} fill="currentColor"/>
                    </div>
                  </div>

                  {completedOrders.length === 0 ? (
                    <div className="mt-6 rounded-2xl bg-white/10 border border-white/10 p-4">
                      <p className="text-sm font-bold">No completed orders yet.</p>
                      <p className="mt-1 text-xs text-white/60">
                        Once an order is served, you can leave feedback here.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={submitReview} className="mt-6 space-y-4">
                      <div>
                        <label className="text-xs font-bold text-white/70">
                          Select completed order
                        </label>
                        <select
                          value={reviewOrderId}
                          onChange={e => {
                            setReviewOrderId(e.target.value);
                            setReviewMessage("");
                          }}
                          className="mt-2 w-full h-11 rounded-xl px-3 text-gray-900 bg-white outline-none"
                        >
                          <option value="">Choose an order</option>
                          {completedOrders.map(order => (
                            <option
                              key={order._id}
                              value={order._id}
                              disabled={reviews.some(r => r.orderId === order._id)}
                            >
                              Order #{orderNo(order)}
                              {reviews.some(r => r.orderId === order._id) ? " · Reviewed" : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white/70">
                          Your rating
                        </label>
                        <div className="mt-2 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(value => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => {
                                setReviewRating(value);
                                setReviewMessage("");
                              }}
                              className="p-1.5 rounded-lg hover:bg-white/10 transition"
                              aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                            >
                              <Star
                                size={28}
                                className={value <= reviewRating ? "text-orange-400" : "text-white/30"}
                                fill={value <= reviewRating ? "currentColor" : "none"}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="customer-review-comment" className="text-xs font-bold text-white/70">
                          Feedback
                        </label>

                        <textarea
                          id="customer-review-comment"
                          name="customer-review-comment"
                          value={reviewComment}
                          onChange={(e) => {
                            setReviewComment(e.target.value);
                            setReviewMessage("");
                          }}
                          maxLength={500}
                          rows={5}
                          spellCheck
                          autoComplete="off"
                          placeholder="Write your experience here..."
                          className="mt-2 w-full min-h-[130px] resize-y rounded-2xl bg-white text-gray-900 border-0 px-4 py-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-orange-400 cursor-text"
                        />

                        <p className="mt-1 text-[10px] text-white/40 text-right">
                          {reviewComment.length}/500
                        </p>
                      </div>

                      {reviewMessage && (
                        <div className={`rounded-xl p-3 text-sm ${
                          reviewMessage.includes("Thank you")
                            ? "bg-green-500/15 text-green-300 border border-green-400/20"
                            : "bg-red-500/15 text-red-300 border border-red-400/20"
                        }`}>
                          {reviewMessage}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={reviewSubmitting || !completedOrders.some(o => o._id === reviewOrderId && !reviews.some(r => r.orderId === o._id))}
                        className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reviewSubmitting ? "Submitting..." : "Submit Review"}
                      </button>
                    </form>
                  )}
                </div>

                <div>
                  <div className="rounded-2xl border border-gray-200 p-5 bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-[0.14em] font-bold">
                          Your Reviews
                        </p>
                        <p className="mt-1 text-3xl font-extrabold">
                          {averageReviewRating ? averageReviewRating.toFixed(1) : "—"}
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(value => (
                            <Star
                              key={value}
                              size={15}
                              className={averageReviewRating >= value ? "text-orange-400" : "text-gray-200"}
                              fill={averageReviewRating >= value ? "currentColor" : "none"}
                            />
                          ))}
                          <span className="ml-1 text-xs text-gray-400">
                            {reviews.length} review{reviews.length === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                        <Star size={23} fill="currentColor"/>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {reviews.length === 0 ? (
                      <div className="py-12 text-center border border-dashed border-gray-200 rounded-2xl">
                        <Star size={34} className="mx-auto text-gray-200"/>
                        <p className="mt-3 font-bold text-gray-600">
                          No reviews yet
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Your submitted reviews will appear here.
                        </p>
                      </div>
                    ) : (
                      reviews.map(review => (
                        <div key={review._id} className="border border-gray-200 rounded-2xl p-4 bg-white">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(value => (
                                  <Star
                                    key={value}
                                    size={14}
                                    className={value <= review.rating ? "text-orange-400" : "text-gray-200"}
                                    fill={value <= review.rating ? "currentColor" : "none"}
                                  />
                                ))}
                              </div>
                              <p className="mt-2 text-sm font-bold">
                                Order #{review.orderNumber || review.orderId.slice(-8).toUpperCase()}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteReview(review._id)}
                              className="text-xs font-bold text-red-500 hover:text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                          <p className="mt-3 text-sm text-gray-600 leading-6">
                            {review.comment}
                          </p>
                          <p className="mt-2 text-[11px] text-gray-400">
                            {new Date(review.createdAt).toLocaleString("en-IN")}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>}

          {active === "ai" && (
            <div className="mt-5">
              <SectionCard
                id="ai-section"
                title="RestroSphere AI Assistant"
                subtitle="Ask Gemini anything about the menu, dishes, orders or recommendations."
                icon={Sparkles}
              >
                <div className="max-w-5xl mx-auto">
                  <div className="rounded-3xl bg-[#172033] text-white overflow-hidden shadow-sm">
                    <div className="p-5 sm:p-7 border-b border-white/10">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-orange-500 flex items-center justify-center shrink-0">
                          <Bot size={23}/>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-lg">Gemini Food Assistant</h3>
                          <p className="mt-1 text-xs sm:text-sm text-white/60">
                            Type your own question below. Your question and Gemini's answer will stay visible in this chat.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {[
                          "Suggest veg dishes under ₹500",
                          "What should I order for two?",
                          "Show my latest order status",
                          "Recommend something spicy",
                        ].map(q => (
                          <button
                            type="button"
                            key={q}
                            onClick={() => setAiInput(q)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                              aiInput === q
                                ? "bg-orange-500 border-orange-400 text-white"
                                : "bg-white/10 border-white/10 text-white/80 hover:bg-white/15"
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 sm:p-6">
                      <div className="min-h-[180px] max-h-[430px] overflow-y-auto space-y-4 pr-1">
                        {aiMessages.length === 0 ? (
                          <div className="min-h-[160px] flex flex-col items-center justify-center text-center text-white/45">
                            <Bot size={34} className="mb-3 text-orange-400"/>
                            <p className="font-bold text-white/70">Ask me anything</p>
                            <p className="mt-1 text-xs">
                              Your typed question will appear here after you send it.
                            </p>
                          </div>
                        ) : (
                          aiMessages.map((message, index) => (
                            <div
                              key={`${message.role}-${index}`}
                              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[92%] sm:max-w-[78%] rounded-2xl px-4 py-3 ${
                                  message.role === "user"
                                    ? "bg-orange-500 text-white rounded-br-md"
                                    : "bg-white/10 text-white/90 rounded-bl-md"
                                }`}
                              >
                                <p className="text-[10px] uppercase tracking-wider font-bold opacity-60 mb-1">
                                  {message.role === "user" ? "You" : "Gemini"}
                                </p>
                                <p className="text-sm leading-6 whitespace-pre-wrap break-words">
                                  {message.text}
                                </p>
                              </div>
                            </div>
                          ))
                        )}

                        {aiLoading && (
                          <div className="flex justify-start">
                            <div className="rounded-2xl rounded-bl-md bg-white/10 px-4 py-3 text-sm text-white/60">
                              Gemini is thinking...
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-5">
                        <label
                          htmlFor="customer-ai-question"
                          className="block mb-2 text-xs font-bold text-white/70"
                        >
                          Your question
                        </label>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <textarea
                            id="customer-ai-question"
                            name="customer-ai-question"
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                askAI();
                              }
                            }}
                            rows={3}
                            maxLength={1000}
                            spellCheck
                            autoComplete="off"
                            placeholder="Type your question here... e.g. Which veg dish is best under ₹500?"
                            className="flex-1 min-h-[96px] resize-none rounded-2xl bg-white text-gray-900 px-4 py-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-orange-400 cursor-text"
                          />

                          <button
                            type="button"
                            disabled={aiLoading || !aiInput.trim()}
                            onClick={askAI}
                            className="sm:w-32 min-h-12 sm:min-h-[96px] rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {aiLoading ? "Thinking..." : "Ask Gemini"}
                          </button>
                        </div>

                        <p className="mt-2 text-[10px] text-white/35">
                          Enter to send · Shift + Enter for a new line
                        </p>
                      </div>
                    </div>
                  </div>

                  {aiRecommendations.length > 0 && (
                    <div className="mt-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={16} className="text-orange-500"/>
                        <p className="text-sm font-extrabold">Recommended from your live menu</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {aiRecommendations.map(item => (
                          <div key={item._id} className="border border-gray-200 rounded-2xl p-4 bg-white">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-bold text-sm break-words">{item.name}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {money(item.price)} · {item.category || "Dish"}
                                </p>
                              </div>
                              {item.veg !== undefined && (
                                <span className="shrink-0 text-[9px] font-bold px-2 py-1 rounded bg-green-50 text-green-600">
                                  {item.veg ? "VEG" : "NON-VEG"}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => addToCart(item)}
                              className="mt-3 w-full py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold inline-flex items-center justify-center gap-1 hover:bg-orange-600"
                            >
                              <Plus size={14}/> Add to Cart
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiReply && aiMessages.length === 0 && (
                    <div className="mt-4 border border-orange-100 rounded-2xl p-5 bg-white">
                      <div className="flex items-center gap-2 text-orange-500">
                        <Bot size={18}/>
                        <span className="text-xs font-bold uppercase tracking-wide">Gemini response</span>
                      </div>
                      <div className="mt-3 text-sm leading-7 whitespace-pre-wrap text-gray-700">
                        {aiReply}
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>
          )}

          {active === "profile" && <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-5">
            <SectionCard id="profile-card" title="My Profile" subtitle="Account information from your customer account." icon={User}>
              <div className="space-y-4"><div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center"><User size={28}/></div>
                <div><p className="text-xs text-gray-400">Name</p><p className="font-bold">{name}</p></div>
                <div><p className="text-xs text-gray-400">Email</p><p className="font-bold break-all">{customer?.email || "—"}</p></div>
                <div><p className="text-xs text-gray-400">Phone</p><p className="font-bold">{customer?.phone || "—"}</p></div>
                <div><p className="text-xs text-gray-400">Role</p><p className="font-bold capitalize">{customer?.role || "customer"}</p></div>
              </div>
            </SectionCard>
            <SectionCard id="profile-actions" title="Quick Actions" subtitle="Common customer actions." icon={Sparkles}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" onClick={() => go("menu")} className="p-4 rounded-xl border text-left hover:border-orange-300"><Utensils size={18} className="text-orange-500"/><b className="block mt-2">Browse Menu</b><span className="text-xs text-gray-400">Order your favourite dishes.</span></button>
                <button type="button" onClick={() => go("reservations")} className="p-4 rounded-xl border text-left hover:border-orange-300"><CalendarDays size={18} className="text-purple-500"/><b className="block mt-2">Reserve Table</b><span className="text-xs text-gray-400">Check live table availability.</span></button>
                <button type="button" onClick={() => go("orders")} className="p-4 rounded-xl border text-left hover:border-orange-300"><History size={18} className="text-blue-500"/><b className="block mt-2">View Orders</b><span className="text-xs text-gray-400">Track past and active orders.</span></button>
                <button type="button" onClick={() => go("ai")} className="p-4 rounded-xl border text-left hover:border-orange-300"><Sparkles size={18} className="text-orange-500"/><b className="block mt-2">Ask AI</b><span className="text-xs text-gray-400">Get menu-aware recommendations.</span></button>
              </div>
            </SectionCard>
          </div>}
        </main>
      </div>

      {checkoutOpen && <div className="fixed inset-0 z-[70] bg-black/40 flex items-end sm:items-center justify-center p-3">
        <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-5 max-h-[55vh] overflow-y-auto space-y-3">
            {cart.map(x => (
              <div key={x.item._id} className="border rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <b className="block truncate">{x.item.name}</b>
                  <span className="text-xs text-gray-400">{money(x.item.price)} each</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => changeQty(x.item._id,-1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200">
                    <Minus size={14} className="mx-auto"/>
                  </button>
                  <b className="min-w-5 text-center">{x.quantity}</b>
                  <button type="button" onClick={() => changeQty(x.item._id,1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200">
                    <Plus size={14} className="mx-auto"/>
                  </button>
                  <button type="button" onClick={() => removeFromCart(x.item._id)} className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50" title="Remove item">
                    <X size={15} className="mx-auto"/>
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <button
  type="button"
onClick={() => {
  setCheckoutOpen(false);
  setOrderError("");
}}
  className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-orange-500 hover:border-orange-300 transition"
  aria-label="Close table selection"
>
  <X size={20} />
</button>
                  <p className="text-sm font-extrabold">Choose your table</p>
                  <p className="text-xs text-gray-400">Live availability from the restaurant.</p>
                  
                </div>
                <Table2 size={18} className="text-orange-500"/>
              </div>

              {availableTables.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableTables.map(table => {
                    const selected = selectedTableId === table._id;
                    return (
                      <button
                        key={table._id}
                        type="button"
                        onClick={() => {
                          setSelectedTableId(table._id);
                          setTableNumber(String(table.tableNumber ?? ""));
                          setOrderError("");
                        }}
                        className={`rounded-xl border p-3 text-left transition ${
                          selected
                            ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100"
                            : "border-gray-200 bg-white hover:border-orange-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm">Table {table.tableNumber}</span>
                          {selected && <CheckCircle2 size={16} className="text-orange-500"/>}
                        </div>
                        <span className="text-[11px] text-gray-400">{table.capacity || "—"} seats</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs text-gray-500">
                  No available table right now. You can continue without assigning a table if your restaurant allows takeaway/unspecified orders.
                </div>
              )}
            </div>

            <input
              value={tableNumber}
              onChange={e => {
                setTableNumber(e.target.value);
                setSelectedTableId("");
              }}
              className="w-full h-11 border rounded-xl px-3"
              placeholder="Or enter table number manually"
            />

            {orderError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                <b>Unable to place order</b>
                <p className="mt-1">{orderError}</p>
              </div>
            )}
          </div>
          <div className="p-5 border-t">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{money(cartSubtotal)}</span></div>
              <div className="flex justify-between text-gray-500"><span>GST (5%)</span><span>{money(gstAmount)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Service charge</span><span>{serviceCharge ? money(serviceCharge) : "₹0"}</span></div>
              <div className="pt-2 mt-2 border-t flex justify-between text-lg font-extrabold"><span>Total</span><span>{money(cartTotal)}</span></div>
            </div>
            <button
              type="button"
              disabled={placing}
              onClick={placeOrder}
              className="mt-4 w-full py-3 rounded-xl bg-orange-500 text-white font-bold disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {placing ? <RefreshCw size={16} className="animate-spin"/> : <Check size={16}/>}
              {placing ? "Placing order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>}

      {selectedOrder && <div className="fixed inset-0 z-[70] bg-black/40 flex items-end sm:items-center justify-center p-3">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between"><div><h2 className="text-xl font-extrabold">Order #{orderNo(selectedOrder)}</h2><p className="text-xs text-gray-400 mt-1">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString("en-IN") : "—"}</p></div><button type="button" onClick={() => setSelectedOrder(null)}><X/></button></div>
          <div className="p-5">
            {safeStatus(selectedOrder.status) === "cancelled" ? <div className="p-4 rounded-2xl bg-red-50 text-red-600 font-bold">This order was cancelled.</div> :
            <div className="grid grid-cols-4 gap-2">{[["pending","Placed",ShoppingBag],["preparing","Preparing",Clock3],["ready","Ready",CheckCircle2],["completed","Served",Check]].map(([value,label,Icon]:any,index) => { const current=["pending","preparing","ready","completed"].indexOf(safeStatus(selectedOrder.status)); return <div key={value} className="text-center"><div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center ${index <= current ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"}`}><Icon size={17}/></div><p className="mt-2 text-[10px] sm:text-xs font-bold">{label}</p></div>; })}</div>}
            <div className="mt-6 border rounded-2xl p-4 space-y-2">{(selectedOrder.items || []).map((item,i) => <div key={i} className="flex justify-between text-sm"><span>{item.name} × {item.quantity}</span><span>{money(Number(item.price)*Number(item.quantity))}</span></div>)}<div className="pt-3 border-t flex justify-between font-extrabold"><span>Total</span><span>{money(selectedOrder.totalAmount)}</span></div></div>
            {selectedOrder.tableNumber && <p className="mt-4 text-sm text-gray-500 inline-flex items-center gap-2"><MapPin size={15}/> Table {selectedOrder.tableNumber}</p>}
          </div>
        </div>
      </div>}
    </div>
  );
};

export default CustomerDashboard;