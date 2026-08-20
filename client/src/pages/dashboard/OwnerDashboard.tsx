import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Tables from "./Tables";
import OwnerCustomers from "../owner/OwnerCustomers";
import OwnerReservations from "../owner/OwnerReservations";
import OwnerInventory from "../owner/OwnerInventory";
import OwnerAnalytics from "../owner/OwnerAnalytics";
import OwnerNotifications from "../owner/OwnerNotifications";
import OwnerSettings from "../owner/OwnerSettings";
import OwnerReports from "../owner/OwnerReports";
import OwnerEmployees from "../owner/OwnerEmployees";
import type { LucideIcon } from "lucide-react";
import { getTables } from "../../services/tableService";
import OwnerMenu from "../owner/OwnerMenu";
import {
  getNotifications,
} from "../../services/notificationService";
import {
  getTodayStats,
  getOwnerOrders,
  updateOrderStatus,
} from "../../services/orderService";
import {
  LayoutDashboard,
  ShoppingCart,
  Utensils,
  Armchair,
  CalendarDays,
  Users,
  UserRoundCog,
  Package,
  ChartNoAxesCombined,
  FileText,
  Bell,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  CircleUserRound,
  LogOut,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

type NavItem = {
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Orders", icon: ShoppingCart },
  { label: "Menu", icon: Utensils },
  { label: "Tables", icon: Armchair },
  { label: "Reservations", icon: CalendarDays },
  { label: "Customers", icon: Users },
  { label: "Employees", icon: UserRoundCog },
  { label: "Inventory", icon: Package },
  { label: "Analytics", icon: ChartNoAxesCombined },
  { label: "Reports", icon: FileText },
  { label: "Notifications", icon: Bell },
  { label: "Settings", icon: Settings },
];

function OwnerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [restaurantBrand, setRestaurantBrand] = useState<{
  name?: string;
  logo?: string;
} | null>(null);

useEffect(() => {
  try {
    const savedRestaurant =
      sessionStorage.getItem("selectedRestaurant");

    if (savedRestaurant) {
      setRestaurantBrand(
        JSON.parse(savedRestaurant)
      );
    }
  } catch (error) {
    console.error(
      "FAILED TO LOAD RESTAURANT BRAND:",
      error
    );
  }
}, []);
  const [stats, setStats] = useState({
  revenue: null as number | null,
  orders: null as number | null,
  customers: null as number | null,
});
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Overview");
  const [search, setSearch] = useState("");
  const [today, setToday] = useState(new Date());
  const [notificationCount, setNotificationCount] =
  useState(0);

const [, setNotificationLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const ownerName = user?.fullName?.trim() || "Owner";
const [tables, setTables] = useState<any[]>([]);
const occupiedTables = tables.filter(
  (table) => table.status === "occupied"
).length;
const [orders, setOrders] = useState<any[]>([]);
const [orderSearch, setOrderSearch] = useState("");
const [orderFilter, setOrderFilter] = useState("all");
  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const formattedDate = today.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    if (!search.trim()) return;

    const value = search.toLowerCase();

    const matchedItem = navItems.find((item) =>
      item.label.toLowerCase().includes(value)
    );

    if (matchedItem) {
      setActiveItem(matchedItem.label);
    }
  }, [search]);
const loadDashboardData = async () => {
  try {
    const [statsRes, tablesRes, ordersRes] =
      await Promise.all([
        getTodayStats(),
        getTables(),
        getOwnerOrders(),
      ]);

    setStats({
      revenue: statsRes.data.revenue,
      orders: statsRes.data.orders,
      customers: statsRes.data.customers,
    });

    setTables(tablesRes.data.tables || []);
    setOrders(ordersRes || []);
  } catch (error) {
    console.error(
      "FAILED TO REFRESH DASHBOARD DATA:",
      error
    );
  }
};
const loadNotificationCount = async () => {
  try {
    setNotificationLoading(true);

    const response =
      await getNotifications();

    setNotificationCount(
      response.unreadCount || 0
    );
  } catch (error) {
    console.error(
      "FAILED TO LOAD NOTIFICATION COUNT:",
      error
    );
  } finally {
    setNotificationLoading(false);
  }
};

const loadSubscription = async () => {
  try {
    setSubscriptionLoading(true);

    const token =
  sessionStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("token");

    if (!token) {
      setSubscription(null);
      return;
    }

    const response = await fetch("/api/subscriptions/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      setSubscription(null);
      return;
    }

    const data = await response.json();
    setSubscription(data.subscription || null);
  } catch (error) {
    console.error(
      "FAILED TO LOAD SUBSCRIPTION:",
      error
    );
    setSubscription(null);
  } finally {
    setSubscriptionLoading(false);
  }
};

