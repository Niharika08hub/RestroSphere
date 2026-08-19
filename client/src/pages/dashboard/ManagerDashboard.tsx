import React, { useEffect, useState } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Table2,
  Users,
  CalendarDays,
  BarChart3,
  AlertTriangle,
  ChefHat,
  CheckCircle2,
  X,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate, useParams } from "react-router-dom";
// =====================================
// TYPES
// =====================================

type Order = {
  _id: string;
  orderNumber?: string;
  status?: string;
  totalAmount?: number;
  createdAt?: string;
  tableNumber?: string | number;
  customerName?: string;
};

type DashboardData = {
  orders: {
    pending: number;
    preparing: number;
    ready: number;
    today: Order[];
  };

  reservations: {
    today: number;
  };

  tables: {
    total: number;
    occupied: number;
    available: number;
  };

  inventory: {
    lowStock: any[];
    outOfStock: any[];
    lowStockCount: number;
    outOfStockCount: number;
  };
};

type ManagerOrder = {
  _id: string;

  customerName: string;

  items: {
    name: string;
    price: number;
    quantity: number;
  }[];

  totalAmount: number;

  status:
    | "pending"
    | "preparing"
    | "ready"
    | "completed"
    | "cancelled";

  paymentStatus:
    | "pending"
    | "paid"
    | "failed";

  createdAt: string;
};

type ManagerReservation = {
  _id: string;

  customerId?: {
    _id?: string;
    name?: string;
    fullName?: string;
    email?: string;
  };

  tableId?: {
    _id?: string;
    tableNumber?: string | number;
    capacity?: number;
  };

  reservationDate: string;

  time: string;

  guests: number;

  notes?: string;

  status:
    | "pending"
    | "confirmed"
    | "cancelled"
    | "completed";

  createdAt?: string;
};

type ManagerNotification = {
  id: string;
  title: string;
  message: string;
  type: "order" | "reservation" | "inventory" | "table" | "menu" | "payment";
  time?: string;
};
// =====================================
// COMPONENT
// =====================================

const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { slug: restaurantSlug } = useParams();

  const [restaurantBrand, setRestaurantBrand] = useState({
    name: "RestroSphere",
    logo: "",
  });
 useEffect(() => {
  const loadRestaurantBrand = async () => {
    try {
      // 1. Already selected restaurant
      const savedRestaurant =
        sessionStorage.getItem("selectedRestaurant");

      if (savedRestaurant) {
        const restaurant =
          JSON.parse(savedRestaurant);

        setRestaurantBrand({
          name:
            restaurant?.name ||
            "RestroSphere",
          logo:
            restaurant?.logo || "",
        });

        if (
          restaurant?._id ||
          restaurant?.id
        ) {
          sessionStorage.setItem(
            "restaurantId",
            restaurant._id ||
              restaurant.id
          );
        }

        return;
      }

      // 2. Load restaurant from URL
      if (!restaurantSlug) return;

      const response = await fetch(
        `/api/restaurants/public/${restaurantSlug}`
      );

      const result = await response.json();

      if (
        !response.ok ||
        !result?.success ||
        !result?.data
      ) {
        console.error(
          "MANAGER RESTAURANT LOAD ERROR:",
          result?.message
        );
        return;
      }

      const restaurant = result.data;

      setRestaurantBrand({
        name:
          restaurant.name ||
          "RestroSphere",
        logo:
          restaurant.logo || "",
      });

      sessionStorage.setItem(
        "selectedRestaurant",
        JSON.stringify(restaurant)
      );

      if (
        restaurant?._id ||
        restaurant?.id
      ) {
        sessionStorage.setItem(
          "restaurantId",
          restaurant._id ||
            restaurant.id
        );
      }

      if (restaurant?.slug) {
        sessionStorage.setItem(
          "restaurantSlug",
          restaurant.slug
        );
      }
    } catch (error) {
      console.error(
        "MANAGER RESTAURANT BRAND ERROR:",
        error
      );
    }
  };

  loadRestaurantBrand();
}, [restaurantSlug]);
  // =====================================
  // DASHBOARD STATE
  // =====================================

  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [mobileMenu, setMobileMenu] =
    useState(false);

const [collapsed, setCollapsed] =
  useState(false);
  
  const [activePage, setActivePage] =
    useState("Dashboard");

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  // =====================================
  // ORDERS STATE
  // =====================================

  const [managerOrders, setManagerOrders] =
    useState<ManagerOrder[]>([]);

  const [ordersLoading, setOrdersLoading] =
    useState(false);

  const [orderFilter, setOrderFilter] =
    useState("all");

  const [updatingOrderId, setUpdatingOrderId] =
    useState<string | null>(null);

    const [managerTables, setManagerTables] =
  useState<any[]>([]);

const [tablesLoading, setTablesLoading] =
  useState(false);

const [updatingTableId, setUpdatingTableId] =
  useState<string | null>(null);

  const [managerReservations, setManagerReservations] =
  useState<ManagerReservation[]>([]);

  const [managerMenu, setManagerMenu] =
  useState<any[]>([]);

const [menuLoading, setMenuLoading] =
  useState(false);

const [menuCategory, setMenuCategory] =
  useState("all");

const [updatingMenuId, setUpdatingMenuId] =
  useState<string | null>(null);

  const [managerInventory, setManagerInventory] =
  useState<any[]>([]);

const [inventoryLoading, setInventoryLoading] =
  useState(false);

const [inventoryCategory, setInventoryCategory] =
  useState("all");

const [updatingInventoryId, setUpdatingInventoryId] =
  useState<string | null>(null);

  const [managerCustomers, setManagerCustomers] =
  useState<any[]>([]);

const [customersLoading, setCustomersLoading] =
  useState(false);

  const [managerStaff, setManagerStaff] =
  useState<any[]>([]);

const [staffLoading, setStaffLoading] =
  useState(false);

const [staffRoleFilter, setStaffRoleFilter] =
  useState("all");

  const [managerReport, setManagerReport] =
  useState<any>(null);

const [reportLoading, setReportLoading] =
  useState(false);

const [reportRange, setReportRange] =
  useState("7d");

const [reservationsLoading, setReservationsLoading] =
  useState(false);

const [updatingReservationId, setUpdatingReservationId] =
  useState<string | null>(null);

