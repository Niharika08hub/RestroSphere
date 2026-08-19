import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  User,
  Store,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Check,
  Loader2,
} from "lucide-react";

type Role = "owner" | "customer";

type FormData = {
  fullName: string;
  restaurantName: string;
  restaurantType: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const API = "http://localhost:5000/api";

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();

  // Restaurant URL:
  // /r/cafe-da-flora/signup
  const restaurantSlug =
    location.pathname.startsWith("/r/")
      ? location.pathname.split("/")[2]
      : null;

  const [restaurantBrand, setRestaurantBrand] = useState<{
    name?: string;
    logo?: string;
  } | null>(null);
useEffect(() => {
  const loadRestaurantBrand = async () => {
    try {
      // Already selected restaurant
      const savedRestaurant =
        sessionStorage.getItem("selectedRestaurant");

      if (savedRestaurant) {
        try {
          const restaurant =
            JSON.parse(savedRestaurant);

          // Only use saved restaurant if URL is restaurant URL
          if (restaurantSlug) {
            setRestaurantBrand({
              name: restaurant?.name,
              logo: restaurant?.logo,
            });

            return;
          }
        } catch {
          sessionStorage.removeItem(
            "selectedRestaurant"
          );
        }
      }

      // Normal RestroSphere signup
      if (!restaurantSlug) {
        setRestaurantBrand(null);
        return;
      }

      // Load restaurant from backend
      const response = await fetch(
        `http://localhost:5000/api/restaurants/public/${restaurantSlug}`
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data?.success ||
        !data?.data
      ) {
        console.error(
          "SIGNUP RESTAURANT LOAD ERROR:",
          data?.message
        );
        return;
      }

      const restaurant = data.data;

      setRestaurantBrand({
        name: restaurant.name,
        logo: restaurant.logo,
      });

      // Save restaurant for next pages
      sessionStorage.setItem(
        "selectedRestaurant",
        JSON.stringify(restaurant)
      );

      if (restaurant._id) {
        sessionStorage.setItem(
          "restaurantId",
          restaurant._id
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
        "SIGNUP BRAND LOAD ERROR:",
        error
      );
    }
  };

  loadRestaurantBrand();
}, [restaurantSlug]);
  const [role, setRole] = useState<Role>("owner");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState<FormData>({
  fullName: "",
  restaurantName: "",
  restaurantType: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
});

  const [errors, setErrors] = useState<
    Partial<Record<keyof FormData | "agree", string>>
  >({});

  const changeRole = (newRole: Role) => {
    setRole(newRole);
    setMessage("");
    setErrors({});
  };

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]: value,
  }));

  setErrors((prev) => ({
    ...prev,
    [name]: "",
  }));

  setMessage("");
};

  const validate = () => {
    const e: typeof errors = {};

    if (!form.fullName.trim()) {
      e.fullName = "Full name is required";
    }

    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      e.email = "Enter a valid email";
    }

    if (role === "owner") {
      if (!/^[6-9]\d{9}$/.test(form.phone)) {
        e.phone = "Enter a valid 10-digit phone number";
      }
    } else if (
      form.phone &&
      !/^[6-9]\d{9}$/.test(form.phone)
    ) {
      e.phone = "Enter a valid 10-digit phone number";
    }

    if (form.password.length < 8) {
      e.password = "Password must contain at least 8 characters";
    }

    if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match";
    }

    if (!agree) {
      e.agree = "Please accept the terms";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const passwordStrength = () => {
    let score = 0;

    if (form.password.length >= 8) score++;
    if (/[A-Z]/.test(form.password)) score++;
    if (/[a-z]/.test(form.password)) score++;
    if (/[0-9]/.test(form.password)) score++;
    if (/[^A-Za-z0-9]/.test(form.password)) score++;

    return score;
  };

  const strength = passwordStrength();

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      setMessage("");

const response = await fetch("/api/auth/signup", {
              method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  fullName: form.fullName.trim(),

  restaurantName:
    role === "owner"
      ? form.restaurantName.trim()
      : "",

  restaurantType:
    role === "owner"
      ? form.restaurantType
      : "",

  email: form.email.trim().toLowerCase(),
  phone: form.phone.trim(),
  password: form.password,
  role,
}),
      });

const text = await response.text();

let data: any = {};

if (text.trim()) {
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid response received from server");
  }
}

if (!response.ok) {
  console.log("SIGNUP STATUS:", response.status);
  console.log("SIGNUP RESPONSE:", data);
  console.log("SIGNUP RAW:", text);

  throw new Error(
    data.message || `Signup failed (${response.status})`
  );
}

