import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Star,
  ShoppingCart,
  Leaf,
} from "lucide-react";

import {
  getPublicMenu,
  type PublicMenuItem,
} from "../../services/menuService";

// all
import pizza from "../../assets/images/pizza.jpg";
import burger from "../../assets/images/burger.jpg";
import pasta from "../../assets/images/pasta.jpg";
import dessert from "../../assets/images/dessert.jpg";

// pizza
import margherita from "../../assets/images/margherita.jpg";
import farmhouse from "../../assets/images/farmhouse.jpg";
import cheeseburst from "../../assets/images/cheeseburst.jpg";
import veggiedelight from "../../assets/images/veggiedelight.jpg";

// burger
import cheeseburger from "../../assets/images/cheeseburger.jpg";
import doublepatty from "../../assets/images/doublepatty.jpg";
import crispyburger from "../../assets/images/crispyburger.jpg";

// pasta
import redsaucepasta from "../../assets/images/redsaucepasta.jpg";
import pastaAlfredo from "../../assets/images/pastaAlfredo.jpg";
import pesto from "../../assets/images/pesto.jpg";

// main course
import paneerbuttermasala from "../../assets/images/paneerbuttermasala.jpg";
import vegbiryani from "../../assets/images/vegbiryani.jpg";
import dalmakhani from "../../assets/images/dalmakhani.jpg";
import malaichaap from "../../assets/images/malaichaap.jpg";

// Starters
import paneertikka from "../../assets/images/paneertikka.jpg";
import springroll from "../../assets/images/springroll.jpg";
import garlicbread from "../../assets/images/garlicbread.jpg";
import crispycorn from "../../assets/images/crispycorn.jpg";

// Desserts
import brownie from "../../assets/images/brownie.jpg";
import cheesecake from "../../assets/images/cheesecake.jpg";
import icecream from "../../assets/images/icecream.jpg";

// Drinks
import coldcoffee from "../../assets/images/coldcoffee.jpg";
import mojito from "../../assets/images/mojito.jpg";
import oreo from "../../assets/images/oreo.jpg";
import watermelon from "../../assets/images/watermelon.jpg";

