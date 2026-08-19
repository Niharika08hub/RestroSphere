import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ChevronRight,
} from "lucide-react";

type CartItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  veg: boolean;
};

const CART_KEY = "restrosphere_cart";

const readCart = (): CartItem[] => {
  try {
    const data = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>(readCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  }, [cart]);

  const changeQty = (id: string, amount: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity + amount,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    [cart]
  );

  const deliveryFee = subtotal > 0 ? 40 : 0;
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + taxes;

  const placeOrder = () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        state: {
          message:
            "Please login or signup to place your order.",
        },
      });
      return;
    }

    // Next phase: real checkout/order API
    alert("You are logged in. Checkout will be connected next.");
  };

  if (!cart.length) {
    return (
      <div className="min-h-screen bg-[#FCF8F3]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600"
          >
            <ArrowLeft size={19} />
            Back to Menu
          </Link>

          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center">
              <ShoppingBag
                size={42}
                className="text-orange-500"
              />
            </div>

            <h1 className="text-4xl font-black mt-7">
              Your cart is empty
            </h1>

            <p className="text-gray-500 mt-3">
              Add something delicious from our menu.
            </p>

            <button
              onClick={() => navigate("/menu")}
              className="mt-8 px-9 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-lg hover:scale-[1.02] transition"
            >
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCF8F3]">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            to="/menu"
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium"
          >
            <ArrowLeft size={19} />
            Continue Shopping
          </Link>

          <div className="font-black text-xl">
            Restro<span className="text-orange-500">Sphere</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="uppercase tracking-[5px] text-orange-500 text-sm font-bold">
            YOUR ORDER
          </p>

          <h1 className="text-4xl sm:text-5xl font-black mt-2">
            Your Cart
          </h1>

          <p className="text-gray-500 mt-2">
            Review your items before placing your order.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_390px] gap-8">
          {/* CART ITEMS */}
          <section className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
              >
                <div className="flex gap-5">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover"
                  />

                  <div className="flex-1">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold">
                          {item.name}
                        </h2>

                        {item.veg && (
                          <span className="inline-block mt-2 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-semibold">
                            VEG
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={19} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-7">
                      <p className="text-xl font-bold text-orange-600">
                        ₹{item.price * item.quantity}
                      </p>

                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() =>
                            changeQty(item.id, -1)
                          }
                          className="w-10 h-10 flex items-center justify-center hover:bg-orange-50"
                        >
                          <Minus size={17} />
                        </button>

                        <span className="w-10 text-center font-bold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            changeQty(item.id, 1)
                          }
                          className="w-10 h-10 flex items-center justify-center hover:bg-orange-50"
                        >
                          <Plus size={17} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link
              to="/menu"
              className="inline-flex items-center gap-1 text-orange-600 font-semibold mt-3"
            >
              Add more items
              <ChevronRight size={18} />
            </Link>
          </section>

          {/* BILL */}
          <aside>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-7 lg:sticky lg:top-6">
              <h2 className="text-2xl font-black">
                Bill Details
              </h2>

              <div className="space-y-4 mt-7 text-gray-600">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>

                <div className="flex justify-between">
                  <span>Taxes & Charges</span>
                  <span>₹{taxes}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-6 pt-5 flex justify-between">
                <span className="text-lg font-bold">
                  To Pay
                </span>

                <span className="text-2xl font-black text-orange-600">
                  ₹{total}
                </span>
              </div>

              <button
                onClick={placeOrder}
                className="w-full mt-7 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg shadow-lg hover:scale-[1.01] transition"
              >
                Login / Signup to Place Order
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Login is required only when you place the order.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}