setMessage(
  data.message || "Account created successfully!"
);

navigate(
  restaurantSlug
    ? `/r/${restaurantSlug}/login`
    : "/login",
  {
    state: {
      message:
        "Account created successfully. Please login.",
      email: form.email,
    },
  }
);
} catch (error) {
  setMessage(
    error instanceof Error
      ? error.message
      : "Something went wrong"
  );
} finally {
  setLoading(false);
}
};
      

  const handleGoogleSignup = () => {
    setGoogleLoading(true);

    window.location.href =
      `${API}/auth/google`;
  };

  const inputClass = (field: keyof FormData) =>
    `w-full rounded-xl border px-11 py-3.5 outline-none transition
    ${
      errors[field]
        ? "border-red-400 focus:ring-2 focus:ring-red-100"
        : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
    }`;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-3xl">

        {/* Header */}

        <div className="text-center mb-6">
          <Link
  to={
    restaurantSlug
      ? `/r/${restaurantSlug}`
      : "/"
  }
  className="inline-block text-3xl font-black tracking-tight"
>
  {restaurantSlug ? (
    <span className="text-gray-800">
      {restaurantBrand?.name || restaurantSlug}
    </span>
  ) : (
    <>
      <span className="text-orange-700">
        Restro
      </span>
      <span className="text-gray-800">
        Sphere
      </span>
    </>
  )}
</Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
            Create your account
          </h1>

         <p className="text-gray-500 mt-1">
  {restaurantSlug
    ? `Create your ${restaurantBrand?.name || restaurantSlug} account`
    : "Choose how you want to use RestroSphere"}
</p>
        </div>

        {/* Main Card */}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-5 sm:p-3">

          {/* Role Cards */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">

            <button
              type="button"
              onClick={() => changeRole("owner")}
              className={`relative text-left rounded-2xl border-2 p-4 transition-all ${
                role === "owner"
                  ? "border-orange-500 bg-orange-50 shadow-md"
                  : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
              }`}
            >
              {role === "owner" && (
                <span className="absolute right-4 top-4 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center">
                  <Check size={15} />
                </span>
              )}

              <div className="text-2xl mb-2"></div>

              <h2 className="font-bold text-gray-900">
                Restaurant Owner
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Manage your restaurant business
              </p>
            </button>

            <button
              type="button"
              onClick={() => changeRole("customer")}
              className={`relative text-left rounded-2xl border-2 p-4 transition-all ${
                role === "customer"
                  ? "border-orange-500 bg-orange-50 shadow-md"
                  : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
              }`}
            >
              {role === "customer" && (
                <span className="absolute right-4 top-4 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center">
                  <Check size={15} />
                </span>
              )}

              <div className="text-2xl mb-2"></div>

              <h2 className="font-bold text-gray-900">
                Customer
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Discover restaurants and order food
              </p>
            </button>

          </div>

          {/* Error / Success */}

          {message && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
              {message}
            </div>
          )}

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Full Name */}

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Full Name
                </label>

                <div className="relative mt-2">
                  <User
                    size={18}
                    className="absolute left-4 top-4 text-gray-400"
                  />

                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className={inputClass("fullName")}
                  />
                </div>

                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.fullName}
                  </p>
                )}
              </div>
             
             {/* Restaurant Name - Owner Only */}

{role === "owner" && (
  <div>
    <label className="text-sm font-semibold text-gray-700">
      Restaurant Name
    </label>

    <div className="relative mt-2">
      <Store
        size={18}
        className="absolute left-4 top-4 text-gray-400"
      />

      <input
        type="text"
        name="restaurantName"
        value={form.restaurantName}
        onChange={handleChange}
        placeholder="Enter restaurant name"
        className={inputClass("restaurantName")}
      />
    </div>

    {errors.restaurantName && (
      <p className="text-xs text-red-500 mt-1">
        {errors.restaurantName}
      </p>
    )}
  </div>
)}

{/* Restaurant Type - Owner Only */}

