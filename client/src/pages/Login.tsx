import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  UserCog,
  ChefHat,
  Utensils,
  User,
  Crown,
  Loader2,
} from "lucide-react";

type Role = "owner" | "manager" | "kitchen" | "waiter" | "customer";

const API = "http://localhost:5000/api";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ===============================
// RESTAURANT URL CONTEXT
// ===============================

const restaurantSlug =
  location.pathname.startsWith("/r/")
    ? location.pathname.split("/")[2]
    : null;

// ===============================
// RESTAURANT BRANDING
// ===============================

const [restaurantBrand, setRestaurantBrand] = useState<{
  name?: string;
  logo?: string;
} | null>(null);

useEffect(() => {
  const loadRestaurantBrand = async () => {
    try {
      // First check saved restaurant
      const savedRestaurant =
        sessionStorage.getItem("selectedRestaurant");

      if (savedRestaurant) {
        try {
          const restaurant = JSON.parse(savedRestaurant);

          // Only use saved restaurant if it matches current URL
          if (
            !restaurantSlug ||
            restaurant.slug === restaurantSlug
          ) {
            setRestaurantBrand({
              name: restaurant.name,
              logo: restaurant.logo,
            });

            return;
          }
        } catch {
          sessionStorage.removeItem("selectedRestaurant");
        }
      }

      // Directly opened restaurant URL
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
          name: restaurant.name,
          logo: restaurant.logo,
        });

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
      }
    } catch (error) {
      console.error(
        "RESTAURANT BRAND LOAD ERROR:",
        error
      );
    }
  };

  loadRestaurantBrand();
}, [restaurantSlug]);

// ===============================
// DASHBOARD ROUTING
// ===============================

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

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "customer" as Role,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState("");

  const locationState = location.state as {
    message?: string;
    email?: string;
  } | null;

  React.useEffect(() => {
    if (locationState?.message) {
      setMessage(locationState.message);

      if (locationState.email) {
        setForm((prev) => ({
          ...prev,
          email: locationState.email || "",
        }));
      }

      window.history.replaceState({}, document.title);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!form.email.trim()) {
      setMessage("Please enter your email.");
      return;
    }

    if (!form.password) {
      setMessage("Please enter your password.");
      return;
    }

    if (!form.role) {
      setMessage("Please select your role.");
      return;
    }

    try {
      setLoading(true);
const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
        }),
      });

      const text = await response.text();

      let data: any = {};

      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Invalid response received from server.");
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message || `Login failed (${response.status})`
        );
      }

      const token = data.token || data.data?.token;
      const user = data.user || data.data?.user;

      if (!token) {
        throw new Error(
          "Login successful but authentication token was not received."
        );
      }

      if (!user) {
        throw new Error(
          "Login successful but user information was not received."
        );
      }

      // Remove stale auth from the shared storage before creating
      // the new tab-specific session.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");

      sessionStorage.setItem("token", token);
      sessionStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      const loggedInRole = user?.role || form.role;
