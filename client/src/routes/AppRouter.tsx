import {
  Routes,
  Route,
  useLocation,
  useParams,
  useNavigate,
    Navigate,
} from "react-router-dom";
import {
  Clock3,
  MapPin,
  Phone,
  Mail,
  Utensils,
  CalendarDays,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import RestaurantWebsite from "../pages/RestaurantWebsite";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Home from "../pages/Home";
import Menu from "../pages/Menu";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import Cart from "../pages/Cart";
import OwnerDashboard from "../pages/dashboard/OwnerDashboard";
import Orders from "../pages/owner/Orders";
import CustomerDashboard from "../pages/dashboard/CustomerDashboard";
import ManagerDashboard from "../pages/dashboard/ManagerDashboard";
import KitchenDashboard from "../pages/dashboard/KitchenDashboard";
import WaiterDashboard from "../pages/dashboard/WaiterDashboard";
import Tables from "../pages/dashboard/Tables";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import Subscription from "../pages/Subscription";
function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{
        duration: 0.35,
        ease: "easeInOut",
      }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}
function DashboardBackGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();

  useEffect(() => {
    const dashboardPath = location.pathname;

    // Dashboard ki duplicate history entry
    window.history.pushState(
      { dashboardGuard: true },
      "",
      dashboardPath
    );

    const handlePopState = () => {
      // Browser Back ko dashboard par hi rok do
      window.history.pushState(
        { dashboardGuard: true },
        "",
        dashboardPath
      );
    };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, [location.pathname]);

  return <>{children}</>;
}

   function RestaurantScoped({
  children,
}: {
  children: React.ReactNode;
}) {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      setError("Restaurant URL is invalid.");
      setLoading(false);
      return;
    }

    const loadRestaurant = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/restaurants/public/${slug}`
        );

        const data = await response.json();

        if (!response.ok || !data?.success || !data?.data) {
          setError(
            data?.message || "Restaurant website is unavailable."
          );
          return;
        }

        const restaurant = data.data;

        // Save restaurant context
        sessionStorage.setItem(
          "selectedRestaurant",
          JSON.stringify(restaurant)
        );

        sessionStorage.setItem(
          "restaurantId",
          restaurant._id
        );

        sessionStorage.setItem(
          "restaurantSlug",
          restaurant.slug
        );

        // If user is already logged in, link
        // the current account to this restaurant.
        const token = sessionStorage.getItem("token");

        if (token && restaurant._id) {
          try {
            const selectResponse = await fetch(
              "http://localhost:5000/api/auth/select-restaurant",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  restaurantId: restaurant._id,
                }),
              }
            );

            const selectData =
              await selectResponse.json();

            if (selectResponse.ok) {
              if (selectData?.token) {
                sessionStorage.setItem(
                  "token",
                  selectData.token
                );
              }

              sessionStorage.setItem(
                "selectedRestaurant",
                JSON.stringify(
                  selectData?.restaurant || restaurant
                )
              );
            }
          } catch (selectError) {
            console.error(
              "RESTAURANT SELECTION ERROR:",
              selectError
            );
          }
        }
      } catch (err) {
        console.error(
          "RESTAURANT WEBSITE ERROR:",
          err
        );

        setError(
          "Unable to load restaurant website."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRestaurant();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f4ef]">
        <div className="text-center">
          <div className="text-orange-500 text-3xl animate-spin">
            ↻
          </div>

          <p className="mt-3 text-gray-500">
            Loading restaurant...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f4ef] p-5">
        <div className="w-full max-w-xl bg-white rounded-3xl border border-gray-200 p-8 text-center">
          <h1 className="text-2xl font-extrabold text-[#172033]">
            Restaurant website unavailable
          </h1>

          <p className="mt-3 text-gray-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="mt-6 rounded-xl bg-orange-500 px-6 py-3 text-white font-bold"
          >
            Go to RestroSphere
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
function AppRouter() {
  const location = useLocation();
  function RestaurantCustomerEntry() {
  const { slug } = useParams();
const { user } = useAuth();
if (user?.role?.toLowerCase() !== "customer") {
  return <Navigate to="/" replace />;
}
  useEffect(() => {
    if (!slug) return;

    const loadRestaurant = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/restaurants/public/${slug}`
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            "Restaurant not found:",
            data?.message
          );
          return;
        }

        const restaurant = data?.data;

      if (restaurant?._id) {
  sessionStorage.setItem(
    "selectedRestaurant",
    JSON.stringify(restaurant)
  );

  sessionStorage.setItem(
    "restaurantId",
    restaurant._id
  );

  // Customer ko current restaurant ke saath link karo
  const token = sessionStorage.getItem("token");

  if (token) {
    const selectResponse = await fetch(
      "http://localhost:5000/api/auth/select-restaurant",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurantId: restaurant._id,
        }),
      }
    );

    const selectData = await selectResponse.json();

    if (!selectResponse.ok) {
      console.error(
        "RESTAURANT SELECTION ERROR:",
        selectData?.message
      );
      return;
    }

    // New JWT has the selected restaurantId
    if (selectData?.token) {
      sessionStorage.setItem(
        "token",
        selectData.token
      );
    }

    sessionStorage.setItem(
      "selectedRestaurant",
      JSON.stringify(
        selectData.restaurant || restaurant
      )
    );
  }
}
      } catch (error) {
        console.error(
          "RESTAURANT URL ERROR:",
          error
        );
      }
    };

    loadRestaurant();
  }, [slug]);