const menu = {
  All: [
    {
      image: pizza,
      name: "Overloaded Pizza",
      desc: "Classic Italian pizza with mozzarella cheese.",
      price: "₹349",
      rating: "4.8",
      veg: true,
    },
    {
      image: burger,
      name: "Veg Supreme Burger",
      desc: "fresh veggies and cheese.",
      price: "₹229",
      rating: "4.7",
      veg: true,
    },
    {
      image: pasta,
      name: "White Sauce Pasta",
      desc: "Creamy pasta with herbs & parmesan.",
      price: "₹299",
      rating: "4.9",
      veg: true,
    },
    {
      image: dessert,
      name: "Chocolate Lava Cake",
      desc: "Warm chocolate cake with molten center.",
      price: "₹189",
      rating: "4.9",
      veg: true,
    },
    {
      image: dalmakhani,
      name: "Dal Makhani",
      desc: "Slow cooked black lentils.",
      price: "₹269",
      rating: "4.7",
      veg: true,
    },
    {
      image: oreo,
      name: "Oreo Shake",
      desc: "Creamy Oreo milkshake.",
      price: "₹179",
      rating: "4.9",
      veg: true,
    },
  ],

  Pizza: [
    {
      image: margherita,
      name: "Margherita Pizza",
      desc: "Fresh mozzarella & basil.",
      price: "₹299",
      rating: "4.8",
      veg: true,
    },
    {
      image: farmhouse,
      name: "Farmhouse Pizza",
      desc: "Loaded with fresh veggies.",
      price: "₹349",
      rating: "4.9",
      veg: true,
    },
    {
      image: cheeseburst,
      name: "Cheese Burst Pizza",
      desc: "Extra cheesy delight.",
      price: "₹399",
      rating: "4.9",
      veg: true,
    },
    {
      image: veggiedelight,
      name: "Veggie Delight Pizza",
      desc: "Loaded with colorful veggies.",
      price: "₹329",
      rating: "4.7",
      veg: true,
    },
  ],

  Burgers: [
    {
      image: burger,
      name: "Veg Supreme Burger",
      desc: "Loaded with fresh veggies and cheese.",
      price: "₹229",
      rating: "4.7",
      veg: true,
    },
    {
      image: cheeseburger,
      name: "Cheese Burger",
      desc: "Cheesy & delicious.",
      price: "₹249",
      rating: "4.8",
      veg: true,
    },
    {
      image: doublepatty,
      name: "Double Patty Burger",
      desc: "Double layer of goodness.",
      price: "₹299",
      rating: "4.9",
      veg: true,
    },
    {
      image: crispyburger,
      name: "Crispy Burger",
      desc: "Crunchy & tasty.",
      price: "₹259",
      rating: "4.8",
      veg: true,
    },
  ],

  Pasta: [
    {
      image: pasta,
      name: "White Sauce Pasta",
      desc: "Creamy pasta with herbs & parmesan.",
      price: "₹299",
      rating: "4.9",
      veg: true,
    },
    {
      image: redsaucepasta,
      name: "Red Sauce Pasta",
      desc: "Classic Italian tomato sauce with basil and parmesan.",
      price: "₹279",
      rating: "4.8",
      veg: true,
    },
    {
      image: pastaAlfredo,
      name: "Alfredo Pasta",
      desc: "Rich creamy pasta topped with mushrooms.",
      price: "₹329",
      rating: "4.9",
      veg: true,
    },
    {
      image: pesto,
      name: "Pesto Pasta",
      desc: "parmesan cheese & roasted vegetables.",
      price: "₹319",
      rating: "4.8",
      veg: true,
    },
  ],

  Starters: [
    {
      image: paneertikka,
      name: "Paneer Tikka",
      desc: "Grilled paneer with Indian spices.",
      price: "₹249",
      rating: "4.8",
      veg: true,
    },
    {
      image: springroll,
      name: "Veg Spring Rolls",
      desc: "Stuffed with vegetables.",
      price: "₹199",
      rating: "4.7",
      veg: true,
    },
    {
      image: garlicbread,
      name: "Garlic Bread",
      desc: "Freshly baked garlic bread.",
      price: "₹149",
      rating: "4.8",
      veg: true,
    },
    {
      image: crispycorn,
      name: "Crispy Corn",
      desc: "Golden fried crunchy corn.",
      price: "₹179",
      rating: "4.7",
      veg: true,
    },
  ],

  "Main Course": [
    {
      image: paneerbuttermasala,
      name: "Paneer Butter Masala",
      desc: "Rich creamy tomato gravy.",
      price: "₹329",
      rating: "4.9",
      veg: true,
    },
    {
      image: vegbiryani,
      name: "Veg Biryani",
      desc: "Fragrant rice with vegetables.",
      price: "₹299",
      rating: "4.8",
      veg: true,
    },
    {
      image: dalmakhani,
      name: "Dal Makhani",
      desc: "Slow cooked black lentils.",
      price: "₹269",
      rating: "4.7",
      veg: true,
    },
    {
      image: malaichaap,
      name: "Malai Chaap",
      desc: "Creamy soya chaap",
      price: "₹329",
      rating: "4.9",
      veg: true,
    },
  ],

  Desserts: [
    {
      image: dessert,
      name: "Chocolate Lava Cake",
      desc: "Warm chocolate cake with molten center.",
      price: "₹189",
      rating: "4.9",
      veg: true,
    },
    {
      image: brownie,
      name: "Chocolate Brownie",
      desc: "Rich chocolate brownie.",
      price: "₹179",
      rating: "4.8",
      veg: true,
    },
    {
      image: cheesecake,
      name: "Cheesecake",
      desc: "Creamy baked cheesecake.",
      price: "₹249",
      rating: "4.9",
      veg: true,
    },
    {
      image: icecream,
      name: "Ice Cream Sundae",
      desc: "Vanilla ice cream with chocolate syrup.",
      price: "₹159",
      rating: "4.7",
      veg: true,
    },
  ],

  Drinks: [
    {
      image: coldcoffee,
      name: "Cold Coffee",
      desc: "Chilled coffee with ice cream.",
      price: "₹149",
      rating: "4.8",
      veg: true,
    },
    {
      image: mojito,
      name: "Virgin Mojito",
      desc: "Refreshing mint & lime drink.",
      price: "₹129",
      rating: "4.8",
      veg: true,
    },
    {
      image: oreo,
      name: "Oreo Shake",
      desc: "Creamy Oreo milkshake.",
      price: "₹179",
      rating: "4.9",
      veg: true,
    },
    {
      image: watermelon,
      name: "Watermelon Juice",
      desc: "Fresh watermelon juice",
      price: "₹139",
      rating: "4.8",
      veg: true,
    },
  ],
};

type Props = {
  category: string;
  search: string;
};

type CartItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  veg: boolean;
};

const CART_KEY = "restrosphere_cart";

// =====================================
// DATA HELPERS ONLY
// UI IS NOT CHANGED
// =====================================