const [reservationFilter, setReservationFilter] =
  useState("all");

  const [readNotificationIds, setReadNotificationIds] =
    useState<string[]>([]);

  // =====================================
  // TOKEN
  // =====================================

  const getToken = () => {
    return (
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  };

  // =====================================
  // FETCH MANAGER DASHBOARD
  // =====================================

  const fetchDashboard = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      const response = await fetch(
        "/api/manager/dashboard",
        {
          method: "GET",

          headers: {
            "Content-Type": "application/json",

            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      const text =
        await response.text();

      let result: any = {};

      try {
        result = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "Invalid response received from server."
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to fetch manager dashboard."
        );
      }

      setData(result.data);
    } catch (err: any) {
      console.error(
        "MANAGER DASHBOARD ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchManagerReport = async (
  range = reportRange
) => {
  try {
    setReportLoading(true);

    const token = getToken();

    const response = await fetch(
      `/api/reports?range=${range}`,
      {
        method: "GET",
        headers: {
          "Content-Type":
            "application/json",

          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),
        },
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result?.message ||
          "Unable to fetch reports."
      );
    }

    setManagerReport(
      result.data
    );
  } catch (error) {
    console.error(
      "MANAGER REPORT ERROR:",
      error
    );
  } finally {
    setReportLoading(false);
  }
};
const changeReportRange = (range: string) => {
  setReportRange(range);
  fetchManagerReport(range);
};
  // =====================================
  // FETCH MANAGER ORDERS
  // =====================================

  const fetchManagerOrders = async () => {
    try {
      setOrdersLoading(true);

      const token = getToken();

      const response = await fetch(
        "/api/manager/orders",
        {
          method: "GET",

          headers: {
            "Content-Type": "application/json",

            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to fetch orders."
        );
      }

      setManagerOrders(
        result.data || []
      );
    } catch (error) {
      console.error(
        "MANAGER ORDERS ERROR:",
        error
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchManagerTables = async () => {
  try {
    setTablesLoading(true);

    const token = getToken();

    const response = await fetch(
      "/api/tables",
      {
        method: "GET",

        headers: {
          "Content-Type":
            "application/json",

          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result?.message ||
          "Unable to fetch tables."
      );
    }

    setManagerTables(
      result.tables || []
    );
  } catch (error) {
    console.error(
      "MANAGER TABLES ERROR:",
      error
    );
  } finally {
    setTablesLoading(false);
  }
};

const fetchManagerReservations = async () => {
  try {
    setReservationsLoading(true);

    const token = getToken();

    const response = await fetch(
      "/api/reservations",
      {
        method: "GET",

        headers: {
          "Content-Type":
            "application/json",

          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result?.message ||
          "Unable to fetch reservations."
      );
    }

    setManagerReservations(
      result.reservations || []
    );
  } catch (error) {
    console.error(
      "MANAGER RESERVATIONS ERROR:",
      error
    );
  } finally {
    setReservationsLoading(false);
  }
};

const fetchManagerMenu = async () => {
  try {
    setMenuLoading(true);

    const token = getToken();

    const response = await fetch(
      "/api/menu",
      {
        method: "GET",

        headers: {
          "Content-Type":
            "application/json",

          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result?.message ||
          "Unable to fetch menu."
      );
    }

    setManagerMenu(
      result.data || []
    );
  } catch (error) {
    console.error(
      "MANAGER MENU ERROR:",
      error
    );
  } finally {
    setMenuLoading(false);
  }
};

const fetchManagerInventory = async () => {
  try {
    setInventoryLoading(true);

    const token = getToken();

    const response = await fetch(
      "/api/inventory",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.message ||
          "Unable to fetch inventory."
      );
    }

    setManagerInventory(
      result.data || []
    );
  } catch (error) {
    console.error(
      "MANAGER INVENTORY ERROR:",
      error
    );
  } finally {
    setInventoryLoading(false);
  }
};

const fetchManagerStaff = async () => {
  try {
    setStaffLoading(true);

    const token = getToken();

    const response = await fetch(
      "/api/employees",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.message ||
          "Unable to fetch staff."
      );
    }

    setManagerStaff(
      result.data || []
    );
  } catch (error) {
    console.error(
      "MANAGER STAFF ERROR:",
      error
    );
  } finally {
    setStaffLoading(false);
  }
};

const fetchManagerCustomers = async () => {
  try {
    setCustomersLoading(true);

    const token = getToken();

    const response = await fetch(
      "/api/customers",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.message ||
          "Unable to fetch customers."
      );
    }

    setManagerCustomers(
      result.customers || []
    );
  } catch (error) {
    console.error(
      "MANAGER CUSTOMERS ERROR:",
      error
    );
  } finally {
    setCustomersLoading(false);
  }
};

const updateManagerInventory =
  async (
    itemId: string,
    quantity: number
  ) => {
    if (quantity < 0) {
      alert(
        "Quantity cannot be negative."
      );
      return;
    }

    try {
      setUpdatingInventoryId(
        itemId
      );

      const token = getToken();

      const response =
        await fetch(
          `/api/inventory/${itemId}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },

            body: JSON.stringify({
              quantity,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to update inventory."
        );
      }

      setManagerInventory(
        (previous) =>
          previous.map(
            (item) =>
              item._id === itemId
                ? result.data
                : item
          )
      );
    } catch (error) {
      console.error(
        "UPDATE INVENTORY ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to update inventory."
      );
    } finally {
      setUpdatingInventoryId(
        null
      );
    }
  };

const updateManagerMenuItem =
  async (
    itemId: string,
    isAvailable: boolean
  ) => {
    try {
      setUpdatingMenuId(itemId);

      const token = getToken();

      const response =
        await fetch(
          `/api/menu/${itemId}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },

            body: JSON.stringify({
              isAvailable,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to update menu item."
        );
      }

      setManagerMenu(
        (previous) =>
          previous.map(
            (item) =>
              item._id === itemId
                ? result.data
                : item
          )
      );
    } catch (error) {
      console.error(
        "UPDATE MENU ITEM ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to update menu item."
      );
    } finally {
      setUpdatingMenuId(
        null
      );
    }
  };

const updateManagerReservationStatus =
  async (
    reservationId: string,
    status:
      | "pending"
      | "confirmed"
      | "cancelled"
      | "completed"
  ) => {
    try {
      setUpdatingReservationId(
        reservationId
      );

      const token = getToken();

      const response =
        await fetch(
          `/api/reservations/${reservationId}/status`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },

            body: JSON.stringify({
              status,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to update reservation."
        );
      }

      setManagerReservations(
        (previous) =>
          previous.map(
            (reservation) =>
              reservation._id ===
              reservationId
                ? result.reservation
                : reservation
          )
      );

      // Refresh dashboard counts + table status
      await fetchDashboard(
        true
      );
    } catch (error) {
      console.error(
        "UPDATE RESERVATION ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to update reservation."
      );
    } finally {
      setUpdatingReservationId(
        null
      );
    }
  };

const updateManagerTableStatus =
  async (
    tableId: string,
    status:
      | "available"
      | "occupied"
      | "reserved"
  ) => {
    try {
      setUpdatingTableId(
        tableId
      );

      const token = getToken();

      const response =
        await fetch(
          `/api/tables/${tableId}/status`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },

            body: JSON.stringify({
              status,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Unable to update table."
        );
      }

      setManagerTables(
        (previous) =>
          previous.map(
            (table) =>
              table._id ===
              tableId
                ? result.table
                : table
          )
      );

      await fetchDashboard(
        true
      );
    } catch (error) {
      console.error(
        "UPDATE TABLE ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to update table."
      );
    } finally {
      setUpdatingTableId(
        null
      );
    }
  };
  // =====================================
  // UPDATE ORDER STATUS
  // =====================================

  const updateManagerOrderStatus =
    async (
      orderId: string,
      status: ManagerOrder["status"]
    ) => {
      try {
        setUpdatingOrderId(orderId);

        const token = getToken();

        const response = await fetch(
          `/api/manager/orders/${orderId}/status`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },

            body: JSON.stringify({
              status,
            }),
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to update order."
          );
        }

        setManagerOrders(
          (previous) =>
            previous.map((order) =>
              order._id === orderId
                ? result.data
                : order
            )
        );

        await fetchDashboard(true);
      } catch (error) {
        console.error(
          "UPDATE MANAGER ORDER ERROR:",
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

  // =====================================
  // LOAD ALL DATA USED BY NOTIFICATIONS
  // =====================================

  const refreshNotificationData = async () => {
    await Promise.all([
      fetchDashboard(true),
      fetchManagerOrders(),
      fetchManagerReservations(),
      fetchManagerTables(),
      fetchManagerMenu(),
      fetchManagerInventory(),
      fetchManagerCustomers(),
      fetchManagerStaff(),
    ]);
  };

  // =====================================
  // INITIAL DASHBOARD LOAD
  // =====================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =====================================
  // LOAD ORDERS WHEN ORDERS SECTION OPENS
  // =====================================

useEffect(() => {
  if (activePage === "Orders") {
    fetchManagerOrders();
  }

  if (activePage === "Tables") {
    fetchManagerTables();
  }

  if (activePage === "Reservations") {
    fetchManagerReservations();
  }

  if (activePage === "Menu") {
    fetchManagerMenu();
  }
  if (activePage === "Inventory") {
  fetchManagerInventory();
}
 if (activePage === "Customers") {
    fetchManagerCustomers();
  }

  if (activePage === "Staff") {
  fetchManagerStaff();
}

if (activePage === "Reports") {
  fetchManagerReport();
}

if (activePage === "Notifications") {
  refreshNotificationData();
}
}, [activePage]);
  // =====================================
  // LOGOUT
  // =====================================

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) {
      return;
    }

    sessionStorage.removeItem("token");
    localStorage.removeItem(
      "accessToken"
    );
    sessionStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================
  // SAME-PAGE NAVIGATION
  // =====================================

  const handleNavigation = (
    item: string
  ) => {
    setActivePage(item);
    setMobileMenu(false);

    // Reset search when changing section
    setSearch("");

    if (item !== "Orders") {
      setOrderFilter("all");
    }
  };

  // =====================================
  // STATUS LABEL
  // =====================================

  const statusLabel = (
    status?: string
  ) => {
    if (!status) {
      return "Unknown";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  // =====================================
  // TIME FORMAT
  // =====================================

  const formatTime = (
    date?: string
  ) => {
    if (!date) {
      return "--";
    }

    return new Date(
      date
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================
  // SIDEBAR
  // =====================================

  const sidebarItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },

    {
      name: "Orders",
      icon: ShoppingBag,
    },

    {
      name: "Tables",
      icon: Table2,
    },

    {
      name: "Reservations",
      icon: CalendarDays,
    },

    {
      name: "Menu",
      icon: ChefHat,
    },

    {
      name: "Inventory",
      icon: Package,
    },

    {
      name: "Customers",
      icon: Users,
    },

    {
      name: "Staff",
      icon: Users,
    },

    {
      name: "Reports",
      icon: Clock3,
    },

    {
      name: "Notifications",
      icon: Bell,
    },
  ];

  // =====================================
  // FILTER DASHBOARD ORDERS
  // =====================================

  const filteredDashboardOrders =
    data?.orders.today.filter(
      (order) => {
        if (!search.trim()) {
          return true;
        }

        const value =
          `${order.orderNumber || ""} ${
            order.customerName || ""
          } ${
            order.tableNumber || ""
          }`.toLowerCase();

        return value.includes(
          search.toLowerCase()
        );
      }
    ) || [];

  // =====================================
  // FILTER MANAGER ORDERS
  // =====================================

  const filteredManagerOrders =
    managerOrders
      .filter((order) => {
        if (orderFilter === "all") {
          return true;
        }

        return (
          order.status ===
          orderFilter
        );
      })
      .filter((order) => {
        if (!search.trim()) {
          return true;
        }

        const value =
          `${order.customerName} ${
            order._id
          } ${
            order.paymentStatus
          }`.toLowerCase();

        return value.includes(
          search.toLowerCase()
        );
      });

      const filteredManagerReservations =
  managerReservations.filter(
    (reservation) => {
      if (
        reservationFilter ===
        "all"
      ) {
        return true;
      }

      return (
        reservation.status ===
        reservationFilter
      );
    }
  );
  const menuCategories = [
  ...new Set(
    managerMenu
      .map(
        (item) => item.category
      )
      .filter(Boolean)
  ),
];

const filteredManagerMenu =
  managerMenu
    .filter((item) => {
      if (
        menuCategory ===
        "all"
      ) {
        return true;
      }

      return (
        item.category ===
        menuCategory
      );
    })
    .filter((item) => {
      if (!search.trim()) {
        return true;
      }

      const value =
        `${item.name || ""} ${
          item.category || ""
        } ${
          item.description || ""
        }`.toLowerCase();

      return value.includes(
        search.toLowerCase()
      );
    });

    const inventoryCategories = [
  ...new Set(
    managerInventory
      .map(
        (item) => item.category
      )
      .filter(Boolean)
  ),
];

const filteredManagerInventory =
  managerInventory
    .filter((item) => {
      if (
        inventoryCategory ===
        "all"
      ) {
        return true;
      }

      return (
        item.category ===
        inventoryCategory
      );
    })
    .filter((item) => {
      if (!search.trim()) {
        return true;
      }

      const value =
        `${item.itemName || ""} ${
          item.category || ""
        } ${
          item.supplier || ""
        }`.toLowerCase();

      return value.includes(
        search.toLowerCase()
      );
    });

    const filteredManagerCustomers =
  managerCustomers.filter(
    (customer) => {
      if (!search.trim()) {
        return true;
      }

      const value =
        `${customer.fullName || ""} ${
          customer.email || ""
        } ${
          customer.phone || ""
        }`.toLowerCase();

      return value.includes(
        search.toLowerCase()
      );
    }
  );

  const filteredManagerStaff =
  managerStaff
    .filter((staff) => {
      if (
        staffRoleFilter === "all"
      ) {
        return true;
      }

      return (
        staff.role ===
        staffRoleFilter
      );
    })
    .filter((staff) => {
      if (!search.trim()) {
        return true;
      }

      const value =
        `${staff.fullName || ""} ${
          staff.email || ""
        } ${
          staff.phone || ""
        } ${
          staff.role || ""
        }`.toLowerCase();

      return value.includes(
        search.toLowerCase()
      );
    });
  // =====================================
  // NOTIFICATIONS
  // =====================================

  const notificationItems: ManagerNotification[] = [];

  const addNotification = (
    notification: ManagerNotification
  ) => {
    notificationItems.push(notification);
  };

  // Orders
  managerOrders.forEach((order) => {
    const orderNumber = order._id
      .slice(-6)
      .toUpperCase();

    if (order.status === "pending") {
      addNotification({
        id: `order-pending-${order._id}`,
        title: "New order pending",
        message: `Order #${orderNumber} from ${order.customerName || "Guest"} is waiting for action.`,
        type: "order",
        time: order.createdAt,
      });
    }

    if (order.status === "preparing") {
      addNotification({
        id: `order-preparing-${order._id}`,
        title: "Order is being prepared",
        message: `Order #${orderNumber} is currently in the kitchen.`,
        type: "order",
        time: order.createdAt,
      });
    }

    if (order.status === "ready") {
      addNotification({
        id: `order-ready-${order._id}`,
        title: "Order ready",
        message: `Order #${orderNumber} is ready to be served.`,
        type: "order",
        time: order.createdAt,
      });
    }

    if (order.status === "completed") {
      addNotification({
        id: `order-completed-${order._id}`,
        title: "Order completed",
        message: `Order #${orderNumber} has been completed successfully.`,
        type: "order",
        time: order.createdAt,
      });
    }

    if (order.status === "cancelled") {
      addNotification({
        id: `order-cancelled-${order._id}`,
        title: "Order cancelled",
        message: `Order #${orderNumber} has been cancelled.`,
        type: "order",
        time: order.createdAt,
      });
    }

    if (order.paymentStatus === "failed") {
      addNotification({
        id: `payment-failed-${order._id}`,
        title: "Payment failed",
        message: `Payment failed for order #${orderNumber}.`,
        type: "payment",
        time: order.createdAt,
      });
    }
  });

  // Reservations
  managerReservations.forEach((reservation) => {
    const reservationNumber = reservation._id
      .slice(-6)
      .toUpperCase();

    const customerName =
      reservation.customerId?.name ||
      reservation.customerId?.fullName ||
      "Guest";

    if (reservation.status === "pending") {
      addNotification({
        id: `reservation-pending-${reservation._id}`,
        title: "Reservation needs confirmation",
        message: `${customerName} has a pending reservation for ${reservation.time}.`,
        type: "reservation",
        time: reservation.createdAt,
      });
    }

    if (reservation.status === "confirmed") {
      addNotification({
        id: `reservation-confirmed-${reservation._id}`,
        title: "Reservation confirmed",
        message: `${customerName}'s reservation #${reservationNumber} is confirmed.`,
        type: "reservation",
        time: reservation.createdAt,
      });
    }

    if (reservation.status === "cancelled") {
      addNotification({
        id: `reservation-cancelled-${reservation._id}`,
        title: "Reservation cancelled",
        message: `${customerName}'s reservation #${reservationNumber} has been cancelled.`,
        type: "reservation",
        time: reservation.createdAt,
      });
    }

    if (reservation.status === "completed") {
      addNotification({
        id: `reservation-completed-${reservation._id}`,
        title: "Reservation completed",
        message: `${customerName}'s reservation has been completed.`,
        type: "reservation",
        time: reservation.createdAt,
      });
    }
  });

  // Inventory
  managerInventory.forEach((item) => {
    const quantity = Number(item.quantity || 0);
    const minimum = Number(item.minimumStock || 0);

    if (quantity === 0) {
      addNotification({
        id: `inventory-out-${item._id}`,
        title: "Inventory out of stock",
        message: `${item.itemName || "An inventory item"} is out of stock.`,
        type: "inventory",
        time: item.updatedAt,
      });
    } else if (quantity <= minimum) {
      addNotification({
        id: `inventory-low-${item._id}`,
        title: "Low inventory",
        message: `${item.itemName || "An inventory item"} is low on stock (${quantity} remaining).`,
        type: "inventory",
        time: item.updatedAt,
      });
    }
  });

  // Tables
  managerTables.forEach((table) => {
    if (table.status === "occupied") {
      addNotification({
        id: `table-occupied-${table._id}`,
        title: "Table occupied",
        message: `Table #${table.tableNumber} is currently occupied.`,
        type: "table",
        time: table.updatedAt,
      });
    }

    if (table.status === "reserved") {
      addNotification({
        id: `table-reserved-${table._id}`,
        title: "Table reserved",
        message: `Table #${table.tableNumber} is reserved.`,
        type: "table",
        time: table.updatedAt,
      });
    }
  });

  // Menu
  managerMenu.forEach((item) => {
    if (item.isAvailable === false) {
      addNotification({
        id: `menu-unavailable-${item._id}`,
        title: "Menu item unavailable",
        message: `${item.name || "A menu item"} is currently unavailable.`,
        type: "menu",
        time: item.updatedAt,
      });
    }
  });

  const sortedNotifications = [...notificationItems].sort(
    (a, b) => {
      const aTime = a.time
        ? new Date(a.time).getTime()
        : 0;
      const bTime = b.time
        ? new Date(b.time).getTime()
        : 0;

      return bTime - aTime;
    }
  );

  const unreadNotifications =
    sortedNotifications.filter(
      (notification) =>
        !readNotificationIds.includes(
          notification.id
        )
    );

  const markNotificationAsRead = (
    notificationId: string
  ) => {
    setReadNotificationIds((previous) =>
      previous.includes(notificationId)
        ? previous
        : [...previous, notificationId]
    );
  };

  const markAllNotificationsAsRead = () => {
    setReadNotificationIds(
      sortedNotifications.map(
        (notification) => notification.id
      )
    );
  };

  const notificationIcon = (
    type: ManagerNotification["type"]
  ) => {
    if (type === "order") {
      return <ShoppingBag size={18} />;
    }

    if (type === "reservation") {
      return <CalendarDays size={18} />;
    }

    if (type === "inventory") {
      return <AlertTriangle size={18} />;
    }

    if (type === "table") {
      return <Table2 size={18} />;
    }

    if (type === "menu") {
      return <ChefHat size={18} />;
    }

    return <Bell size={18} />;
  };

  const notificationTime = (
    date?: string
  ) => {
    if (!date) {
      return "Current";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Current";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================
  // LOADING SCREEN
  // =====================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f8] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={34}
            className="mx-auto text-orange-500 animate-spin"
          />

          <p className="mt-3 text-sm text-gray-500">
            Loading manager dashboard...
          </p>
        </div>
      </div>
    );
  }

  // =====================================
  // ERROR SCREEN
  // =====================================

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#f7f7f8] flex items-center justify-center px-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertTriangle
            size={42}
            className="mx-auto text-orange-500"
          />

          <h2 className="mt-4 text-lg font-bold text-gray-800">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error ||
              "Something went wrong."}
          </p>

          <button
            type="button"
            onClick={() =>
              fetchDashboard()
            }
            className="mt-5 px-5 h-10 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =====================================
  // UI
  // =====================================

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#172033] flex">

      {/* =================================
          MOBILE OVERLAY
      ================================= */}

      {mobileMenu && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() =>
            setMobileMenu(false)
          }
        />
      )}

      {/* =================================
          SIDEBAR
      ================================= */}

      <aside
  className={`
    fixed
    lg:sticky
    top-0
    left-0
    z-50
    h-screen

    ${collapsed ? "lg:w-[82px]" : "lg:w-[250px]"}

    w-[250px]
    bg-[#211914]
    text-white
    flex
    flex-col
    transition-all
    duration-300

    ${
      mobileMenu
        ? "translate-x-0"
        : "-translate-x-full lg:translate-x-0"
    }
  `}
>
        {/* LOGO */}

<div
  className={`
    h-[82px]
    border-b border-white/10
    flex items-center
    ${collapsed ? "justify-center px-3" : "justify-between px-6"}
  `}
>
    <div
  className={`
    h-[82px]
    border-b border-white/10
    flex items-center
    ${collapsed ? "justify-center px-3" : "justify-between px-6"}
  `}
>
  <button
    type="button"
    onClick={() =>
      handleNavigation("Dashboard")
    }
    className="flex items-center gap-3 min-w-0"
  >
    {/* Restaurant Logo */}
    <div
      className={`
        rounded-xl overflow-hidden bg-white/10
        flex items-center justify-center shrink-0
        ${collapsed ? "w-11 h-11" : "w-11 h-11"}
      `}
    >
      {restaurantBrand.logo ? (
        <img
          src={restaurantBrand.logo}
          alt={restaurantBrand.name || "Restaurant"}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-white font-bold text-lg">
          {(restaurantBrand.name || "RS")
            .slice(0, 2)
            .toUpperCase()}
        </span>
      )}
    </div>

    {!collapsed && (
      <div className="text-left min-w-0">
        <p className="text-lg font-extrabold text-white truncate">
          {restaurantBrand.name || "RestroSphere"}
        </p>

        <p className="text-xs text-gray-400">
          Manager Dashboard
        </p>
      </div>
    )}
  </button>
</div>
          <button
            type="button"
            onClick={() =>
              setMobileMenu(false)
            }
            className="lg:hidden text-white/60"
          >
            <X size={22} />
          </button>

        </div>

        {/* ROLE */}

        <div className="px-5 pt-6 pb-4">

          <div
  className={`
    py-6
    ${collapsed ? "px-3" : "px-6"}
  `}
>
  {!collapsed && (
    <>
      <p className="text-xs font-semibold tracking-[3px] text-orange-500">
        RESTAURANT
      </p>

      <p className="mt-2 text-lg font-semibold text-white">
        Manager Panel
      </p>
    </>
  )}
</div>

        </div>

        {/* NAVIGATION */}

        <nav className="px-3 space-y-1 flex-1 overflow-y-auto">

         {sidebarItems.map(
  (item) => {
    const Icon = item.icon;

    const active =
      activePage === item.name;

    return (
      <button
        key={item.name}
        type="button"
        onClick={() =>
          handleNavigation(item.name)
        }
        className={`
          w-full
          flex
          items-center
          gap-3
          px-4
          py-3
          rounded-xl
          text-sm
          font-medium
          transition

          ${
            active
              ? "bg-orange-500 text-white shadow-lg shadow-orange-950/20"
              : "text-gray-300 hover:bg-white/5 hover:text-white"
          }
        `}
      >

        {/* ICON */}

        <Icon
          size={20}
          strokeWidth={2}
          className="shrink-0"
        />

        {/* TEXT */}

        {!collapsed && (
          <span>
            {item.name}
          </span>
        )}

        {/* ACTIVE ARROW */}

        {active && !collapsed && (
          <ChevronRight
            size={16}
            className="ml-auto"
          />
        )}

      </button>
    );
  }
)}

        </nav>

        {/* LOGOUT */}
{/* LOGOUT */}

<div className="p-4 border-t border-white/10">

  <button
    type="button"
    onClick={handleLogout}
    className={`
      w-full
      flex
      items-center
      rounded-xl
      py-3
      text-sm
      text-gray-300
      hover:bg-white/5
      hover:text-white
      transition
      ${collapsed ? "justify-center px-2" : "gap-3 px-4"}
    `}
  >
    <LogOut
      size={20}
      className="shrink-0"
    />

    {!collapsed && (
      <span>
        Logout
      </span>
    )}
  </button>

</div>
      </aside>

      {/* =================================
          MAIN
      ================================= */}

      <main className="flex-1 min-w-0">

        {/* =================================
            HEADER
        ================================= */}

        <header className="h-[82px] bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">

          <div className="flex items-center gap-3">

            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() =>
                setMobileMenu(true)
              }
              className="lg:hidden w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center"
            >
              <Menu size={20} />
            </button>


{/* COLLAPSE SIDEBAR */}

<button
  type="button"
  onClick={() =>
    setCollapsed((prev) => !prev)
  }
  className="
    hidden
    lg:flex
    w-10
    h-10
    rounded-xl
    border
    border-gray-200
    items-center
    justify-center
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
            {/* TITLE */}

            <div>

              <p className="text-xs text-gray-400 font-medium">
                Manager
              </p>

              <h1 className="text-lg sm:text-xl font-bold text-[#172033]">
                {activePage ===
                "Dashboard"
                  ? "Operations Dashboard"
                  : activePage}
              </h1>

            </div>

          </div>

          <div className="flex items-center gap-2 sm:gap-4">

            {/* SEARCH */}

            {(activePage ===
              "Dashboard" ||
              activePage ===
                "Orders") && (
              <div className="hidden md:flex relative">

                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder={
                    activePage ===
                    "Orders"
                      ? "Search orders..."
                      : "Search orders..."
                  }
                  className="w-[220px] h-10 pl-9 pr-3 rounded-xl border border-gray-200 outline-none text-sm focus:border-orange-400"
                />

              </div>
            )}

            {/* REFRESH */}

            <button
              type="button"
              onClick={() => {
                fetchDashboard(
                  true
                );

                if (
                  activePage ===
                  "Orders"
                ) {
                  fetchManagerOrders();
                }

                if (
                  activePage ===
                  "Notifications"
                ) {
                  refreshNotificationData();
                }
              }}
              disabled={
                refreshing
              }
              className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-orange-500 hover:border-orange-200 disabled:opacity-60"
              title="Refresh"
            >

              <RefreshCw
                size={18}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

            </button>

            {/* NOTIFICATIONS */}

            <button
              type="button"
              onClick={() =>
                handleNavigation(
                  "Notifications"
                )
              }
              className="relative w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-orange-500 hover:border-orange-200"
              title="Notifications"
            >

              <Bell size={19} />

              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white border-2 border-white text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifications.length > 99
                    ? "99+"
                    : unreadNotifications.length}
                </span>
              )}

            </button>

            {/* MANAGER PROFILE */}

            <div className="hidden sm:flex items-center gap-3 pl-2">

              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                M
              </div>

              <div className="hidden lg:block">

                <p className="text-sm font-bold text-gray-800">
                  Manager
                </p>

                <p className="text-xs text-gray-400">
                  Operations
                </p>

              </div>

            </div>

          </div>

        </header>

        {/* =================================
            CONTENT
        ================================= */}

        <div className="px-4 sm:px-6 lg:px-8 py-7">

          {/* =================================
              DASHBOARD SECTION
          ================================= */}

          {activePage ===
            "Dashboard" && (
            <>

              {/* GREETING */}

              <div className="mb-7">

                <p className="text-sm font-semibold text-orange-500">
                  TODAY'S OPERATIONS
                </p>

                <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#172033]">
                  Good morning,
                  Manager 👋
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Keep an eye on your
                  restaurant's live
                  operations.
                </p>

              </div>

              {/* OPERATION CARDS */}

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                {/* PENDING */}

                <div className="bg-white rounded-2xl border border-gray-200 p-5">

                  <div className="flex items-center justify-between">

                    <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                      <ShoppingBag
                        size={21}
                      />
                    </div>

                    <span className="text-xs font-semibold text-gray-400">
                      ORDERS
                    </span>

                  </div>

                  <p className="mt-5 text-3xl font-extrabold text-gray-800">
                    {
                      data.orders
                        .pending
                    }
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Pending Orders
                  </p>

                </div>

                {/* PREPARING */}

                <div className="bg-white rounded-2xl border border-gray-200 p-5">

                  <div className="flex items-center justify-between">

                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                      <ChefHat
                        size={21}
                      />
                    </div>

                    <span className="text-xs font-semibold text-gray-400">
                      KITCHEN
                    </span>

                  </div>

                  <p className="mt-5 text-3xl font-extrabold text-gray-800">
                    {
                      data.orders
                        .preparing
                    }
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Orders Preparing
                  </p>

                </div>

                {/* TABLES */}

                <div className="bg-white rounded-2xl border border-gray-200 p-5">

                  <div className="flex items-center justify-between">

                    <div className="w-11 h-11 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
                      <Table2
                        size={21}
                      />
                    </div>

                    <span className="text-xs font-semibold text-gray-400">
                      TABLES
                    </span>

                  </div>

                  <p className="mt-5 text-3xl font-extrabold text-gray-800">

                    {
                      data.tables
                        .occupied
                    }

                    <span className="text-lg text-gray-400">
                      {" "}
                      /{" "}
                      {
                        data.tables
                          .total
                      }
                    </span>

                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Occupied Tables
                  </p>

                </div>

                {/* RESERVATIONS */}

                <div className="bg-white rounded-2xl border border-gray-200 p-5">

                  <div className="flex items-center justify-between">

                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                      <CalendarDays
                        size={21}
                      />
                    </div>

                    <span className="text-xs font-semibold text-gray-400">
                      TODAY
                    </span>

                  </div>

                  <p className="mt-5 text-3xl font-extrabold text-gray-800">
                    {
                      data
                        .reservations
                        .today
                    }
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Today's
                    Reservations
                  </p>

                </div>

              </div>

              {/* LIVE OPERATIONS */}

              <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">

                {/* LIVE ORDERS */}

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

                  <div className="px-5 sm:px-6 py-5 border-b border-gray-100 flex items-center justify-between">

                    <div>

                      <h3 className="font-bold text-gray-800">
                        Live Order
                        Queue
                      </h3>

                      <p className="mt-1 text-xs text-gray-400">
                        Today's latest
                        orders
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleNavigation(
                          "Orders"
                        )
                      }
                      className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1"
                    >
                      View all

                      <ChevronRight
                        size={14}
                      />
                    </button>

                  </div>

                  <div className="divide-y divide-gray-100">

                    {filteredDashboardOrders
                      .slice(0, 6)
                      .map(
                        (
                          order
                        ) => (
                          <div
                            key={
                              order._id
                            }
                            className="px-5 sm:px-6 py-4 flex items-center justify-between gap-4"
                          >

                            <div className="flex items-center gap-3 min-w-0">

                              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                                <ShoppingBag
                                  size={
                                    17
                                  }
                                  className="text-gray-500"
                                />
                              </div>

                              <div className="min-w-0">

                                <p className="text-sm font-bold text-gray-800">
                                  #
                                  {order.orderNumber ||
                                    order._id.slice(
                                      -6
                                    )}
                                </p>

                                <p className="text-xs text-gray-400 truncate">
                                  {order.customerName ||
                                    "Customer"}
                                </p>

                              </div>

                            </div>

                            <div className="text-right shrink-0">

                              <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-600">
                                {statusLabel(
                                  order.status
                                )}
                              </span>

                              <p className="mt-1 text-[11px] text-gray-400">
                                {formatTime(
                                  order.createdAt
                                )}
                              </p>

                            </div>

                          </div>
                        )
                      )}

                    {filteredDashboardOrders
                      .length ===
                      0 && (
                      <div className="py-12 text-center">

                        <ShoppingBag
                          size={32}
                          className="mx-auto text-gray-300"
                        />

                        <p className="mt-3 text-sm text-gray-500">
                          No orders
                          found.
                        </p>

                      </div>
                    )}

                  </div>

                </div>

                {/* INVENTORY ALERTS */}

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

                  <div className="px-5 sm:px-6 py-5 border-b border-gray-100">

                    <h3 className="font-bold text-gray-800">
                      Inventory Alerts
                    </h3>

                    <p className="mt-1 text-xs text-gray-400">
                      Items requiring
                      attention
                    </p>

                  </div>

                  <div className="p-5 space-y-3">

                    {data.inventory
                      .outOfStock
                      .slice(0, 3)
                      .map(
                        (
                          item: any
                        ) => (
                          <div
                            key={
                              item._id
                            }
                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-red-50 border border-red-100"
                          >

                            <div className="flex items-center gap-3 min-w-0">

                              <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                                <AlertTriangle
                                  size={
                                    17
                                  }
                                  className="text-red-500"
                                />
                              </div>

                              <div className="min-w-0">

                                <p className="text-sm font-semibold text-gray-800 truncate">
                                  {
                                    item.itemName
                                  }
                                </p>

                                <p className="text-[11px] text-red-500">
                                  Out of
                                  stock
                                </p>

                              </div>

                            </div>

                            <span className="text-xs font-bold text-red-600">
                              0
                            </span>

                          </div>
                        )
                      )}

                    {data.inventory
                      .lowStock
                      .slice(0, 3)
                      .map(
                        (
                          item: any
                        ) => (
                          <div
                            key={
                              item._id
                            }
                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100"
                          >

                            <div className="flex items-center gap-3 min-w-0">

                              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                                <AlertTriangle
                                  size={
                                    17
                                  }
                                  className="text-orange-500"
                                />
                              </div>

                              <div className="min-w-0">

                                <p className="text-sm font-semibold text-gray-800 truncate">
                                  {
                                    item.itemName
                                  }
                                </p>

                                <p className="text-[11px] text-orange-500">
                                  Low stock
                                </p>

                              </div>

                            </div>

                            <span className="text-xs font-bold text-orange-600">
                              {
                                item.quantity
                              }
                            </span>

                          </div>
                        )
                      )}

                    {data.inventory
                      .outOfStock
                      .length === 0 &&
                      data.inventory
                        .lowStock
                        .length === 0 && (
                        <div className="py-8 text-center">

                          <CheckCircle2
                            size={32}
                            className="mx-auto text-green-500"
                          />

                          <p className="mt-3 text-sm font-semibold text-gray-700">
                            Inventory
                            looks good
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            No stock
                            alerts right
                            now.
                          </p>

                        </div>
                      )}

                  </div>

                </div>

              </div>

            </>
          )}

          {/* =================================
              ORDERS SECTION
          ================================= */}

          {activePage ===
            "Orders" && (
            <div>

              {/* HEADER */}

              <div className="mb-6">

                <p className="text-sm font-semibold text-orange-500">
                  ORDER MANAGEMENT
                </p>

                <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#172033]">
                  Restaurant Orders
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Monitor and manage
                  restaurant orders.
                </p>

              </div>

              {/* ORDER SUMMARY */}

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">

                <div className="bg-white border border-gray-200 rounded-2xl p-4">

                  <p className="text-xs text-gray-400">
                    Total
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-gray-800">
                    {
                      managerOrders.length
                    }
                  </p>

                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4">

                  <p className="text-xs text-gray-400">
                    Pending
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-orange-500">
                    {
                      managerOrders.filter(
                        (o) =>
                          o.status ===
                          "pending"
                      ).length
                    }
                  </p>

                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4">

                  <p className="text-xs text-gray-400">
                    Preparing
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-blue-500">
                    {
                      managerOrders.filter(
                        (o) =>
                          o.status ===
                          "preparing"
                      ).length
                    }
                  </p>

                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4">

                  <p className="text-xs text-gray-400">
                    Ready
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-green-500">
                    {
                      managerOrders.filter(
                        (o) =>
                          o.status ===
                          "ready"
                      ).length
                    }
                  </p>

                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4">

                  <p className="text-xs text-gray-400">
                    Completed
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-gray-700">
                    {
                      managerOrders.filter(
                        (o) =>
                          o.status ===
                          "completed"
                      ).length
                    }
                  </p>

                </div>

              </div>

              {/* FILTERS */}

              <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">

                <div className="flex flex-wrap gap-2">

                  {[
                    [
                      "all",
                      "All Orders",
                    ],
                    [
                      "pending",
                      "Pending",
                    ],
                    [
                      "preparing",
                      "Preparing",
                    ],
                    [
                      "ready",
                      "Ready",
                    ],
                    [
                      "completed",
                      "Completed",
                    ],
                    [
                      "cancelled",
                      "Cancelled",
                    ],
                  ].map(
                    ([
                      value,
                      label,
                    ]) => (
                      <button
                        key={
                          value
                        }
                        type="button"
                        onClick={() =>
                          setOrderFilter(
                            value
                          )
                        }
                        className={`
                          px-4
                          py-2
                          rounded-xl
                          text-sm
                          font-semibold
                          transition

                          ${
                            orderFilter ===
                            value
                              ? "bg-orange-500 text-white"
                              : "bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                          }
                        `}
                      >
                        {label}
                      </button>
                    )
                  )}

                </div>

              </div>

              {/* LOADING */}

              {ordersLoading ? (
                <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">

                  <RefreshCw
                    size={30}
                    className="mx-auto text-orange-500 animate-spin"
                  />

                  <p className="mt-3 text-sm text-gray-500">
                    Loading orders...
                  </p>

                </div>
              ) : (

                /* ORDERS LIST */

                <div className="space-y-4">

                  {filteredManagerOrders.map(
                    (order) => (
                      <div
                        key={
                          order._id
                        }
                        className="bg-white border border-gray-200 rounded-2xl p-5"
                      >

                        {/* TOP INFORMATION */}

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                          {/* ORDER */}

                          <div className="flex items-start gap-4">

                            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                              <ShoppingBag
                                size={20}
                              />
                            </div>

                            <div>

                              <p className="font-bold text-gray-800">
                                Order #
                                {order._id
                                  .slice(
                                    -6
                                  )
                                  .toUpperCase()}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                {order.customerName ||
                                  "Guest"}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                {new Date(
                                  order.createdAt
                                ).toLocaleString()}
                              </p>

                            </div>

                          </div>

                          {/* STATUS */}

                          <div>

                            <p className="text-xs text-gray-400 mb-1">
                              Status
                            </p>

                            <span
                              className={`
                                inline-flex
                                px-3
                                py-1.5
                                rounded-full
                                text-xs
                                font-bold

                                ${
                                  order.status ===
                                  "pending"
                                    ? "bg-orange-50 text-orange-600"
                                    : order.status ===
                                      "preparing"
                                    ? "bg-blue-50 text-blue-600"
                                    : order.status ===
                                      "ready"
                                    ? "bg-green-50 text-green-600"
                                    : order.status ===
                                      "completed"
                                    ? "bg-gray-100 text-gray-600"
                                    : "bg-red-50 text-red-600"
                                }
                              `}
                            >
                              {statusLabel(
                                order.status
                              )}
                            </span>

                          </div>

                          {/* PAYMENT */}

                          <div>

                            <p className="text-xs text-gray-400">
                              Payment
                            </p>

                            <p
                              className={`
                                mt-1
                                text-sm
                                font-bold

                                ${
                                  order.paymentStatus ===
                                  "paid"
                                    ? "text-green-600"
                                    : order.paymentStatus ===
                                      "failed"
                                    ? "text-red-600"
                                    : "text-orange-500"
                                }
                              `}
                            >
                              {statusLabel(
                                order.paymentStatus
                              )}
                            </p>

                          </div>

                          {/* TOTAL */}

                          <div>

                            <p className="text-xs text-gray-400">
                              Total
                            </p>

                            <p className="mt-1 text-lg font-extrabold text-gray-800">
                              ₹
                              {Number(
                                order.totalAmount ||
                                  0
                              ).toFixed(
                                2
                              )}
                            </p>

                          </div>

                        </div>

                        {/* ITEMS */}

                        <div className="mt-5 pt-4 border-t border-gray-100">

                          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
                            Items
                          </p>

                          <div className="flex flex-wrap gap-2">

                            {order.items.map(
                              (
                                item,
                                index
                              ) => (
                                <div
                                  key={`${order._id}-${index}`}
                                  className="px-3 py-2 rounded-xl bg-gray-50 text-sm"
                                >

                                  <span className="font-semibold text-gray-700">
                                    {
                                      item.name
                                    }
                                  </span>

                                  <span className="text-gray-400">
                                    {" "}
                                    ×{" "}
                                    {
                                      item.quantity
                                    }
                                  </span>

                                </div>
                              )
                            )}

                          </div>

                        </div>

                        {/* ACTIONS */}

                        {order.status !==
                          "completed" &&
                          order.status !==
                            "cancelled" && (
                            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-2">

                              {/* PENDING */}

                              {order.status ===
                                "pending" && (
                                <button
                                  type="button"
                                  disabled={
                                    updatingOrderId ===
                                    order._id
                                  }
                                  onClick={() =>
                                    updateManagerOrderStatus(
                                      order._id,
                                      "preparing"
                                    )
                                  }
                                  className="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50"
                                >
                                  {updatingOrderId ===
                                  order._id
                                    ? "Updating..."
                                    : "Start Preparing"}
                                </button>
                              )}

                              {/* PREPARING */}

                              {order.status ===
                                "preparing" && (
                                <button
                                  type="button"
                                  disabled={
                                    updatingOrderId ===
                                    order._id
                                  }
                                  onClick={() =>
                                    updateManagerOrderStatus(
                                      order._id,
                                      "ready"
                                    )
                                  }
                                  className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 disabled:opacity-50"
                                >
                                  {updatingOrderId ===
                                  order._id
                                    ? "Updating..."
                                    : "Mark Ready"}
                                </button>
                              )}

                              {/* READY */}

                              {order.status ===
                                "ready" && (
                                <button
                                  type="button"
                                  disabled={
                                    updatingOrderId ===
                                    order._id
                                  }
                                  onClick={() =>
                                    updateManagerOrderStatus(
                                      order._id,
                                      "completed"
                                    )
                                  }
                                  className="px-4 py-2 rounded-xl bg-gray-800 text-white text-sm font-semibold hover:bg-gray-900 disabled:opacity-50"
                                >
                                  {updatingOrderId ===
                                  order._id
                                    ? "Updating..."
                                    : "Complete Order"}
                                </button>
                              )}

                              {/* CANCEL */}

                              <button
                                type="button"
                                disabled={
                                  updatingOrderId ===
                                  order._id
                                }
                                onClick={() =>
                                  updateManagerOrderStatus(
                                    order._id,
                                    "cancelled"
                                  )
                                }
                                className="px-4 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
                              >
                                Cancel Order
                              </button>

                            </div>
                          )}

                      </div>
                    )
                  )}

                  {/* NO ORDERS */}

                  {filteredManagerOrders.length ===
                    0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">

                      <ShoppingBag
                        size={36}
                        className="mx-auto text-gray-300"
                      />

                      <p className="mt-3 text-sm font-semibold text-gray-600">
                        No orders found
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        There are no
                        orders in this
                        category.
                      </p>

                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* =================================
              TABLES
          ================================= */}

        {activePage === "Tables" && (
  <div>
    {/* HEADER */}
    <div className="mb-6">
      <p className="text-sm font-semibold text-orange-500">
        TABLE MANAGEMENT
      </p>

      <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#172033]">
        Restaurant Tables
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Monitor table availability and manage live table status.
      </p>
    </div>

    {/* SUMMARY CARDS */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

      {/* AVAILABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">
              Available
            </p>

            <p className="mt-1 text-3xl font-extrabold text-green-600">
              {
                managerTables.filter(
                  (table) => table.status === "available"
                ).length
              }
            </p>
          </div>

          <div className="w-11 h-11 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
            <CheckCircle2 size={21} />
          </div>
        </div>
      </div>

      {/* OCCUPIED */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">
              Occupied
            </p>

            <p className="mt-1 text-3xl font-extrabold text-red-500">
              {
                managerTables.filter(
                  (table) => table.status === "occupied"
                ).length
              }
            </p>
          </div>

          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <Users size={21} />
          </div>
        </div>
      </div>

      {/* RESERVED */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">
              Reserved
            </p>

            <p className="mt-1 text-3xl font-extrabold text-orange-500">
              {
                managerTables.filter(
                  (table) => table.status === "reserved"
                ).length
              }
            </p>
          </div>

          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
            <CalendarDays size={21} />
          </div>
        </div>
      </div>

    </div>

    {/* TABLES LOADING */}
    {tablesLoading ? (
      <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">
        <RefreshCw
          size={30}
          className="mx-auto text-orange-500 animate-spin"
        />

        <p className="mt-3 text-sm text-gray-500">
          Loading tables...
        </p>
      </div>
    ) : managerTables.length === 0 ? (

      /* NO TABLES */
      <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">
        <Table2
          size={38}
          className="mx-auto text-gray-300"
        />

        <p className="mt-3 text-sm font-semibold text-gray-600">
          No tables found
        </p>

        <p className="mt-1 text-xs text-gray-400">
          No tables have been created for this restaurant yet.
        </p>
      </div>

    ) : (

      /* TABLE GRID */
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

        {managerTables.map((table) => (
          <div
            key={table._id}
            className="bg-white border border-gray-200 rounded-2xl p-5"
          >

            {/* TABLE HEADER */}
            <div className="flex items-start justify-between gap-3">

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Table
                </p>

                <h3 className="mt-1 text-2xl font-extrabold text-gray-800">
                  #{table.tableNumber}
                </h3>
              </div>

              <span
                className={`
                  px-2.5
                  py-1.5
                  rounded-full
                  text-[11px]
                  font-bold

                  ${
                    table.status === "available"
                      ? "bg-green-50 text-green-600"
                      : table.status === "occupied"
                      ? "bg-red-50 text-red-600"
                      : "bg-orange-50 text-orange-600"
                  }
                `}
              >
                {statusLabel(table.status)}
              </span>

            </div>

            {/* CAPACITY */}
            <div className="mt-5 flex items-center gap-3">

              <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                <Users
                  size={17}
                  className="text-gray-500"
                />
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Capacity
                </p>

                <p className="text-sm font-bold text-gray-700">
                  {table.capacity} Guests
                </p>
              </div>

            </div>

            {/* STATUS ACTIONS */}
            <div className="mt-5 pt-4 border-t border-gray-100">

              <p className="text-xs font-bold text-gray-400 mb-3">
                UPDATE STATUS
              </p>

              <div className="grid grid-cols-3 gap-2">

                {/* AVAILABLE */}
                <button
                  type="button"
                  disabled={updatingTableId === table._id}
                  onClick={() =>
                    updateManagerTableStatus(
                      table._id,
                      "available"
                    )
                  }
                  className={`
                    py-2
                    rounded-lg
                    text-[11px]
                    font-bold
                    transition

                    ${
                      table.status === "available"
                        ? "bg-green-500 text-white"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }

                    disabled:opacity-50
                  `}
                >
                  Available
                </button>

                {/* OCCUPIED */}
                <button
                  type="button"
                  disabled={updatingTableId === table._id}
                  onClick={() =>
                    updateManagerTableStatus(
                      table._id,
                      "occupied"
                    )
                  }
                  className={`
                    py-2
                    rounded-lg
                    text-[11px]
                    font-bold
                    transition

                    ${
                      table.status === "occupied"
                        ? "bg-red-500 text-white"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    }

                    disabled:opacity-50
                  `}
                >
                  Occupied
                </button>

                {/* RESERVED */}
                <button
                  type="button"
                  disabled={updatingTableId === table._id}
                  onClick={() =>
                    updateManagerTableStatus(
                      table._id,
                      "reserved"
                    )
                  }
                  className={`
                    py-2
                    rounded-lg
                    text-[11px]
                    font-bold
                    transition

                    ${
                      table.status === "reserved"
                        ? "bg-orange-500 text-white"
                        : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                    }

                    disabled:opacity-50
                  `}
                >
                  Reserved
                </button>

              </div>
            </div>

          </div>
        ))}

      </div>
    )}
  </div>
)}

          {/* =================================
              RESERVATIONS
          ================================= */}

        {activePage === "Reservations" && (
  <div>

    {/* HEADER */}

    <div className="mb-6">

      <p className="text-sm font-semibold text-orange-500">
        RESERVATION MANAGEMENT
      </p>

      <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#172033]">
        Restaurant Reservations
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Manage today's and upcoming guest reservations.
      </p>

    </div>

    {/* SUMMARY */}

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

      {/* TOTAL */}

      <div className="bg-white border border-gray-200 rounded-2xl p-5">

        <p className="text-sm text-gray-400">
          Total
        </p>

        <p className="mt-1 text-3xl font-extrabold text-gray-800">
          {managerReservations.length}
        </p>

        <p className="mt-1 text-xs text-gray-400">
          All reservations
        </p>

      </div>

      {/* PENDING */}

      <div className="bg-white border border-gray-200 rounded-2xl p-5">

        <p className="text-sm text-gray-400">
          Pending
        </p>

        <p className="mt-1 text-3xl font-extrabold text-orange-500">
          {
            managerReservations.filter(
              (reservation) =>
                reservation.status ===
                "pending"
            ).length
          }
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Need confirmation
        </p>

      </div>

      {/* CONFIRMED */}

      <div className="bg-white border border-gray-200 rounded-2xl p-5">

        <p className="text-sm text-gray-400">
          Confirmed
        </p>

        <p className="mt-1 text-3xl font-extrabold text-green-600">
          {
            managerReservations.filter(
              (reservation) =>
                reservation.status ===
                "confirmed"
            ).length
          }
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Confirmed guests
        </p>

      </div>

      {/* UPCOMING */}

      <div className="bg-white border border-gray-200 rounded-2xl p-5">

        <p className="text-sm text-gray-400">
          Upcoming
        </p>

        <p className="mt-1 text-3xl font-extrabold text-blue-500">
          {
            managerReservations.filter(
              (reservation) => {
                const date =
                  new Date(
                    reservation.reservationDate
                  );

                const today =
                  new Date();

                today.setHours(
                  0,
                  0,
                  0,
                  0
                );

                return (
                  date >= today &&
                  reservation.status !==
                    "cancelled" &&
                  reservation.status !==
                    "completed"
                );
              }
            ).length
          }
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Future reservations
        </p>

      </div>

    </div>

    {/* FILTERS */}

    <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">

      <div className="flex flex-wrap gap-2">

        {[
          ["all", "All"],
          ["pending", "Pending"],
          ["confirmed", "Confirmed"],
          ["completed", "Completed"],
          ["cancelled", "Cancelled"],
        ].map(
          ([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setReservationFilter(
                  value
                )
              }
              className={`
                px-4
                py-2
                rounded-xl
                text-sm
                font-semibold
                transition

                ${
                  reservationFilter ===
                  value
                    ? "bg-orange-500 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                }
              `}
            >
              {label}
            </button>
          )
        )}

      </div>

    </div>

    {/* LOADING */}

    {reservationsLoading ? (

      <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">

        <RefreshCw
          size={30}
          className="mx-auto text-orange-500 animate-spin"
        />

        <p className="mt-3 text-sm text-gray-500">
          Loading reservations...
        </p>

      </div>

    ) : filteredManagerReservations.length ===
      0 ? (

      /* EMPTY */

      <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">

        <CalendarDays
          size={38}
          className="mx-auto text-gray-300"
        />

        <p className="mt-3 text-sm font-semibold text-gray-600">
          No reservations found
        </p>

        <p className="mt-1 text-xs text-gray-400">
          There are no reservations in this category.
        </p>

      </div>

    ) : (

      /* RESERVATION LIST */

      <div className="space-y-4">

        {filteredManagerReservations.map(
          (reservation) => {

            const customerName =
              reservation.customerId
                ?.name ||
              reservation.customerId
                ?.fullName ||
              "Guest";

            const tableNumber =
              reservation.tableId
                ?.tableNumber ||
              "—";

            const reservationDate =
              new Date(
                reservation.reservationDate
              ).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              );

            return (
              <div
                key={
                  reservation._id
                }
                className="bg-white border border-gray-200 rounded-2xl p-5"
              >

                {/* TOP */}

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                  {/* GUEST */}

                  <div className="flex items-start gap-4">

                    <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                      <CalendarDays
                        size={20}
                      />
                    </div>

                    <div>

                      <p className="font-bold text-gray-800">
                        {customerName}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Reservation #
                        {reservation._id.slice(
                          -6
                        ).toUpperCase()}
                      </p>

                      {reservation
                        .customerId
                        ?.email && (
                        <p className="mt-1 text-xs text-gray-400">
                          {
                            reservation
                              .customerId
                              .email
                          }
                        </p>
                      )}

                    </div>

                  </div>

                  {/* DATE */}

                  <div>

                    <p className="text-xs text-gray-400">
                      Date
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-700">
                      {reservationDate}
                    </p>

                  </div>

                  {/* TIME */}

                  <div>

                    <p className="text-xs text-gray-400">
                      Time
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-700">
                      {reservation.time}
                    </p>

                  </div>

                  {/* GUESTS */}

                  <div>

                    <p className="text-xs text-gray-400">
                      Guests
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-700">
                      {reservation.guests}
                    </p>

                  </div>

                  {/* TABLE */}

                  <div>

                    <p className="text-xs text-gray-400">
                      Table
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-700">
                      #{tableNumber}
                    </p>

                  </div>

                  {/* STATUS */}

                  <span
                    className={`
                      inline-flex
                      w-fit
                      px-3
                      py-1.5
                      rounded-full
                      text-xs
                      font-bold

                      ${
                        reservation.status ===
                        "pending"
                          ? "bg-orange-50 text-orange-600"
                          : reservation.status ===
                            "confirmed"
                          ? "bg-green-50 text-green-600"
                          : reservation.status ===
                            "completed"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-red-50 text-red-600"
                      }
                    `}
                  >
                    {statusLabel(
                      reservation.status
                    )}
                  </span>

                </div>

                {/* NOTES */}

                {reservation.notes && (
                  <div className="mt-4 p-3 rounded-xl bg-gray-50">

                    <p className="text-xs font-semibold text-gray-400">
                      Guest Note
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {reservation.notes}
                    </p>

                  </div>
                )}

                {/* ACTIONS */}

                {reservation.status !==
                  "completed" &&
                  reservation.status !==
                    "cancelled" && (

                  <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-2">

                    {/* CONFIRM */}

                    {reservation.status ===
                      "pending" && (
                      <button
                        type="button"
                        disabled={
                          updatingReservationId ===
                          reservation._id
                        }
                        onClick={() =>
                          updateManagerReservationStatus(
                            reservation._id,
                            "confirmed"
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 disabled:opacity-50"
                      >
                        {updatingReservationId ===
                        reservation._id
                          ? "Updating..."
                          : "Confirm"}
                      </button>
                    )}

                    {/* COMPLETE */}

                    {reservation.status ===
                      "confirmed" && (
                      <button
                        type="button"
                        disabled={
                          updatingReservationId ===
                          reservation._id
                        }
                        onClick={() =>
                          updateManagerReservationStatus(
                            reservation._id,
                            "completed"
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-gray-800 text-white text-sm font-semibold hover:bg-gray-900 disabled:opacity-50"
                      >
                        {updatingReservationId ===
                        reservation._id
                          ? "Updating..."
                          : "Mark Completed"}
                      </button>
                    )}

                    {/* CANCEL */}

                    <button
                      type="button"
                      disabled={
                        updatingReservationId ===
                        reservation._id
                      }
                      onClick={() =>
                        updateManagerReservationStatus(
                          reservation._id,
                          "cancelled"
                        )
                      }
                      className="px-4 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                  </div>
                )}

              </div>
            );
          }
        )}

      </div>
    )}

  </div>
)}

          {/* =================================
              MENU
          ================================= */}

        {activePage === "Menu" && (
  <div>

    {/* HEADER */}

    <div className="mb-6">

      <p className="text-sm font-semibold text-orange-500">
        MENU MANAGEMENT
      </p>

      <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#172033]">
        Restaurant Menu
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Manage menu availability and monitor menu items.
      </p>

    </div>

    {/* SUMMARY */}

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <p className="text-sm text-gray-400">
          Total Items
        </p>

        <p className="mt-1 text-3xl font-extrabold text-gray-800">
          {managerMenu.length}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <p className="text-sm text-gray-400">
          Available
        </p>

        <p className="mt-1 text-3xl font-extrabold text-green-600">
          {
            managerMenu.filter(
              (item) =>
                item.isAvailable !== false
            ).length
          }
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <p className="text-sm text-gray-400">
          Unavailable
        </p>

        <p className="mt-1 text-3xl font-extrabold text-red-500">
          {
            managerMenu.filter(
              (item) =>
                item.isAvailable === false
            ).length
          }
        </p>
      </div>

    </div>

    {/* CATEGORY FILTER */}

    <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">

      <div className="flex flex-wrap gap-2">

        <button
          type="button"
          onClick={() =>
            setMenuCategory("all")
          }
          className={`
            px-4
            py-2
            rounded-xl
            text-sm
            font-semibold

            ${
              menuCategory ===
              "all"
                ? "bg-orange-500 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
            }
          `}
        >
          All
        </button>

        {menuCategories.map(
          (category) => (
            <button
              key={category}
              type="button"
              onClick={() =>
                setMenuCategory(
                  category
                )
              }
              className={`
                px-4
                py-2
                rounded-xl
                text-sm
                font-semibold

                ${
                  menuCategory ===
                  category
                    ? "bg-orange-500 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                }
              `}
            >
              {category}
            </button>
          )
        )}

      </div>

    </div>

    {/* LOADING */}

    {menuLoading ? (

      <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">

        <RefreshCw
          size={30}
          className="mx-auto text-orange-500 animate-spin"
        />

        <p className="mt-3 text-sm text-gray-500">
          Loading menu...
        </p>

      </div>

    ) : filteredManagerMenu.length ===
      0 ? (

      /* EMPTY */

      <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">

        <ChefHat
          size={40}
          className="mx-auto text-gray-300"
        />

        <p className="mt-3 text-sm font-semibold text-gray-600">
          No menu items found
        </p>

        <p className="mt-1 text-xs text-gray-400">
          No items are available in this category.
        </p>

      </div>

    ) : (

      /* MENU GRID */

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

        {filteredManagerMenu.map(
          (item) => (

            <div
              key={item._id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
            >

              {/* IMAGE */}

<div className="w-full h-64 bg-gray-100 overflow-hidden">
  {item.image ? (
    <img
      src={item.image}
      alt={item.name}
      className="w-full h-full object-cover object-center"
    />
  ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ChefHat
                      size={42}
                      className="text-gray-300"
                    />
                  </div>
                )}

              </div>

              {/* CONTENT */}

              <div className="p-5">

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <h3 className="text-lg font-bold text-gray-800 truncate">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-xs font-semibold text-orange-500">
                      {item.category ||
                        "Uncategorized"}
                    </p>

                  </div>

                  <span
                    className={`
                      shrink-0
                      px-2.5
                      py-1
                      rounded-full
                      text-[11px]
                      font-bold

                      ${
                        item.isAvailable !==
                        false
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }
                    `}
                  >
                    {item.isAvailable !==
                    false
                      ? "Available"
                      : "Unavailable"}
                  </span>

                </div>

                {/* DESCRIPTION */}

                {item.description && (
                  <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* PRICE */}

                <div className="mt-4 flex items-center justify-between">

                  <p className="text-xl font-extrabold text-gray-800">
                    ₹
                    {Number(
                      item.price || 0
                    ).toFixed(2)}
                  </p>

                  {item.veg !==
                    undefined && (
                    <span
                      className={`
                        text-[11px]
                        font-bold
                        px-2
                        py-1
                        rounded-lg

                        ${
                          item.veg
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-600"
                        }
                      `}
                    >
                      {item.veg
                        ? "VEG"
                        : "NON-VEG"}
                    </span>
                  )}

                </div>

                {/* AVAILABILITY */}

                <div className="mt-5 pt-4 border-t border-gray-100">

                  <p className="text-xs font-bold text-gray-400 mb-3">
                    AVAILABILITY
                  </p>

                  <div className="flex gap-2">

                    <button
                      type="button"
                      disabled={
                        updatingMenuId ===
                        item._id
                      }
                      onClick={() =>
                        updateManagerMenuItem(
                          item._id,
                          true
                        )
                      }
                      className={`
                        flex-1
                        py-2
                        rounded-xl
                        text-xs
                        font-bold

                        ${
                          item.isAvailable !==
                          false
                            ? "bg-green-500 text-white"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }

                        disabled:opacity-50
                      `}
                    >
                      Available
                    </button>

                    <button
                      type="button"
                      disabled={
                        updatingMenuId ===
                        item._id
                      }
                      onClick={() =>
                        updateManagerMenuItem(
                          item._id,
                          false
                        )
                      }
                      className={`
                        flex-1
                        py-2
                        rounded-xl
                        text-xs
                        font-bold

                        ${
                          item.isAvailable ===
                          false
                            ? "bg-red-500 text-white"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }

                        disabled:opacity-50
                      `}
                    >
                      Unavailable
                    </button>

                  </div>

                </div>

              </div>

            </div>

          )
        )}

      </div>

    )}

  </div>
)}

          {/* =================================
              INVENTORY
          ================================= */}

          {activePage === "Inventory" && (
  <div>

    {/* HEADER */}

    <div className="mb-6">

      <p className="text-sm font-semibold text-orange-500">
        INVENTORY MANAGEMENT
      </p>

      <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#172033]">
        Restaurant Inventory
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Monitor stock levels and keep inventory under control.
      </p>

    </div>

    {/* SUMMARY */}

    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

      {/* TOTAL */}

      <div className="bg-white border border-gray-200 rounded-2xl p-5">

        <p className="text-sm text-gray-400">
          Total Items
        </p>

        <p className="mt-1 text-3xl font-extrabold text-gray-800">
          {managerInventory.length}
        </p>

      </div>

      {/* IN STOCK */}

      <div className="bg-white border border-gray-200 rounded-2xl p-5">

        <p className="text-sm text-gray-400">
          In Stock
        </p>

        <p className="mt-1 text-3xl font-extrabold text-green-600">
          {
            managerInventory.filter(
              (item) =>
                Number(
                  item.quantity || 0
                ) >
                Number(
                  item.minimumStock || 0
                )
            ).length
          }
        </p>

      </div>

      {/* LOW STOCK */}

      <div className="bg-white border border-gray-200 rounded-2xl p-5">

        <p className="text-sm text-gray-400">
          Low Stock
        </p>

        <p className="mt-1 text-3xl font-extrabold text-orange-500">
          {
            managerInventory.filter(
              (item) => {
                const quantity =
                  Number(
                    item.quantity || 0
                  );

                const minimum =
                  Number(
                    item.minimumStock || 0
                  );

                return (
                  quantity > 0 &&
                  quantity <=
                    minimum
                );
              }
            ).length
          }
        </p>

      </div>

      {/* OUT OF STOCK */}

      <div className="bg-white border border-gray-200 rounded-2xl p-5">

        <p className="text-sm text-gray-400">
          Out of Stock
        </p>

        <p className="mt-1 text-3xl font-extrabold text-red-500">
          {
            managerInventory.filter(
              (item) =>
                Number(
                  item.quantity || 0
                ) === 0
            ).length
          }
        </p>

      </div>

    </div>

    {/* CATEGORY FILTER */}

    <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">

      <div className="flex flex-wrap gap-2">

        <button
          type="button"
          onClick={() =>
            setInventoryCategory(
              "all"
            )
          }
          className={`
            px-4
            py-2
            rounded-xl
            text-sm
            font-semibold

            ${
              inventoryCategory ===
              "all"
                ? "bg-orange-500 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
            }
          `}
        >
          All
        </button>

        {inventoryCategories.map(
          (category) => (
            <button
              key={category}
              type="button"
              onClick={() =>
                setInventoryCategory(
                  category
                )
              }
              className={`
                px-4
                py-2
                rounded-xl
                text-sm
                font-semibold

                ${
                  inventoryCategory ===
                  category
                    ? "bg-orange-500 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                }
              `}
            >
              {category}
            </button>
          )
        )}

      </div>

    </div>

    {/* LOADING */}

    {inventoryLoading ? (

      <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">

        <RefreshCw
          size={30}
          className="mx-auto text-orange-500 animate-spin"
        />

        <p className="mt-3 text-sm text-gray-500">
          Loading inventory...
        </p>

      </div>

    ) : filteredManagerInventory.length ===
      0 ? (

      /* EMPTY */

      <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">

        <Package
          size={42}
          className="mx-auto text-gray-300"
        />

        <p className="mt-3 text-sm font-semibold text-gray-600">
          No inventory items found
        </p>

        <p className="mt-1 text-xs text-gray-400">
          No inventory items are available.
        </p>

      </div>

    ) : (

      /* INVENTORY TABLE */

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px]">

            <thead className="bg-gray-50 border-b border-gray-200">

              <tr>

                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                  Item
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                  Category
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                  Quantity
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                  Minimum
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                  Supplier
                </th>

                <th className="px-5 py-4 text-right text-xs font-bold text-gray-400 uppercase">
                  Update
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {filteredManagerInventory.map(
                (item) => {

                  const quantity =
                    Number(
                      item.quantity || 0
                    );

                  const minimum =
                    Number(
                      item.minimumStock || 0
                    );

                  const isOutOfStock =
                    quantity === 0;

                  const isLowStock =
                    quantity > 0 &&
                    quantity <=
                      minimum;

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50"
                    >

                      {/* ITEM */}

                      <td className="px-5 py-5">

                        <p className="font-bold text-gray-800">
                          {item.itemName}
                        </p>

                        {item.price !==
                          undefined && (
                          <p className="mt-1 text-xs text-gray-400">
                            ₹
                            {Number(
                              item.price
                            ).toFixed(2)}
                          </p>
                        )}

                      </td>

                      {/* CATEGORY */}

                      <td className="px-5 py-5">

                        <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 text-xs font-semibold">
                          {item.category ||
                            "—"}
                        </span>

                      </td>

                      {/* QUANTITY */}

                      <td className="px-5 py-5">

                        <p
                          className={`
                            text-lg
                            font-extrabold

                            ${
                              isOutOfStock
                                ? "text-red-500"
                                : isLowStock
                                ? "text-orange-500"
                                : "text-gray-800"
                            }
                          `}
                        >
                          {quantity}
                        </p>

                        <p className="text-xs text-gray-400">
                          {item.unit}
                        </p>

                      </td>

                      {/* MINIMUM */}

                      <td className="px-5 py-5">

                        <p className="text-sm font-semibold text-gray-700">
                          {minimum}
                        </p>

                        <p className="text-xs text-gray-400">
                          {item.unit}
                        </p>

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-5">

                        <span
                          className={`
                            inline-flex
                            items-center
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-bold

                            ${
                              isOutOfStock
                                ? "bg-red-50 text-red-600"
                                : isLowStock
                                ? "bg-orange-50 text-orange-600"
                                : "bg-green-50 text-green-600"
                            }
                          `}
                        >
                          {isOutOfStock
                            ? "Out of Stock"
                            : isLowStock
                            ? "Low Stock"
                            : "In Stock"}
                        </span>

                      </td>

                      {/* SUPPLIER */}

                      <td className="px-5 py-5">

                        <p className="text-sm text-gray-600">
                          {item.supplier ||
                            "—"}
                        </p>

                      </td>

                      {/* UPDATE */}

                      <td className="px-5 py-5 text-right">

                        <div className="flex items-center justify-end gap-2">

                          <input
                            type="number"
                            min="0"
                            defaultValue={
                              quantity
                            }
                            disabled={
                              updatingInventoryId ===
                              item._id
                            }
                            id={`inventory-${item._id}`}
                            className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400"
                          />

                          <button
                            type="button"
                            disabled={
                              updatingInventoryId ===
                              item._id
                            }
                            onClick={() => {

                              const input =
                                document.getElementById(
                                  `inventory-${item._id}`
                                ) as HTMLInputElement | null;

                              const newQuantity =
                                Number(
                                  input?.value
                                );

                              updateManagerInventory(
                                item._id,
                                newQuantity
                              );
                            }}
                            className="px-3 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 disabled:opacity-50"
                          >
                            {updatingInventoryId ===
                            item._id
                              ? "..."
                              : "Update"}
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

      </div>

    )}

  </div>
)}

          {/* =================================
              CUSTOMERS
          ================================= */}

        {activePage === "Customers" && (
  <div>

    {/* HEADER */}

    <div className="mb-6">

      <p className="text-sm font-semibold text-orange-500">
        CUSTOMER MANAGEMENT
      </p>

      <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#172033]">
        Restaurant Customers
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        View customer information and activity.
      </p>

    </div>

    {/* SUMMARY */}

    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

      {/* TOTAL */}

      <div className="bg-white border border-gray-200 rounded-2xl p-5">

        <p className="text-sm text-gray-400">
          Total Customers
        </p>

        <p className="mt-1 text-3xl font-extrabold text-gray-800">
          {managerCustomers.length}
        </p>

      </div>

      {/* ACTIVE / ORDERING */}

      <div className="bg-white border border-gray-200 rounded-2xl p-5">

        <p className="text-sm text-gray-400">
          Active Customers
        </p>

        <p className="mt-1 text-3xl font-extrabold text-green-600">
          {
            managerCustomers.filter(
              (customer) =>
                Number(
                  customer.totalOrders ||
                    0
                ) > 0
            ).length
          }
        </p>

      </div>

      {/* NEW CUSTOMERS */}

      <div className="bg-white border border-gray-200 rounded-2xl p-5">

        <p className="text-sm text-gray-400">
          New Customers
        </p>

        <p className="mt-1 text-3xl font-extrabold text-orange-500">
          {
            managerCustomers.filter(
              (customer) => {
                if (
                  !customer.createdAt
                ) {
                  return false;
                }

                const created =
                  new Date(
                    customer.createdAt
                  );

                const now =
                  new Date();

                const days =
                  (now.getTime() -
                    created.getTime()) /
                  (1000 *
                    60 *
                    60 *
                    24);

                return days <= 30;
              }
            ).length
          }
        </p>

      </div>

      {/* RETURNING */}

      <div className="bg-white border border-gray-200 rounded-2xl p-5">

        <p className="text-sm text-gray-400">
          Returning Customers
        </p>

        <p className="mt-1 text-3xl font-extrabold text-blue-600">
          {
            managerCustomers.filter(
              (customer) =>
                Number(
                  customer.totalOrders ||
                    0
                ) > 1
            ).length
          }
        </p>

      </div>

    </div>

    {/* CUSTOMER LIST */}

    {customersLoading ? (

      <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">

        <RefreshCw
          size={30}
          className="mx-auto text-orange-500 animate-spin"
        />

        <p className="mt-3 text-sm text-gray-500">
          Loading customers...
        </p>

      </div>

    ) : filteredManagerCustomers.length ===
      0 ? (

      <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">

        <Users
          size={42}
          className="mx-auto text-gray-300"
        />

        <p className="mt-3 text-sm font-semibold text-gray-600">
          No customers found
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Customers will appear here when they place orders.
        </p>

      </div>

    ) : (

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        <div className="px-5 py-4 border-b border-gray-100">

          <h3 className="text-lg font-bold text-gray-800">
            Customer List
          </h3>

          <p className="text-xs text-gray-400 mt-1">
            {filteredManagerCustomers.length} customers
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px]">

            <thead className="bg-gray-50 border-b border-gray-200">

              <tr>

                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                  Customer
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                  Contact
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                  Orders
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                  Total Spent
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                  Last Order
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                  Customer Since
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {filteredManagerCustomers.map(
                (customer) => (

                  <tr
                    key={customer._id}
                    className="hover:bg-gray-50"
                  >

                    {/* CUSTOMER */}

                    <td className="px-5 py-5">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold">

                          {(
                            customer.fullName ||
                            "C"
                          )
                            .charAt(0)
                            .toUpperCase()}

                        </div>

                        <div>

                          <p className="font-bold text-gray-800">
                            {customer.fullName ||
                              "Unknown Customer"}
                          </p>

                          <p className="text-xs text-gray-400">
                            Customer
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* CONTACT */}

                    <td className="px-5 py-5">

                      <p className="text-sm text-gray-700">
                        {customer.email ||
                          "—"}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {customer.phone ||
                          "No phone"}
                      </p>

                    </td>

                    {/* ORDERS */}

                    <td className="px-5 py-5">

                      <span className="inline-flex px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">

                        {Number(
                          customer.totalOrders ||
                            0
                        )}{" "}
                        Orders

                      </span>

                    </td>

                    {/* SPENT */}

                    <td className="px-5 py-5">

                      <p className="text-sm font-extrabold text-gray-800">

                        ₹
                        {Number(
                          customer.totalSpent ||
                            0
                        ).toFixed(2)}

                      </p>

                    </td>

                    {/* LAST ORDER */}

                    <td className="px-5 py-5">

                      {customer.lastOrder ? (
                        <p className="text-sm text-gray-600">
                          {new Date(
                            customer.lastOrder
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      ) : (
                        <span className="text-xs text-gray-400">
                          No orders yet
                        </span>
                      )}

                    </td>

                    {/* CREATED */}

                    <td className="px-5 py-5">

                      <p className="text-sm text-gray-600">

                        {customer.createdAt
                          ? new Date(
                              customer.createdAt
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "—"}

                      </p>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    )}

  </div>
)}

          {/* =================================
              STAFF
          ================================= */}

       {activePage === "Staff" && (
  <div>

    {/* HEADER */}

    <div className="mb-6">

      <p className="text-sm font-semibold text-orange-500">
        STAFF MANAGEMENT
      </p>

      <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#172033]">
        Restaurant Staff
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        View and monitor your restaurant team.
      </p>

    </div>

    {/* SUMMARY */}

    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <p className="text-sm text-gray-400">
          Total Staff
        </p>

        <p className="mt-1 text-3xl font-extrabold text-gray-800">
          {managerStaff.length}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <p className="text-sm text-gray-400">
          Managers
        </p>

        <p className="mt-1 text-3xl font-extrabold text-orange-500">
          {
            managerStaff.filter(
              (staff) =>
                staff.role ===
                "manager"
            ).length
          }
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <p className="text-sm text-gray-400">
          Waiters
        </p>

        <p className="mt-1 text-3xl font-extrabold text-blue-600">
          {
            managerStaff.filter(
              (staff) =>
                staff.role ===
                "waiter"
            ).length
          }
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <p className="text-sm text-gray-400">
          Kitchen Staff
        </p>

        <p className="mt-1 text-3xl font-extrabold text-green-600">
          {
            managerStaff.filter(
              (staff) =>
                staff.role ===
                "kitchen"
            ).length
          }
        </p>
      </div>

    </div>

    {/* FILTER */}

    <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">

      <div className="flex flex-wrap gap-2">

        {[
          ["all", "All"],
          ["manager", "Managers"],
          ["waiter", "Waiters"],
          ["kitchen", "Kitchen"],
        ].map(([value, label]) => (

          <button
            key={value}
            type="button"
            onClick={() =>
              setStaffRoleFilter(
                value
              )
            }
            className={`
              px-4
              py-2
              rounded-xl
              text-sm
              font-semibold

              ${
                staffRoleFilter ===
                value
                  ? "bg-orange-500 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              }
            `}
          >
            {label}
          </button>

        ))}

      </div>

    </div>

    {/* CONTENT */}

    {staffLoading ? (

      <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">

        <RefreshCw
          size={30}
          className="mx-auto text-orange-500 animate-spin"
        />

        <p className="mt-3 text-sm text-gray-500">
          Loading staff...
        </p>

      </div>

    ) : filteredManagerStaff.length ===
      0 ? (

      <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">

        <Users
          size={42}
          className="mx-auto text-gray-300"
        />

        <p className="mt-3 text-sm font-semibold text-gray-600">
          No staff found
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Employees added to this restaurant will appear here.
        </p>

      </div>

    ) : (

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        <div className="px-5 py-4 border-b border-gray-100">

          <h3 className="text-lg font-bold text-gray-800">
            Team Members
          </h3>

          <p className="mt-1 text-xs text-gray-400">
            {filteredManagerStaff.length} staff members
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px]">

            <thead className="bg-gray-50 border-b border-gray-200">

              <tr>

                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                  Staff Member
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                  Contact
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                  Role
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                  Joined
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                  Status
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {filteredManagerStaff.map(
                (staff) => (

                  <tr
                    key={staff._id}
                    className="hover:bg-gray-50"
                  >

                    {/* NAME */}

                    <td className="px-5 py-5">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold">

                          {(
                            staff.fullName ||
                            "S"
                          )
                            .charAt(0)
                            .toUpperCase()}

                        </div>

                        <div>

                          <p className="font-bold text-gray-800">
                            {staff.fullName ||
                              "Unknown Staff"}
                          </p>

                          <p className="text-xs text-gray-400">
                            Restaurant Team
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* CONTACT */}

                    <td className="px-5 py-5">

                      <p className="text-sm text-gray-700">
                        {staff.email ||
                          "—"}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {staff.phone ||
                          "No phone"}
                      </p>

                    </td>

                    {/* ROLE */}

                    <td className="px-5 py-5">

                      <span
                        className={`
                          inline-flex
                          px-3
                          py-1.5
                          rounded-full
                          text-xs
                          font-bold

                          ${
                            staff.role ===
                            "manager"
                              ? "bg-orange-50 text-orange-600"
                              : staff.role ===
                                "waiter"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-green-50 text-green-600"
                          }
                        `}
                      >
                        {staff.role ===
                        "kitchen"
                          ? "Kitchen Staff"
                          : staff.role
                              ? staff.role
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase() +
                                staff.role.slice(
                                  1
                                )
                              : "Staff"}
                      </span>

                    </td>

                    {/* JOINED */}

                    <td className="px-5 py-5">

                      <p className="text-sm text-gray-600">

                        {staff.createdAt
                          ? new Date(
                              staff.createdAt
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month:
                                  "short",
                                year:
                                  "numeric",
                              }
                            )
                          : "—"}

                      </p>

                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-5">

                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-xs font-bold">

                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />

                        Active

                      </span>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    )}

  </div>
)}

          {/* =================================
              REPORTS
          ================================= */}

       {activePage === "Reports" && (
  <div>

    {/* HEADER */}

    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">

      <div>

        <p className="text-sm font-semibold text-orange-500">
          RESTAURANT REPORTS
        </p>

        <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#172033]">
          Operations Reports
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Monitor orders, revenue and menu performance.
        </p>

      </div>

      {/* RANGE */}

      <div className="flex gap-2">

        {[
          ["today", "Today"],
          ["7d", "7 Days"],
          ["30d", "30 Days"],
        ].map(
          ([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                changeReportRange(
                  value
                )
              }
              className={`
                px-4
                py-2
                rounded-xl
                text-sm
                font-semibold

                ${
                  reportRange ===
                  value
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-orange-50"
                }
              `}
            >
              {label}
            </button>
          )
        )}

      </div>

    </div>

    {reportLoading ? (

      <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">

        <RefreshCw
          size={30}
          className="mx-auto text-orange-500 animate-spin"
        />

        <p className="mt-3 text-sm text-gray-500">
          Generating report...
        </p>

      </div>

    ) : managerReport ? (

      <div>

        {/* SUMMARY */}

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

          <div className="bg-white border border-gray-200 rounded-2xl p-5">

            <p className="text-sm text-gray-400">
              Total Orders
            </p>

            <p className="mt-1 text-3xl font-extrabold text-gray-800">
              {
                managerReport
                  .summary
                  ?.totalOrders || 0
              }
            </p>

          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">

            <p className="text-sm text-gray-400">
              Completed
            </p>

            <p className="mt-1 text-3xl font-extrabold text-green-600">
              {
                managerReport
                  .summary
                  ?.completedOrders || 0
              }
            </p>

          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">

            <p className="text-sm text-gray-400">
              Revenue
            </p>

            <p className="mt-1 text-3xl font-extrabold text-orange-500">
              ₹
              {Number(
                managerReport
                  .summary
                  ?.revenue || 0
              ).toFixed(0)}
            </p>

          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">

            <p className="text-sm text-gray-400">
              Average Order
            </p>

            <p className="mt-1 text-3xl font-extrabold text-blue-600">
              ₹
              {Number(
                managerReport
                  .summary
                  ?.averageOrderValue ||
                  0
              ).toFixed(0)}
            </p>

          </div>

        </div>

        {/* ORDER STATUS */}

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

          <div className="bg-white border border-gray-200 rounded-2xl p-5">

            <p className="text-sm text-gray-400">
              Pending
            </p>

            <p className="mt-1 text-2xl font-extrabold text-orange-500">
              {
                managerReport
                  .summary
                  ?.pendingOrders || 0
              }
            </p>

          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">

            <p className="text-sm text-gray-400">
              Preparing
            </p>

            <p className="mt-1 text-2xl font-extrabold text-blue-600">
              {
                managerReport
                  .summary
                  ?.preparingOrders ||
                0
              }
            </p>

          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">

            <p className="text-sm text-gray-400">
              Ready
            </p>

            <p className="mt-1 text-2xl font-extrabold text-green-600">
              {
                managerReport
                  .summary
                  ?.readyOrders || 0
              }
            </p>

          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">

            <p className="text-sm text-gray-400">
              Cancelled
            </p>

            <p className="mt-1 text-2xl font-extrabold text-red-500">
              {
                managerReport
                  .summary
                  ?.cancelledOrders ||
                0
              }
            </p>

          </div>

        </div>

        {/* TOP ITEMS */}

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">

          <div className="px-5 py-4 border-b border-gray-100">

            <h3 className="text-lg font-bold text-gray-800">
              Top Selling Items
            </h3>

            <p className="text-xs text-gray-400 mt-1">
              Best-performing menu items for this period.
            </p>

          </div>

          {managerReport
            .itemReport
            ?.length > 0 ? (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[600px]">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                      Item
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                      Quantity
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold text-gray-400 uppercase">
                      Revenue
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {managerReport
                    .itemReport
                    .slice(0, 8)
                    .map(
                      (
                        item: any,
                        index: number
                      ) => (

                        <tr
                          key={`${item.name}-${index}`}
                          className="hover:bg-gray-50"
                        >

                          <td className="px-5 py-4">

                            <p className="font-semibold text-gray-800">
                              {item.name}
                            </p>

                          </td>

                          <td className="px-5 py-4">

                            <span className="px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-xs font-bold">
                              {item.quantity}
                            </span>

                          </td>

                          <td className="px-5 py-4 text-right">

                            <p className="font-bold text-gray-800">
                              ₹
                              {Number(
                                item.revenue ||
                                  0
                              ).toFixed(0)}
                            </p>

                          </td>

                        </tr>

                      )
                    )}

                </tbody>

              </table>

            </div>

          ) : (

            <div className="py-12 text-center">

              <BarChart3
                size={40}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 text-sm text-gray-500">
                No item sales data available.
              </p>

            </div>

          )}

        </div>

   {/* REVENUE CHART */}

<div className="w-full min-w-0 bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 mb-6 overflow-hidden">

  {/* HEADER */}

  <div className="mb-4 sm:mb-5">
    <h3 className="text-lg sm:text-xl font-bold text-gray-800">
      Revenue Overview
    </h3>

    <p className="text-xs sm:text-sm text-gray-400 mt-1">
      Daily revenue for the selected period.
    </p>
  </div>

  {/* RESPONSIVE CHART */}

  <div className="w-full min-w-0 h-[240px] sm:h-[280px] lg:h-[320px]">

    <ResponsiveContainer
      width="100%"
      height="100%"
      minWidth={0}
      minHeight={0}
    >

      <BarChart
        data={managerReport?.dailyReport || []}
        margin={{
          top: 10,
          right: 8,
          left: 0,
          bottom: 5,
        }}
      >

        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
        />

        <XAxis
          dataKey="date"
          tickFormatter={(date) =>
            new Date(date).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
              }
            )
          }
          tick={{
            fontSize: 11,
          }}
          tickMargin={8}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tickFormatter={(value) =>
            `₹${value}`
          }
          tick={{
            fontSize: 11,
          }}
          width={45}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          formatter={(value) => [
            `₹${Number(value ?? 0).toFixed(0)}`,
            "Revenue",
          ]}
          labelFormatter={(date) =>
            new Date(
              String(date)
            ).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            )
          }
        />

        <Bar
          dataKey="revenue"
          name="Revenue"
          radius={[5, 5, 0, 0]}
        />

      </BarChart>

    </ResponsiveContainer>

  </div>

</div>
        {/* DAILY REPORT */}

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-100">

            <h3 className="text-lg font-bold text-gray-800">
              Daily Performance
            </h3>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[650px]">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                    Date
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                    Orders
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                    Completed
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                    Cancelled
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold text-gray-400 uppercase">
                    Revenue
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {(
                  managerReport
                    .dailyReport || []
                ).map(
                  (day: any) => (

                    <tr
                      key={day.date}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-5 py-4 text-sm font-semibold text-gray-700">
                        {new Date(
                          day.date
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month:
                              "short",
                          }
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {day.orders}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-green-600">
                        {day.completed}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-red-500">
                        {day.cancelled}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-bold text-gray-800">
                        ₹
                        {Number(
                          day.revenue ||
                            0
                        ).toFixed(0)}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    ) : (

      <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">

        <BarChart3
          size={42}
          className="mx-auto text-gray-300"
        />

        <p className="mt-3 text-sm font-semibold text-gray-600">
          No report data available
        </p>

      </div>

    )}

  </div>
)}

          {/* =================================
              NOTIFICATIONS
          ================================= */}

          {activePage === "Notifications" && (
            <div>

              {/* HEADER */}

              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">

                <div>
                  <p className="text-sm font-semibold text-orange-500">
                    MANAGER OPERATIONS
                  </p>

                  <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#172033]">
                    Notifications
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    View important restaurant activity and alerts from all operations.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">

                  {unreadNotifications.length > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsAsRead}
                      className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
                    >
                      Mark all as read
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={refreshNotificationData}
                    className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-semibold hover:border-orange-200 hover:text-orange-500"
                  >
                    Refresh
                  </button>

                </div>

              </div>

              {/* SUMMARY */}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">

                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Total
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-gray-800">
                    {sortedNotifications.length}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Unread
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-orange-500">
                    {unreadNotifications.length}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Orders
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-blue-600">
                    {
                      sortedNotifications.filter(
                        (notification) =>
                          notification.type === "order" ||
                          notification.type === "payment"
                      ).length
                    }
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Alerts
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-red-500">
                    {
                      sortedNotifications.filter(
                        (notification) =>
                          notification.type === "inventory" ||
                          notification.type === "menu"
                      ).length
                    }
                  </p>
                </div>

              </div>

              {/* NOTIFICATION LIST */}

              {sortedNotifications.length === 0 ? (

                <div className="bg-white border border-gray-200 rounded-2xl min-h-[420px] flex items-center justify-center p-8">

                  <div className="text-center">

                    <div className="mx-auto w-14 h-14 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center">
                      <CheckCircle2 size={24} />
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-gray-800">
                      You're all caught up
                    </h3>

                    <p className="mt-2 text-sm text-gray-400 max-w-md">
                      No restaurant activity or alerts need your attention right now.
                    </p>

                  </div>

                </div>

              ) : (

                <div className="space-y-3">

                  {sortedNotifications.map(
                    (notification) => {
                      const isUnread =
                        !readNotificationIds.includes(
                          notification.id
                        );

                      return (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() =>
                            markNotificationAsRead(
                              notification.id
                            )
                          }
                          className={`w-full text-left bg-white border rounded-2xl p-4 sm:p-5 transition hover:border-orange-200 hover:shadow-sm ${
                            isUnread
                              ? "border-orange-200 bg-orange-50/30"
                              : "border-gray-200"
                          }`}
                        >

                          <div className="flex items-start gap-4">

                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                                notification.type === "inventory" ||
                                notification.type === "payment"
                                  ? "bg-red-50 text-red-500"
                                  : notification.type === "reservation"
                                  ? "bg-purple-50 text-purple-500"
                                  : notification.type === "table"
                                  ? "bg-blue-50 text-blue-500"
                                  : notification.type === "menu"
                                  ? "bg-orange-50 text-orange-500"
                                  : "bg-green-50 text-green-500"
                              }`}
                            >
                              {notificationIcon(
                                notification.type
                              )}
                            </div>

                            <div className="min-w-0 flex-1">

                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">

                                <div className="flex items-center gap-2">

                                  <h3 className="text-sm sm:text-base font-bold text-gray-800">
                                    {notification.title}
                                  </h3>

                                  {isUnread && (
                                    <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                                  )}

                                </div>

                                <span className="text-[11px] text-gray-400 shrink-0">
                                  {notificationTime(
                                    notification.time
                                  )}
                                </span>

                              </div>

                              <p className="mt-1 text-sm text-gray-500">
                                {notification.message}
                              </p>

                              {isUnread && (
                                <p className="mt-2 text-[11px] font-semibold text-orange-500">
                                  Click to mark as read
                                </p>
                              )}

                            </div>

                          </div>

                        </button>
                      );
                    }
                  )}

                </div>

              )}

            </div>
          )}

        </div>
      </main>
    </div>
  );
};


export default ManagerDashboard;