useEffect(() => {
  loadDashboardData();
  loadNotificationCount();
  loadSubscription();
}, []);
const tableOccupancy =
  tables.length > 0
    ? Math.round((occupiedTables / tables.length) * 100)
    : null;
    const handleOrderStatus = async (
  orderId: string,
  status: string
) => {
  try {
    const updatedOrder = await updateOrderStatus(orderId, status);

    setOrders((prev) =>
      prev.map((order) =>
        order._id === orderId ? updatedOrder : order
      )
    );
  } catch (error) {
    console.error("ORDER STATUS ERROR:", error);
  }
};
  const handleNavClick = (label: string) => {
  setActiveItem(label);
  setSearch("");
  setMobileOpen(false);

  if (label === "Overview") {
    navigate("/owner/dashboard");
    return;
  }
};

const handleToday = async () => {
  setToday(new Date());

  await Promise.all([
    loadDashboardData(),
    loadNotificationCount(),
  ]);
};

 const handleLogout = () => {
  const confirmed = window.confirm(
    "Are you sure you want to logout?"
  );

  if (!confirmed) {
    return;
  }

  const restaurantSlug =
    sessionStorage.getItem("restaurantSlug") ||
    (() => {
      try {
        const savedRestaurant =
          sessionStorage.getItem("selectedRestaurant");

        return savedRestaurant
          ? JSON.parse(savedRestaurant)?.slug || ""
          : "";
      } catch {
        return "";
      }
    })();

  logout();

  navigate(
    restaurantSlug
      ? `/r/${restaurantSlug}/login`
      : "/login",
    { replace: true }
  );
};

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#172033]">

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen
          bg-[#191919] text-white
          flex flex-col
          transition-all duration-300 ease-in-out

          ${collapsed ? "lg:w-[82px]" : "lg:w-[260px]"}
          w-[260px]

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >

        {/* SIDEBAR HEADER */}
        <div className="h-[76px] px-5 border-b border-white/10 flex items-center">

          <div className="flex items-center gap-3 min-w-0 flex-1">
<div className="w-10 h-10 shrink-0 rounded-xl bg-orange-500 flex items-center justify-center overflow-hidden">
  {restaurantBrand?.logo ? (
    <img
      src={restaurantBrand.logo}
      alt={restaurantBrand.name || "Restaurant"}
      className="w-full h-full object-contain bg-white"
    />
  ) : (
    <Utensils size={21} />
  )}
</div>

{!collapsed && (
  <div className="min-w-0">
    <h1 className="text-lg font-bold whitespace-nowrap truncate">
      {restaurantBrand?.name || (
        <>
          Restro
          <span className="text-orange-500">
            Sphere
          </span>
        </>
      )}
    </h1>

    <p className="text-[11px] text-white/50 whitespace-nowrap">
      Owner Dashboard
    </p>
  </div>
)}

          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-white/70 hover:text-white"
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>

        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">

          {!collapsed && (
            <p className="px-3 mb-3 text-[10px] uppercase tracking-[0.18em] text-white/35">
              Restaurant Management
            </p>
          )}

          <div className="space-y-1">

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.label;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavClick(item.label)}
                  title={collapsed ? item.label : undefined}
                  className={`
                    w-full
                    flex items-center
                    rounded-xl
                    py-3
                    transition-all duration-200

                    ${
                      collapsed
                        ? "justify-center px-2"
                        : "gap-3 px-3"
                    }

                    ${
                      isActive
                        ? "bg-orange-500 text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <Icon size={20} className="shrink-0" />

                  {!collapsed && (
                    <span className="text-sm font-medium">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}

          </div>
        </nav>

        {/* LOGOUT */}
        <div className="border-t border-white/10 p-3">

          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            className={`
              w-full
              flex items-center
              rounded-xl
              py-3
              text-white/70
              hover:bg-white/5
              hover:text-white
              transition

              ${
                collapsed
                  ? "justify-center px-2"
                  : "gap-3 px-3"
              }
            `}
          >
            <LogOut size={20} />

            {!collapsed && (
              <span className="text-sm font-medium">
                Logout
              </span>
            )}
          </button>

        </div>

      </aside>

      {/* MAIN AREA */}
      <div
        className={`
          min-h-screen
          transition-all duration-300
          ${collapsed ? "lg:pl-[82px]" : "lg:pl-[260px]"}
        `}
      >

        {/* TOP HEADER */}
        <header className="
          h-[76px]
          bg-white
          border-b border-gray-200
          flex items-center
          justify-between
          gap-4
          px-4 sm:px-6 lg:px-9
        ">

          <div className="flex items-center gap-3 flex-1">

            {/* MOBILE MENU */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="
                lg:hidden
                w-10 h-10
                rounded-xl
                border border-gray-200
                flex items-center justify-center
              "
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            {/* COLLAPSE */}
            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              className="
                hidden lg:flex
                w-11 h-11
                rounded-xl
                border border-gray-200
                items-center justify-center
                hover:bg-gray-50
                transition
              "
              aria-label="Toggle sidebar"
            >
              {collapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </button>

            {/* SEARCH */}
            <div className="
              relative
              w-full
              max-w-[410px]
            ">

              <Search
                size={19}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="
                  w-full
                  h-11
                  pl-11
                  pr-4
                  rounded-xl
                  border border-gray-200
                  bg-gray-50
                  text-sm
                  outline-none
                  focus:border-orange-400
                  focus:ring-2
                  focus:ring-orange-100
                  transition
                "
              />

              {/* SEARCH RESULT */}
              {search.trim() && (
                <div className="
                  absolute
                  top-14
                  left-0
                  right-0
                  z-30
                  bg-white
                  border border-gray-200
                  rounded-xl
                  shadow-lg
                  p-2
                ">

                  {navItems
                    .filter((item) =>
                      item.label
                        .toLowerCase()
                        .includes(search.toLowerCase())
                    )
                    .map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => handleNavClick(item.label)}
                          className="
                            w-full
                            flex items-center
                            gap-3
                            px-3 py-2.5
                            rounded-lg
                            text-left
                            text-sm
                            hover:bg-orange-50
                            hover:text-orange-600
                            transition
                          "
                        >
                          <Icon size={18} />
                          {item.label}
                        </button>
                      );
                    })}

                  {navItems.filter((item) =>
                    item.label
                      .toLowerCase()
                      .includes(search.toLowerCase())
                  ).length === 0 && (
                    <p className="px-3 py-2.5 text-sm text-gray-500">
                      No section found
                    </p>
                  )}

                </div>
              )}

            </div>

          </div>

          {/* RIGHT HEADER */}
          <div className="flex items-center gap-4">

            {/* REFRESH */}
            <button
              type="button"
              onClick={handleToday}
              className="
                hidden sm:flex
                w-10 h-10
                rounded-xl
                border border-gray-200
                items-center justify-center
                text-gray-600
                hover:text-orange-500
                hover:border-orange-200
                transition
              "
              title="Refresh today's data"
            >
              <RefreshCw size={18} />
            </button>

            {/* NOTIFICATION */}
            <button
              type="button"
              onClick={() => handleNavClick("Notifications")}
              className="
                relative
                w-10 h-10
                rounded-xl
                flex items-center justify-center
                text-gray-700
                hover:bg-gray-50
              "
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={21} />

        {notificationCount > 0 && (
  <span
    className="
      absolute
      -top-1
      -right-1
      min-w-5
      h-5
      px-1
      rounded-full
      bg-red-500
      text-white
      border-2
      border-white
      text-[10px]
      font-bold
      flex
      items-center
      justify-center
      leading-none
    "
  >
    {notificationCount > 99
      ? "99+"
      : notificationCount}
  </span>
)}
            </button>

            {/* PROFILE */}
            <div className="
              hidden sm:flex
              items-center
              gap-3
              pl-3
              border-l border-gray-200
            ">

              <div className="
                w-9 h-9
                rounded-full
                bg-orange-100
                text-orange-600
                flex items-center justify-center
              ">
                <CircleUserRound size={20} />
              </div>

              <div className="hidden md:block">

                <p className="text-sm font-semibold">
                  {ownerName}
                </p>

                <p className="text-xs text-gray-500">
                  Owner
                </p>

              </div>

            </div>

          </div>

        </header>
{/* PAGE CONTENT */}
<main
  className={
    activeItem === "Menu" ||
    activeItem === "Tables" ||
    activeItem === "Orders" ||
     activeItem === "Reservations" ||
    activeItem === "Customers"
      ? "w-full p-0"
      : "w-full p-4 sm:p-6 lg:p-8"
  }
>

  {activeItem === "Menu" ? (
    <OwnerMenu />
    
  ) : (
    <div className="w-full p-4 sm:p-6 lg:p-8">
{activeItem === "Overview" && (
  <>
      {/* PAGE HEADING */}
      <div className="
        flex flex-col
        sm:flex-row
        sm:items-center
        sm:justify-between
        gap-4
        mb-7
      ">

        <div>
          <p className="
            text-xs
            uppercase
            tracking-[0.16em]
            text-orange-500
            font-semibold
          ">
            Restaurant Overview
          </p>

          <h1 className="
            mt-1
            text-2xl
            sm:text-3xl
            font-bold
            text-[#172033]
          ">
            {greeting}, {ownerName}
          </h1>

          <p className="
            mt-1
            text-sm
            sm:text-base
            text-gray-500
          ">
            Here is what is happening with your restaurant today.
          </p>
        </div>

        <button
          type="button"
          onClick={handleToday}
          className="
            w-full sm:w-auto
            px-5 py-2.5
            rounded-xl
            bg-orange-500
            text-white
            text-sm
            font-semibold
            hover:bg-orange-600
            transition
          "
        >
          Today
        </button>

      </div>

      {/* CURRENT DATE */}
      <div className="mb-5 text-xs text-gray-400">
        Showing data for {formattedDate}
      </div>

      {/* STAT CARDS */}
      <section className="
        grid
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-4
        gap-4
      ">

            {/* REVENUE */}
            <div className="
              bg-white
              border border-gray-200
              rounded-2xl
              p-5
              shadow-sm
            ">
              <p className="text-sm text-gray-500">
                Today's Revenue
              </p>

              <h2 className="mt-2 text-2xl font-bold">
  {stats.revenue === null
    ? "—"
    : `₹${stats.revenue.toLocaleString("en-IN")}`}
</h2>

<p className="mt-3 text-xs text-gray-400">
  {stats.revenue === null
    ? "Loading live data..."
    : "Today's confirmed revenue"}
</p>

             
            </div>
{/* ORDERS */}
<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <p className="text-sm text-slate-500">
    Orders Today
  </p>

  <h2 className="mt-2 text-2xl font-bold">
    {stats.orders === null ? "—" : stats.orders}
  </h2>

  <p className="mt-3 text-xs text-gray-400">
    {stats.orders === null
      ? "Loading live data..."
      : "Orders received today"}
  </p>
</div>

            {/* CUSTOMERS */}
            <div className="
              bg-white
              border border-gray-200
              rounded-2xl
              p-5
              shadow-sm
            ">
              <p className="text-sm text-gray-500">
                Customers Today
              </p>
<h2 className="mt-2 text-2xl font-bold">
  {stats.customers === null ? "—" : stats.customers}
</h2>

<p className="mt-3 text-xs text-gray-400">
  {stats.customers === null
    ? "Loading live data..."
    : "Unique customers today"}
</p>

             
            </div>

            {/* TABLE OCCUPANCY */}
            <div className="
              bg-white
              border border-gray-200
              rounded-2xl
              p-5
              shadow-sm
            ">
              <p className="text-sm text-gray-500">
                Table Occupancy
              </p>

           <h2 className="mt-2 text-2xl font-bold">
  {tableOccupancy === null
    ? "—"
    : `${tableOccupancy}%`}
</h2>
<p className="mt-3 text-xs text-gray-400">
  {tables.length === 0
    ? "No tables added yet"
    : `${occupiedTables} of ${tables.length} tables occupied`}
</p>

             
            </div>

          </section>

      {/* SUBSCRIPTION */}
      <section className="mt-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-orange-500 font-semibold">
                Subscription
              </p>

              {subscriptionLoading ? (
                <>
                  <h2 className="mt-2 text-xl font-bold">
                    Loading subscription...
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Checking your current plan.
                  </p>
                </>
              ) : subscription?.status === "active" ? (
                <>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold">
                      {subscription.plan === "quarterly"
                        ? "3 Months"
                        : subscription.plan === "yearly"
                        ? "Yearly"
                        : "Monthly"}{" "}
                      Plan
                    </h2>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                      Active
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    Valid until{" "}
                    {subscription.endDate
                      ? new Date(subscription.endDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="mt-2 text-xl font-bold">
                    No Active Subscription
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a plan to activate your restaurant website.
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {subscription?.status === "active" &&
  (subscription?.restaurant?.slug ||
    subscription?.restaurantSlug) && (
                  <button
                    type="button"
                    onClick={() => {
                      const slug =
                        subscription?.restaurant?.slug ||
                        subscription?.restaurantSlug;

                      if (slug) {
                        window.open(
                          `${window.location.origin}/r/${slug}`,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      } else {
                        navigate("/subscription");
                      }
                    }}
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold hover:border-orange-300 hover:text-orange-600 transition"
                  >
                    Open Restaurant
                  </button>
                )}

              <button
                type="button"
                onClick={() => navigate("/subscription")}
                className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition"
              >
                {subscription?.status === "active"
                  ? "Manage Subscription"
                  : "Buy Subscription"}
              </button>
            </div>
          </div>
        </div>
      </section>
  </>
)}
         {/* MAIN CONTENT */}
<section className="mt-6">

{activeItem === "Orders" ? (
<div className="w-full min-h-screen bg-[#f7f7f8] p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

        <div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Restaurant Orders
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage and update your restaurant orders.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">

          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Search customer..."
              className="w-full sm:w-64 pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-orange-400"
            />
          </div>

          <select
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

        </div>
      </div>

      {orders
        .filter((order) => {
          const searchValue = orderSearch.trim().toLowerCase();

          const matchesSearch =
            !searchValue ||
            (order.customerName || "Guest")
              .toLowerCase()
              .includes(searchValue);

          const matchesFilter =
            orderFilter === "all" ||
            order.status === orderFilter;

          return matchesSearch && matchesFilter;
        })
        .length === 0 ? (

        <div className="py-16 text-center">
          <ShoppingCart
            size={38}
            className="mx-auto mb-3 text-gray-300"
          />

          <h3 className="font-semibold text-gray-700">
            No orders found
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            Orders will appear here when customers place them.
          </p>
        </div>

      ) : (

        <div className="space-y-4">

          {orders
            .filter((order) => {
              const searchValue = orderSearch.trim().toLowerCase();

              const matchesSearch =
                !searchValue ||
                (order.customerName || "Guest")
                  .toLowerCase()
                  .includes(searchValue);

              const matchesFilter =
                orderFilter === "all" ||
                order.status === orderFilter;

              return matchesSearch && matchesFilter;
            })
            .map((order) => (

              <div
                key={order._id}
                className="border border-gray-200 rounded-xl p-4 sm:p-5"
              >

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                  <div>
                    <p className="font-semibold">
                      {order.customerName || "Guest"}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Order #{order._id?.slice(-6)}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      {order.items?.map((item: any) =>
                        `${item.name} × ${item.quantity}`
                      ).join(", ")}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                    <p className="font-bold">
                      ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                    </p>

                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleOrderStatus(order._id, e.target.value)
                      }
                      className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                  </div>

                </div>

              </div>

            ))}

        </div>

      )}

    </div>

 
) : activeItem === "Menu" ? (

  <OwnerMenu />
  
  ) : activeItem === "Tables" ? (

  <Tables />
  ) : activeItem === "Reservations" ? (

  <OwnerReservations />

  ) : activeItem === "Customers" ? (

  <OwnerCustomers />

  ) : activeItem === "Inventory" ? (

  <OwnerInventory />

  ) : activeItem === "Employees" ? (

  <OwnerEmployees />
  ) : activeItem === "Reports" ? (

  <OwnerReports />

  ) : activeItem === "Settings" ? (

  <OwnerSettings />
  
) : activeItem === "Notifications" ? (

  <OwnerNotifications />

  



  ) : activeItem === "Analytics" ? (

  <OwnerAnalytics />

) : activeItem === "Overview" ? (

  <div className="hidden" />
) : (

  <section
    className="
      min-h-[350px]
      w-full
      bg-white
      border border-gray-200
      rounded-2xl
      flex
      items-center
      justify-center
      p-6
    "
  >
    
    <div className="text-center max-w-md">

      <LayoutDashboard
        size={38}
        className="mx-auto mb-4 text-orange-500"
      />

      <h2 className="text-xl font-bold">
        {activeItem === "Overview"
          ? "Owner Dashboard"
          : activeItem}
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {activeItem === "Overview"
          ? "Your live restaurant data, orders, customers, revenue and analytics will appear here."
          : `${activeItem} module will be connected to real restaurant data next.`}
      </p>
   </div>

                  </section>

                )}

              </section>

            </div>

          )}

        </main>

      </div>

    </div>
  );
}


export default OwnerDashboard;