const normalizeCategory = (value: string) => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ");

  if (normalized === "all") return "All";
  if (normalized === "pizza") return "Pizza";
  if (
    normalized === "burger" ||
    normalized === "burgers"
  ) {
    return "Burgers";
  }
  if (normalized === "pasta") return "Pasta";
  if (
    normalized === "starter" ||
    normalized === "starters"
  ) {
    return "Starters";
  }
  if (
    normalized === "main course" ||
    normalized === "maincourse"
  ) {
    return "Main Course";
  }
  if (
    normalized === "dessert" ||
    normalized === "desserts"
  ) {
    return "Desserts";
  }
  if (
    normalized === "drink" ||
    normalized === "drinks"
  ) {
    return "Drinks";
  }

  return value;
};

const imageMap: Record<string, string> = {
  "pizza.jpg": pizza,
  "burger.jpg": burger,
  "pasta.jpg": pasta,
  "dessert.jpg": dessert,

  "margherita.jpg": margherita,
  "farmhouse.jpg": farmhouse,
  "cheeseburst.jpg": cheeseburst,
  "veggiedelight.jpg": veggiedelight,

  "cheeseburger.jpg": cheeseburger,
  "doublepatty.jpg": doublepatty,
  "crispyburger.jpg": crispyburger,

  "redsaucepasta.jpg": redsaucepasta,
  "pastaAlfredo.jpg": pastaAlfredo,
  "pesto.jpg": pesto,

  "paneerbuttermasala.jpg": paneerbuttermasala,
  "vegbiryani.jpg": vegbiryani,
  "dalmakhani.jpg": dalmakhani,
  "malaichaap.jpg": malaichaap,

  "paneertikka.jpg": paneertikka,
  "springroll.jpg": springroll,
  "garlicbread.jpg": garlicbread,
  "crispycorn.jpg": crispycorn,

  "brownie.jpg": brownie,
  "cheesecake.jpg": cheesecake,
  "icecream.jpg": icecream,

  "coldcoffee.jpg": coldcoffee,
  "mojito.jpg": mojito,
  "oreo.jpg": oreo,
  "watermelon.jpg": watermelon,
};

const resolveImage = (image: string) => {
  if (!image) return "";

  const fileName =
    image.split("/").pop() || image;

  return imageMap[fileName] || image;
};

// Find the old local category for an existing item
// when MongoDB has category "all".
const getLocalCategory = (name: string) => {
  const categories = [
    "Pizza",
    "Burgers",
    "Pasta",
    "Starters",
    "Main Course",
    "Desserts",
    "Drinks",
  ] as const;

  for (const categoryName of categories) {
    const found = menu[categoryName].some(
      (item) => item.name === name
    );

    if (found) {
      return categoryName;
    }
  }

  return "All";
};