if (loggedInRole === "customer") {
  window.location.href = restaurantSlug
    ? `/r/${restaurantSlug}/customer/dashboard`
    : "/customer/dashboard";
} else {
  window.location.href = getDashboard(loggedInRole);
}
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    window.location.href = `${API}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-[#f7f4ef] flex items-center justify-center p-5">
      <div className="w-full max-w-[1050px] min-h-[200px] bg-white rounded-[30px] overflow-hidden shadow-2xl grid lg:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="hidden lg:flex relative bg-gradient-to-br from-[#211914] via-[#2b1d17] to-[#4a2412] text-white p-16 flex-col justify-between">
<button
  type="button"
  onClick={() => {
    if (restaurantSlug) {
      navigate(`/r/${restaurantSlug}`);
    } else {
      navigate("/");
    }
  }}
  className="flex items-center gap-3 text-4xl font-bold text-white"
>
  {restaurantSlug ? (
    <>
      {restaurantBrand?.logo && (
        <img
          src={restaurantBrand.logo}
          alt={restaurantBrand?.name || restaurantSlug}
          className="h-12 w-12 rounded-xl object-contain bg-white"
        />
      )}

      <span>
        {restaurantBrand?.name || restaurantSlug}
      </span>
    </>
  ) : (
    <>
      <span>
        Restro
        <span className="text-orange-500">
          Sphere
        </span>
      </span>
    </>
  )}
</button>
          <div className="max-w-[500px]">
            <p className="text-orange-500 uppercase tracking-[5px] text-sm font-bold mb-7">
  Welcome Back
</p>

<h1 className="text-6xl font-extrabold leading-[1.08]">
  Welcome to
  <br />
  <span className="text-orange-500">
    {restaurantBrand?.name || "restaurant"}
  </span>
</h1>

<p className="mt-8 text-lg text-gray-300 leading-8">
  Sign in to manage your restaurant,
  team and operations.
</p>
           </div>

          <div className="flex items-center gap-4 text-gray-300">
            <div className="w-11 h-11 rounded-full bg-orange-500/10 flex items-center justify-center">
              <ShieldCheck className="text-orange-500" size={24} />
            </div>

            <span>Secure role-based authentication</span>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-8 sm:p-12 lg:p-16 flex items-center">
          <div className="w-full max-w-[560px] mx-auto">
            <div className="mb-8">
              <p className="text-orange-500 uppercase tracking-[5px] text-sm font-bold">
                Sign In
              </p>

              <h2 className="text-4xl sm:text-5xl font-extrabold text-[#080808] mt-4">
                Welcome back
              </h2>

              <p className="text-[#718096] text-lg mt-3">
  Login to continue to{" "}
  {restaurantBrand?.name || "RestroSphere"}.
</p>
            </div>

            {message && (
              <div
                className={`mb-6 rounded-xl px-4 py-3 text-sm border ${
                  message.toLowerCase().includes("success")
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-600"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-[#17345c] font-semibold mb-2">
                  Login As
                </label>

                <div className="relative">
                  <UserCog
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full h-[60px] pl-12 pr-4 rounded-xl border border-gray-200 bg-white text-gray-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 appearance-none cursor-pointer"
                  >
                    <option value="customer">Customer</option>
                    <option value="owner">Restaurant Owner</option>
                    <option value="manager">Manager</option>
                    <option value="kitchen">Kitchen Staff</option>
                    <option value="waiter">Waiter</option>
                  </select>

                  <span className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    ▼
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[#17345c] font-semibold mb-2">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={21}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full h-[60px] pl-12 pr-4 rounded-xl border border-gray-200 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-gray-800"
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[#17345c] font-semibold">
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() =>
  navigate(
    restaurantSlug
      ? `/r/${restaurantSlug}/forgot-password`
      : "/forgot-password"
  )
}
                    className="text-orange-500 font-medium text-sm hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <Lock
                    size={21}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full h-[60px] pl-12 pr-14 rounded-xl border border-gray-200 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-gray-800"
                  />

                  <div className="flex justify-end mt-2"></div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff size={21} />
                    ) : (
                      <Eye size={21} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-7">
                {form.role === "owner" && (
                  <>
                    <Crown size={17} className="text-orange-500" />
                    <span>Restaurant Owner access</span>
                  </>
                )}

                {form.role === "manager" && (
                  <>
                    <UserCog size={17} className="text-orange-500" />
                    <span>Manager access</span>
                  </>
                )}

                {form.role === "kitchen" && (
                  <>
                    <ChefHat size={17} className="text-orange-500" />
                    <span>Kitchen Staff access</span>
                  </>
                )}

                {form.role === "waiter" && (
                  <>
                    <Utensils size={17} className="text-orange-500" />
                    <span>Waiter access</span>
                  </>
                )}

                {form.role === "customer" && (
                  <>
                    <User size={17} className="text-orange-500" />
                    <span>Customer access</span>
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[61px] rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-orange-200 hover:scale-[1.01] transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={22} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={21} />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-4 my-8">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-gray-400">OR</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full h-[60px] rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-3 text-gray-700 font-semibold transition disabled:opacity-70"
            >
              {googleLoading ? (
                <Loader2
                  size={22}
                  className="animate-spin text-gray-500"
                />
              ) : (
                <>
                  <span className="font-bold text-xl">G</span>
                  Continue with Google
                </>
              )}
            </button>

            <p className="text-center text-gray-500 mt-10">
              Don't have an account?{" "}
              <Link
  to={
    restaurantSlug
      ? `/r/${restaurantSlug}/signup`
      : "/signup"
  }
  className="text-orange-500 font-semibold hover:underline"
>
  Create one
</Link>
            </p>

           <p className="text-center text-xs text-gray-400 mt-8">
  By continuing, you agree to{" "}
  {restaurantBrand?.name || "RestroSphere"}'s terms and privacy
  policy.
</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;