{role === "owner" && (
  <div>
    <label className="text-sm font-semibold text-gray-700">
      Restaurant Type
    </label>

    <select
      name="restaurantType"
      value={form.restaurantType}
      onChange={handleChange}
      className="w-full mt-2 rounded-xl border border-gray-200 px-4 py-3.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-white"
    >
      <option value="">
        Select restaurant type
      </option>

      <option value="Cafe">Cafe</option>
      <option value="Fine Dining">Fine Dining</option>
      <option value="Fast Food">Fast Food</option>
      <option value="Bakery">Bakery</option>
      <option value="Cloud Kitchen">
        Cloud Kitchen
      </option>
      <option value="Casual Dining">
        Casual Dining
      </option>
      <option value="Multi Cuisine">
        Multi Cuisine
      </option>
      <option value="Food Truck">
        Food Truck
      </option>
      <option value="Other">Other</option>
    </select>

    {errors.restaurantType && (
      <p className="text-xs text-red-500 mt-1">
        {errors.restaurantType}
      </p>
    )}
  </div>
)}


              {/* Email */}

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Email
                </label>

                <div className="relative mt-2">
                  <Mail
                    size={18}
                    className="absolute left-4 top-4 text-gray-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={inputClass("email")}
                  />
                </div>

                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Phone Number{" "}
                  {role === "customer" && (
                    <span className="text-gray-400 font-normal">
                      (Optional)
                    </span>
                  )}
                </label>

                <div className="relative mt-2">
                  <Phone
                    size={18}
                    className="absolute left-4 top-4 text-gray-400"
                  />

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit phone number"
                    inputMode="numeric"
                    maxLength={10}
                    className={inputClass("phone")}
                  />
                </div>

                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Password */}

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Password
                </label>

                <div className="relative mt-2">
                  <Lock
                    size={18}
                    className="absolute left-4 top-4 text-gray-400"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className={inputClass("password")}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {/* Strength */}

                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(
                        (item) => (
                          <div
                            key={item}
                            className={`h-1.5 flex-1 rounded-full ${
                              strength >= item
                                ? strength <= 2
                                  ? "bg-red-400"
                                  : strength <= 4
                                  ? "bg-yellow-400"
                                  : "bg-green-500"
                                : "bg-gray-200"
                            }`}
                          />
                        )
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {strength <= 2
                        ? "Weak password"
                        : strength <= 4
                        ? "Good password"
                        : "Strong password"}
                    </p>
                  </div>
                )}

                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>

                <div className="relative mt-2">
                  <Lock
                    size={18}
                    className="absolute left-4 top-4 text-gray-400"
                  />

                  <input
                    type={
                      showConfirm
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    className={inputClass(
                      "confirmPassword"
                    )}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-700"
                  >
                    {showConfirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

            </div>

            {/* Terms */}

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => {
                    setAgree(e.target.checked);
                    setErrors((prev) => ({
                      ...prev,
                      agree: "",
                    }));
                  }}
                  className="mt-1 accent-orange-500"
                />

                <span className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link
  to={
    restaurantSlug
      ? `/r/${restaurantSlug}/terms`
      : "/terms"
  }
  className="text-orange-500 font-medium"
>
  Terms & Conditions
</Link>
                  and{" "}
                  <Link
  to={
    restaurantSlug
      ? `/r/${restaurantSlug}/privacy`
      : "/privacy"
  }
  className="text-orange-500 font-medium"
>
  Privacy Policy
</Link>
                  .
                </span>
              </label>

              {errors.agree && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.agree}
                </p>
              )}
            </div>

            {/* Create Account */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3.5 flex items-center justify-center gap-2 hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                  Creating Account...
                </>
              ) : (
                role === "owner"
                  ? "Create Restaurant Account"
                  : "Create Customer Account"
              )}
            </button>

            {/* Google - Customer ONLY */}

            {role === "customer" && (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-px bg-gray-200 flex-1" />

                  <span className="text-xs text-gray-400">
                    OR
                  </span>

                  <div className="h-px bg-gray-200 flex-1" />
                </div>

                <button
                  type="button"
                  disabled={googleLoading}
                  onClick={handleGoogleSignup}
                  className="w-full rounded-xl border border-gray-200 py-3.5 flex items-center justify-center gap-3 font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
                >
                  {googleLoading ? (
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                  ) : (
                    <span className="text-lg font-bold">
                      G
                    </span>
                  )}

                  Continue with Google
                </button>
              </>
            )}

          </form>

          {/* Login */}

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
           <Link
  to={
    restaurantSlug
      ? `/r/${restaurantSlug}/login`
      : "/login"
  }
  className="text-orange-500 font-bold hover:text-orange-600"
>
  Login
</Link>
          </p>

        </div>

      <p className="text-center text-xs text-gray-400 mt-5">
  © {new Date().getFullYear()}{" "}
  {restaurantSlug
    ? restaurantBrand?.name || restaurantSlug
    : "RestroSphere"}
</p>
      </div>
    </div>
  );
}