function FeaturedDishes({
  category,
  search,
}: Props) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // =====================================
  // LIVE MONGODB MENU
  // =====================================

  const [liveMenu, setLiveMenu] = useState<
    PublicMenuItem[] | null
  >(null);

  const sliderRef =
    useRef<HTMLDivElement>(null);

  // =====================================
  // LOAD REAL MENU DATA
  // =====================================

  const loadLiveMenu = async () => {
    try {
      const data = await getPublicMenu();

      setLiveMenu(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "PUBLIC MENU LOAD ERROR:",
        error
      );

      // Keep existing UI/data if API is temporarily unavailable.
      setLiveMenu(null);
    }
  };

  useEffect(() => {
    loadLiveMenu();

    const interval = window.setInterval(() => {
      loadLiveMenu();
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  // =====================================
  // EXISTING MENU DATA
  // FALLBACK ONLY
  // =====================================

  const staticDishes =
    menu[category as keyof typeof menu] ||
    menu.All;

  // =====================================
  // LIVE DATA → SAME EXISTING UI FORMAT
  // =====================================

  const liveDishes = liveMenu
    ? liveMenu
        .filter(
          (item) =>
            item.isAvailable !== false
        )
        .map((item) => {
          const localCategory =
            getLocalCategory(item.name);

          const itemCategory =
            normalizeCategory(
              item.category || "All"
            );

          const finalCategory =
            itemCategory === "All"
              ? localCategory
              : itemCategory;

          return {
            image: resolveImage(item.image),
            name: item.name,
            desc:
              item.description ||
              "No description available.",
            price: `₹${item.price}`,
            rating: String(
              item.rating || 4.5
            ),
            veg: Boolean(item.veg),
            category: finalCategory,
          };
        })
    : null;

  // =====================================
  // CATEGORY FILTER
  // =====================================

  const selectedCategory =
    normalizeCategory(category);

  const dishes = liveDishes
    ? liveDishes.filter((dish) => {
        if (selectedCategory === "All") {
          return true;
        }

        return (
          normalizeCategory(
            dish.category
          ) === selectedCategory
        );
      })
    : staticDishes;

  // =====================================
  // SEARCH
  // =====================================

  const filteredDishes = dishes.filter((dish) =>
    dish.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // =====================================
  // CART
  // =====================================

  const saveCart = (
    updatedCart: CartItem[]
  ) => {
    setCart(updatedCart);

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  };

  const getQuantity = (name: string) => {
    const item = cart.find(
      (cartItem) =>
        cartItem.name === name
    );

    return item?.quantity || 0;
  };

  const addToCart = (
    dish: (typeof menu.All)[number]
  ) => {
    const existingItem = cart.find(
      (item) =>
        item.name === dish.name
    );

    if (existingItem) {
      const updatedCart = cart.map(
        (item) =>
          item.name === dish.name
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
      );

      saveCart(updatedCart);
      return;
    }

    const newItem: CartItem = {
      id: dish.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      name: dish.name,
      image: dish.image,
      price: Number(
        dish.price.replace("₹", "")
      ),
      quantity: 1,
      veg: dish.veg,
    };

    saveCart([
      ...cart,
      newItem,
    ]);
  };

  const decreaseCart = (
    name: string
  ) => {
    const updatedCart = cart
      .map((item) =>
        item.name === name
          ? {
              ...item,
              quantity:
                item.quantity - 1,
            }
          : item
      )
      .filter(
        (item) =>
          item.quantity > 0
      );

    saveCart(updatedCart);
  };

  // =====================================
  // SLIDER
  // =====================================

 const scrollLeft = () => {
  sliderRef.current?.scrollBy({
    left: -308,
    behavior: "smooth",
  });
};

const scrollRight = () => {
  sliderRef.current?.scrollBy({
    left: 308,
    behavior: "smooth",
  });
};
  // =====================================
  // UI — EXACTLY SAME
  // =====================================

  return (
    <section className="bg-[#FCF8F3] pb-24">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex justify-end gap-2 mb-2 -mt-12">

          <button
            onClick={scrollLeft}
            className="w-9 h-9 rounded-full bg-white shadow-md hover:bg-orange-500 hover:text-white transition"
          >
            <ChevronLeft
              className="mx-auto"
              size={20}
            />
          </button>

          <button
            onClick={scrollRight}
            className="w-9 h-9 rounded-full bg-white shadow-md hover:bg-orange-500 hover:text-white transition"
          >
            <ChevronRight
              className="mx-auto"
              size={20}
            />
          </button>

        </div>

        <div
          ref={sliderRef}
  className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar"
        >

          {filteredDishes.map((dish) => {
            const quantity =
              getQuantity(dish.name);

            return (
              <div
                key={dish.name}
                className="min-w-[280px] max-w-[280px] flex-shrink-0 bg-white rounded-3xl shadow-lg overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition duration-300 snap-start"
              >

                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-60 object-cover"
                />

                <div className="p-6">

                  <div className="flex justify-between items-center">

                    <div className="flex items-center gap-1 text-orange-500">
                      <Star
                        size={18}
                        fill="currentColor"
                      />

                      <span className="font-semibold">
                        {dish.rating}
                      </span>
                    </div>

                  </div>

                  <h3 className="text-2xl font-bold mt-4">
                    {dish.name}
                  </h3>

                  <p className="text-gray-600 mt-3 leading-7">
                    {dish.desc}
                  </p>

                  <div className="flex justify-between items-center mt-6">

                    <h4 className="text-2xl font-bold text-orange-600">
                      {dish.price}
                    </h4>

                    {dish.veg && (
                      <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

                        <Leaf size={14} />

                        Veg

                      </div>
                    )}

                  </div>

                  {quantity === 0 ? (

                    <button
                      onClick={() =>
                        addToCart(dish)
                      }
                      className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition"
                    >

                      <ShoppingCart size={18} />

                      Add to Cart

                    </button>

                  ) : (

                    <div className="w-full mt-6 bg-orange-600 text-white py-3 rounded-xl flex items-center justify-center gap-7">

                      <button
                        type="button"
                        onClick={() =>
                          decreaseCart(
                            dish.name
                          )
                        }
                        className="w-9 h-9 rounded-full bg-white text-orange-600 text-xl font-bold flex items-center justify-center hover:bg-orange-50 transition"
                      >
                        −
                      </button>

                      <span className="text-lg font-bold min-w-[20px] text-center">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          addToCart(dish)
                        }
                        className="w-9 h-9 rounded-full bg-white text-orange-600 text-xl font-bold flex items-center justify-center hover:bg-orange-50 transition"
                      >
                        +
                      </button>

                    </div>

                  )}

                </div>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}

export default FeaturedDishes;