return (
  <ProtectedRoute allowedRoles={["customer"]}>
    <PageTransition>
      <CustomerDashboard />
    </PageTransition>
  </ProtectedRoute>
);
}
function GoogleSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    sessionStorage.setItem("token", token);

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.role;

      // Existing user info ko preserve karna
      const oldUser = sessionStorage.getItem("user");

      if (oldUser) {
        const user = JSON.parse(oldUser);
        sessionStorage.setItem(
          "user",
          JSON.stringify({ ...user, role })
        );
      }

      if (role === "customer") {
        navigate("/customer/dashboard", { replace: true });
      } else if (role === "owner") {
        navigate("/owner/dashboard", { replace: true });
      } else if (role === "manager") {
        navigate("/manager/dashboard", { replace: true });
      } else if (role === "kitchen") {
        navigate("/kitchen/dashboard", { replace: true });
      } else if (role === "waiter") {
        navigate("/waiter/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Google login token error:", error);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7f8]">
      <div className="text-center">
        <div className="text-orange-500 text-3xl animate-spin">↻</div>
        <p className="mt-3 text-gray-500">
          Completing Google login...
        </p>
      </div>
    </div>
  );
}
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
<Route
  path="/google-success"
  element={<GoogleSuccess />}
/>
        {/* PUBLIC */}

        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />

        <Route
          path="/menu"
          element={
            <PageTransition>
              <Menu />
            </PageTransition>
          }
        />

        {/* LOGIN */}

        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />

        {/* SIGNUP */}

        <Route
          path="/signup"
          element={
            <PageTransition>
              <Signup />
            </PageTransition>
          }
        />

        {/* FORGOT PASSWORD */}

        <Route
          path="/forgot-password"
          element={
            <PageTransition>
              <ForgotPassword />
            </PageTransition>
          }
        />

        {/* CART */}

        <Route
          path="/cart"
          element={
            <PageTransition>
              <Cart />
            </PageTransition>
          }
        />
<Route
  path="/subscription"
  element={
    <PageTransition>
      <Subscription />
    </PageTransition>
  }
/>
        {/* OWNER DASHBOARD */}

        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
  <DashboardBackGuard>
    <PageTransition>
      <OwnerDashboard />
    </PageTransition>
  </DashboardBackGuard>
</ProtectedRoute>
          }
        />
        <Route path="/owner/menu" element={<Menu />} />
        <Route
  path="/owner/orders"
  element={
    <ProtectedRoute allowedRoles={["owner"]}>
      <PageTransition>
        <Orders />
      </PageTransition>
    </ProtectedRoute>
  }
/>
<Route
  path="/owner/tables"
  element={
    <ProtectedRoute allowedRoles={["owner"]}>
      <PageTransition>
        <Tables />
      </PageTransition>
    </ProtectedRoute>
  }
