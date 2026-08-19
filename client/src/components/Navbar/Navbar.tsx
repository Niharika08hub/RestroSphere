import { useEffect, useState } from "react";
import logo from "../../assets/images/logo.png";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Menu as MenuIcon,
  X,
  ShoppingCart,
} from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const scrollToSection = (section: string) => {
    setMobileOpen(false);

    if (location.pathname === "/") {
      document.getElementById(section)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      navigate("/", {
        state: { section },
      });
    }
  };

  // =========================
  // CART COUNT
  // =========================

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(
        localStorage.getItem("restrosphere_cart") || "[]"
      );

      const count = cart.reduce(
        (total: number, item: any) =>
          total + Number(item.quantity || 0),
        0
      );

      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();

    window.addEventListener(
      "cartUpdated",
      updateCartCount
    );

    window.addEventListener(
      "storage",
      updateCartCount
    );

    return () => {
      window.removeEventListener(
        "cartUpdated",
        updateCartCount
      );

      window.removeEventListener(
        "storage",
        updateCartCount
      );
    };
  }, []);

  // Close mobile menu after route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <nav className="bg-white border-b shadow-lg sticky top-0 z-50">

      {/* ================= DESKTOP / MOBILE HEADER ================= */}

      <div className="flex items-center justify-between px-5 sm:px-8 lg:px- py-3 sm:py-3">

        {/* LOGO */}
<div
  onClick={() => scrollToSection("home")}
  className="flex items-center gap-2 cursor-pointer"
>
  <img
    src={logo}
    alt="RestroSphere Logo"
    className="w-15 h-15 sm:w-18 sm:h-18 object-contain shrink-0"
  />

  <h1 className="text-1xl sm:text-3xl font-bold text-orange-700 leading-none">
    RestroSphere
  </h1>
</div>

        {/* ================= DESKTOP NAV ================= */}

        <div className="hidden lg:flex items-center">

          <ul className="flex items-center gap-6 xl:gap-8 text-base xl:text-lg">

            {/* HOME */}

            <li>
              <button
                onClick={() => {
                  if (location.pathname === "/") {
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  } else {
                    navigate("/");
                  }
                }}
                className="hover:text-orange-600 transition"
              >
                Home
              </button>
            </li>

            {/* MENU */}

            <li>
              <Link
                to="/menu"
                className="hover:text-orange-600 transition"
              >
                Menu
              </Link>
            </li>

            {/* ABOUT */}

            <li>
              <button
                onClick={() =>
                  scrollToSection("about")
                }
                className="hover:text-orange-600 transition"
              >
                About
              </button>
            </li>

            {/* FEATURES */}

            <li>
              <button
                onClick={() =>
                  scrollToSection("features")
                }
                className="hover:text-orange-600 transition"
              >
                Features
              </button>
            </li>

            {/* REVIEWS */}

            <li>
              <button
                onClick={() =>
                  scrollToSection("reviews")
                }
                className="hover:text-orange-600 transition"
              >
                Reviews
              </button>
            </li>

            {/* CONTACT */}

            <li>
              <button
                onClick={() =>
                  scrollToSection("contact")
                }
                className="hover:text-orange-600 transition"
              >
                Contact
              </button>
            </li>

          </ul>

          {/* DESKTOP BUTTONS */}

          <div className="flex items-center gap-3 xl:gap-5 ml-6 xl:ml-10">

            {/* CART ONLY ON MENU */}

            {location.pathname === "/menu" && (
              <button
                onClick={() => navigate("/cart")}
                className="relative flex items-center gap-2 hover:text-orange-600 transition"
              >
                <ShoppingCart size={21} />

                <span className="font-medium">
                  Cart
                </span>

                {cartCount > 0 && (
                  <span className="absolute -top-3 -right-3 min-w-[20px] h-5 px-1 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* LOGIN */}

            <Link to="/login">
              <button className="px-4 xl:px-5 py-2 border rounded-lg hover:bg-gray-100 transition">
                Login
              </button>
            </Link>

            {/* SIGN UP */}

            <Link to="/signup">
              <button className="px-4 xl:px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                Sign Up
              </button>
            </Link>

          </div>

        </div>

        {/* ================= MOBILE MENU BUTTON ================= */}

        <button
          type="button"
          onClick={() =>
            setMobileOpen((prev) => !prev)
          }
          className="lg:hidden w-11 h-11 rounded-xl flex items-center justify-center hover:bg-orange-50 text-gray-800 transition"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? (
            <X size={27} />
          ) : (
            <MenuIcon size={27} />
          )}
        </button>

      </div>

      {/* ================= MOBILE MENU ================= */}

      {mobileOpen && (
        <div className="lg:hidden border-t bg-white shadow-md">

          <div className="px-5 sm:px-8 py-5">

            <div className="flex flex-col gap-1">

              {/* HOME */}

              <button
                onClick={() => {
                  setMobileOpen(false);

                  if (location.pathname === "/") {
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  } else {
                    navigate("/");
                  }
                }}
                className="text-left px-4 py-3 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition font-medium"
              >
                Home
              </button>

              {/* MENU */}

              <Link
                to="/menu"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="px-4 py-3 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition font-medium"
              >
                Menu
              </Link>

              {/* ABOUT */}

              <button
                onClick={() =>
                  scrollToSection("about")
                }
                className="text-left px-4 py-3 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition font-medium"
              >
                About
              </button>

              {/* FEATURES */}

              <button
                onClick={() =>
                  scrollToSection("features")
                }
                className="text-left px-4 py-3 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition font-medium"
              >
                Features
              </button>

              {/* REVIEWS */}

              <button
                onClick={() =>
                  scrollToSection("reviews")
                }
                className="text-left px-4 py-3 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition font-medium"
              >
                Reviews
              </button>

              {/* CONTACT */}

              <button
                onClick={() =>
                  scrollToSection("contact")
                }
                className="text-left px-4 py-3 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition font-medium"
              >
                Contact
              </button>

              {/* CART ONLY ON MENU */}

              {location.pathname === "/menu" && (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/cart");
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition font-medium"
                >
                  <ShoppingCart size={20} />

                  <span>Cart</span>

                  {cartCount > 0 && (
                    <span className="min-w-[22px] h-[22px] px-1 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* DIVIDER */}

              <div className="border-t my-3" />

              {/* LOGIN */}

              <Link
                to="/login"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="w-full"
              >
                <button className="w-full py-3 border rounded-xl hover:bg-gray-100 transition font-medium">
                  Login
                </button>
              </Link>

              {/* SIGN UP */}

              <Link
                to="/signup"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="w-full"
              >
                <button className="w-full py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition font-medium">
                  Sign Up
                </button>
              </Link>

            </div>

          </div>

        </div>
      )}

    </nav>
  );
}

export default Navbar;