/>

<Route
  path="/r/:slug"
  element={
    <PageTransition>
      <RestaurantWebsite />
    </PageTransition>
  }
/>

{/* ================================
    RESTAURANT-SCOPED LOGIN
================================ */}

<Route
  path="/r/:slug/login"
  element={
    <RestaurantScoped>
      <PageTransition>
        <Login />
      </PageTransition>
    </RestaurantScoped>
  }
/>

{/* ================================
    RESTAURANT-SCOPED SIGNUP
================================ */}

<Route
  path="/r/:slug/signup"
  element={
    <RestaurantScoped>
      <PageTransition>
        <Signup />
      </PageTransition>
    </RestaurantScoped>
  }
/>

{/* ================================
    RESTAURANT-SCOPED OWNER
================================ */}

<Route
  path="/r/:slug/owner/dashboard"
  element={
    <RestaurantScoped>
      <ProtectedRoute allowedRoles={["owner"]}>
        <DashboardBackGuard>
          <PageTransition>
            <OwnerDashboard />
          </PageTransition>
        </DashboardBackGuard>
      </ProtectedRoute>
    </RestaurantScoped>
  }
/>

{/* ================================
    RESTAURANT-SCOPED MANAGER
================================ */}

<Route
  path="/r/:slug/manager/dashboard"
  element={
    <RestaurantScoped>
      <ProtectedRoute allowedRoles={["manager"]}>
        <DashboardBackGuard>
          <PageTransition>
            <ManagerDashboard />
          </PageTransition>
        </DashboardBackGuard>
      </ProtectedRoute>
    </RestaurantScoped>
  }
/>

{/* ================================
    RESTAURANT-SCOPED KITCHEN
================================ */}

<Route
  path="/r/:slug/kitchen/dashboard"
  element={
    <RestaurantScoped>
      <ProtectedRoute allowedRoles={["kitchen"]}>
        <DashboardBackGuard>
          <PageTransition>
            <KitchenDashboard />
          </PageTransition>
        </DashboardBackGuard>
      </ProtectedRoute>
    </RestaurantScoped>
  }
/>

{/* ================================
    RESTAURANT-SCOPED WAITER
================================ */}

<Route
  path="/r/:slug/waiter/dashboard"
  element={
    <RestaurantScoped>
      <ProtectedRoute allowedRoles={["waiter"]}>
        <DashboardBackGuard>
          <PageTransition>
            <WaiterDashboard />
          </PageTransition>
        </DashboardBackGuard>
      </ProtectedRoute>
    </RestaurantScoped>
  }
/>

{/* ================================
    RESTAURANT-SCOPED CUSTOMER
================================ */}

<Route
  path="/r/:slug/customer/dashboard"
  element={
    <RestaurantScoped>
      <ProtectedRoute allowedRoles={["customer"]}>
        <PageTransition>
          <CustomerDashboard />
        </PageTransition>
      </ProtectedRoute>
    </RestaurantScoped>
  }
/>
        {/* CUSTOMER DASHBOARD */}

        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <PageTransition>
                <CustomerDashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* MANAGER DASHBOARD */}

        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <DashboardBackGuard>
                <PageTransition>
                  <ManagerDashboard />
                </PageTransition>
              </DashboardBackGuard>
            </ProtectedRoute>
          }
        />

        {/* KITCHEN DASHBOARD */}

        <Route
          path="/kitchen/dashboard"
          element={
            <ProtectedRoute allowedRoles={["kitchen"]}>
              <DashboardBackGuard>
                <PageTransition>
                  <KitchenDashboard />
                </PageTransition>
              </DashboardBackGuard>
            </ProtectedRoute>
          }
        />

        {/* WAITER DASHBOARD */}

        <Route
          path="/waiter/dashboard"
          element={
            <DashboardBackGuard>
  <PageTransition>
    <WaiterDashboard />
  </PageTransition>
</DashboardBackGuard>
          }
        />

      </Routes>
    </AnimatePresence>
  );
}

export default AppRouter;