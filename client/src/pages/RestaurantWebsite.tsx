import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
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

type MenuItem = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image?: string;
  isAvailable?: boolean;
  veg?: boolean;
  rating?: number;
};

type Restaurant = {
  _id: string;
  name: string;
  slug: string;
  type?: string;
  logo?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  aboutTitle?: string;
  aboutText?: string;
  phone?: string;
  address?: string;
  email?: string;
  openingTime?: string;
  closingTime?: string;
  instagram?: string;
  facebook?: string;
};

function RestaurantWebsite() {
  const { slug } = useParams<{ slug: string }>();

  const [restaurant, setRestaurant] =
    useState<Restaurant | null>(null);

  const [menu, setMenu] =
    useState<MenuItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [menuLoading, setMenuLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [expired, setExpired] =
    useState(false);

  const [activeCategory, setActiveCategory] =
    useState("All");

  /* =========================
     LOAD RESTAURANT
  ========================= */

  useEffect(() => {
    if (!slug) return;

    const loadRestaurant = async () => {
      try {
        setLoading(true);
        setError("");
        setExpired(false);

        const response = await fetch(
          `/api/restaurants/public/${encodeURIComponent(
            slug
          )}`
        );

        const data =
          await response.json().catch(() => ({}));

        if (
          response.status === 403 &&
          data?.code ===
            "SUBSCRIPTION_EXPIRED"
        ) {
          setExpired(true);
          return;
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Restaurant website not found."
          );
        }

        setRestaurant(data?.data || null);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load restaurant website."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRestaurant();
  }, [slug]);

  /* =========================
     LOAD MENU
  ========================= */

  useEffect(() => {
    if (!restaurant?._id) return;

    const loadMenu = async () => {
      try {
        setMenuLoading(true);

        const urls = [
          `/api/menu/public?restaurantId=${encodeURIComponent(
            restaurant._id
          )}`,
          `/api/menu/public`,
          `/api/menu?restaurantId=${encodeURIComponent(
            restaurant._id
          )}`,
        ];

        let result: any = null;

        for (const url of urls) {
          try {
            const response =
              await fetch(url);

            if (!response.ok) continue;

            result =
              await response.json();

            break;
          } catch {
            continue;
          }
        }

        const items =
          Array.isArray(result)
            ? result
            : Array.isArray(result?.data)
            ? result.data
            : Array.isArray(result?.menu)
            ? result.menu
            : [];

        setMenu(
          items.filter(
            (item: MenuItem) =>
              item.isAvailable !== false
          )
        );
      } catch (error) {
        console.error(
          "PUBLIC MENU ERROR:",
          error
        );

        setMenu([]);
      } finally {
        setMenuLoading(false);
      }
    };

    loadMenu();
  }, [restaurant?._id]);

  /* =========================
     CATEGORIES
  ========================= */

  const categories = useMemo(() => {
    const values = menu
      .map((item) =>
        String(
          item.category || ""
        ).trim()
      )
      .filter(Boolean);

    return [
      "All",
      ...Array.from(
        new Set(values)
      ),
    ];
  }, [menu]);

  /* =========================
     FILTER MENU
  ========================= */

  const filteredMenu = useMemo(() => {
    if (
      activeCategory === "All"
    ) {
      return menu;
    }

    return menu.filter(
      (item) =>
        String(
          item.category || ""
        ).toLowerCase() ===
        activeCategory.toLowerCase()
    );
  }, [
    menu,
    activeCategory,
  ]);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffaf5]">
        <div className="text-center">
          <Loader2
            size={34}
            className="mx-auto text-orange-500 animate-spin"
          />

          <p className="mt-3 text-sm text-gray-500">
            Loading restaurant...
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     EXPIRED
  ========================= */

  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffaf5] px-5">
        <div className="w-full max-w-lg rounded-3xl bg-white border border-gray-200 p-8 sm:p-10 text-center shadow-sm">

          <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-2xl">
            🔒
          </div>

          <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold text-[#172033]">
            Website Temporarily Unavailable
          </h1>

          <p className="mt-3 text-sm sm:text-base text-gray-500 leading-6">
            This restaurant website subscription
            has expired. Please contact the
            restaurant for more information.
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffaf5] px-5">

        <div className="w-full max-w-lg rounded-3xl bg-white border border-gray-200 p-8 text-center">

          <Utensils
            size={38}
            className="mx-auto text-orange-500"
          />

          <h1 className="mt-5 text-2xl font-extrabold text-[#172033]">
            Restaurant not found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error ||
              "This restaurant website could not be loaded."}
          </p>

          <Link
            to="/"
            className="inline-flex mt-6 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
          >
            Go to RestroSphere
          </Link>

        </div>
      </div>
    );
  }

  const logo =
    restaurant.logo || "";

  const heroImage =
    restaurant.heroImage || "";

  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#172033]">

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 backdrop-blur">

        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between gap-5">

          <a
            href="#home"
            className="flex items-center gap-3 min-w-0"
          >
            {logo ? (
              <img
                src={logo}
                alt={`${restaurant.name} logo`}
                className="w-11 h-11 rounded-xl object-contain bg-white border border-gray-100"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <Utensils size={22} />
              </div>
            )}

            <span className="font-extrabold text-lg sm:text-xl truncate">
              {restaurant.name}
            </span>
          </a>

<nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-gray-600 ml-auto">
                <a
              href="#home"
              className="hover:text-orange-500"
            >
              Home
            </a>

            <a
              href="#menu"
              className="hover:text-orange-500"
            >
              Menu
            </a>

            <a
              href="#about"
              className="hover:text-orange-500"
            >
              About
            </a>

            <a
              href="#contact"
              className="hover:text-orange-500"
            >
              Contact
            </a>
          </nav>

          
<div className="flex items-center gap-2">
  <a
    href={`/r/${restaurant.slug}/login`}
    className="rounded-xl border border-gray-300 px-4 sm:px-5 py-2.5 text-sm font-bold text-gray-800 hover:border-orange-500 hover:text-orange-500"
  >
    Login
  </a>

  <a
    href={`/r/${restaurant.slug}/signup`}
    className="rounded-xl bg-orange-500 px-4 sm:px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
  >
    Sign Up
  </a>
</div>
        </div>
      </header>

      {/* =========================
          HERO
      ========================= */}

      <section
        id="home"
        className="relative overflow-hidden"
      >
        <div className="min-h-[620px] sm:min-h-[680px] relative flex items-center">

          {heroImage ? (
            <img
              src={heroImage}
              alt={`${restaurant.name} restaurant`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#24160e] via-[#5a2d15] to-[#ff6500]" />
          )}

          <div className="absolute inset-0 bg-black/55" />

          <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-8 py-20">

            <div className="max-w-3xl text-white">

              <p className="text-xs sm:text-sm uppercase tracking-[0.28em] font-bold text-orange-300">
                {restaurant.type ||
                  "Restaurant"}
              </p>

              <h1 className="mt-5 text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.02] tracking-tight">
                {restaurant.heroTitle ||
                  `Welcome to ${restaurant.name}`}
              </h1>

              <p className="mt-6 max-w-2xl text-base sm:text-lg leading-7 text-white/85">
                {restaurant.heroSubtitle ||
                  "Freshly prepared food, warm hospitality, and unforgettable moments."}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">

                <a
                  href="#menu"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-extrabold text-white hover:bg-orange-600"
                >
                  Explore Menu
                  <ArrowRight size={17} />
                </a>

                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/50 bg-white/10 backdrop-blur px-6 py-3.5 text-sm font-extrabold text-white hover:bg-white/15"
                >
                  <CalendarDays size={17} />
                  Reserve a Table
                </a>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================
          ABOUT
      ========================= */}

      <section
        id="about"
        className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-24"
      >

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          <div>

            <p className="text-xs uppercase tracking-[0.2em] font-bold text-orange-500">
              Our Story
            </p>

            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold">
              {restaurant.aboutTitle ||
                `About ${restaurant.name}`}
            </h2>

            <p className="mt-5 text-base leading-8 text-gray-600 whitespace-pre-line">
              {restaurant.aboutText ||
                `${restaurant.name} brings delicious food, warm hospitality and memorable dining experiences to every guest.`}
            </p>

          </div>

          <div className="rounded-3xl bg-white border border-gray-200 p-6 sm:p-8">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <InfoCard
                icon={<MapPin size={19} />}
                title="Visit Us"
                value={
                  restaurant.address ||
                  "Address available soon"
                }
              />

              <InfoCard
                icon={<Phone size={19} />}
                title="Call Us"
                value={
                  restaurant.phone ||
                  "Phone available soon"
                }
              />

              <InfoCard
                icon={<Clock3 size={19} />}
                title="Opening Hours"
                value={`${restaurant.openingTime || "10:00"} – ${
                  restaurant.closingTime || "23:00"
                }`}
              />

              <InfoCard
                icon={<Mail size={19} />}
                title="Email"
                value={
                  restaurant.email ||
                  "Email available soon"
                }
              />

            </div>

          </div>

        </div>

      </section>

      {/* =========================
          MENU
      ========================= */}

      <section
        id="menu"
        className="bg-white border-y border-gray-200"
      >

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-24">

          <div className="text-center max-w-2xl mx-auto">

            <p className="text-xs uppercase tracking-[0.2em] font-bold text-orange-500">
              Our Menu
            </p>

            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold">
              Made to be enjoyed
            </h2>

            <p className="mt-3 text-sm sm:text-base text-gray-500">
              Explore dishes prepared specially
              for your restaurant's guests.
            </p>

          </div>

          {/* CATEGORIES */}

          {categories.length > 1 && (
            <div className="mt-8 flex gap-2 overflow-x-auto pb-2 justify-center">

              {categories.map(
                (category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      setActiveCategory(
                        category
                      )
                    }
                    className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                      activeCategory ===
                      category
                        ? "bg-orange-500 text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    {category}
                  </button>
                )
              )}

            </div>
          )}

          {/* MENU LOADING */}

          {menuLoading ? (
            <div className="py-16 text-center text-gray-400">

              <Loader2
                size={28}
                className="mx-auto animate-spin text-orange-500"
              />

              <p className="mt-3 text-sm">
                Loading menu...
              </p>

            </div>
          ) : filteredMenu.length === 0 ? (

            <div className="mt-10 rounded-3xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">

              <Utensils
                size={36}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 font-bold text-gray-600">
                Menu coming soon
              </p>

              <p className="mt-1 text-sm text-gray-400">
                The restaurant hasn't added
                available dishes yet.
              </p>

            </div>

          ) : (

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {filteredMenu.map(
                (item) => (
                  <article
                    key={item._id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white hover:-translate-y-0.5 hover:shadow-lg transition"
                  >

                    <div className="h-56 bg-gray-50 overflow-hidden">

                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-orange-400">
                          <Utensils
                            size={38}
                          />
                        </div>
                      )}

                    </div>

                    <div className="p-5">

                      <div className="flex items-start justify-between gap-3">

                        <h3 className="text-lg font-extrabold">
                          {item.name}
                        </h3>

                        {item.veg !==
                          undefined && (
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              item.veg
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-500"
                            }`}
                          >
                            {item.veg
                              ? "VEG"
                              : "NON-VEG"}
                          </span>
                        )}

                      </div>

                      <p className="mt-2 text-sm leading-6 text-gray-500 line-clamp-2">
                        {item.description ||
                          "Freshly prepared for you."}
                      </p>

                      <div className="mt-5 flex items-center justify-between">

                        <span className="text-lg font-extrabold">
                          ₹
                          {Number(
                            item.price || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>

                        <span className="text-xs font-bold text-orange-500">
                          {item.category ||
                            "Special"}
                        </span>

                      </div>

                    </div>

                  </article>
                )
              )}

            </div>
          )}

        </div>
      </section>

      {/* =========================
          CONTACT
      ========================= */}

      <section
        id="contact"
        className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-24"
      >

        <div className="rounded-3xl bg-[#172033] text-white p-7 sm:p-10 lg:p-12">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] font-bold text-orange-300">
                Get in Touch
              </p>

              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold">
                Visit {restaurant.name}
              </h2>

              <p className="mt-4 text-white/65 leading-7">
                We look forward to welcoming
                you. Contact the restaurant for
                reservations, timings or any
                questions.
              </p>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <ContactItem
                icon={<MapPin size={18} />}
                value={
                  restaurant.address ||
                  "Address available soon"
                }
              />

              <ContactItem
                icon={<Phone size={18} />}
                value={
                  restaurant.phone ||
                  "Phone available soon"
                }
              />

              <ContactItem
                icon={<Mail size={18} />}
                value={
                  restaurant.email ||
                  "Email available soon"
                }
              />

              <ContactItem
                icon={<Clock3 size={18} />}
                value={`${restaurant.openingTime || "10:00"} – ${
                  restaurant.closingTime || "23:00"
                }`}
              />

            </div>

          </div>

          {(restaurant.instagram ||
            restaurant.facebook) && (
            <div className="mt-8 pt-6 border-t border-white/10 flex gap-3">

              {restaurant.instagram && (
                <a
                  href={
                    restaurant.instagram
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center hover:bg-orange-500 transition"
                >
                  <span className="text-sm font-extrabold">IG</span>
                </a>
              )}

              {restaurant.facebook && (
                <a
                  href={
                    restaurant.facebook
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center hover:bg-orange-500 transition"
                >
                  <span className="text-sm font-extrabold">f</span>
                </a>
              )}

            </div>
          )}

        </div>

      </section>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="border-t border-gray-200 bg-white">

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-7 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-gray-400">

          <p>
            © {new Date().getFullYear()}{" "}
            {restaurant.name}. All rights
            reserved.
          </p>

          <p>
            Powered by RestroSphere
          </p>

        </div>

      </footer>

    </div>
  );
}

/* =========================
   INFO CARD
========================= */

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">

      <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
        {icon}
      </div>

      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-gray-400">
        {title}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-700 break-words">
        {value}
      </p>

    </div>
  );
}

/* =========================
   CONTACT ITEM
========================= */

function ContactItem({
  icon,
  value,
}: {
  icon: ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-4">

      <div className="text-orange-300 mt-0.5 shrink-0">
        {icon}
      </div>

      <p className="text-sm text-white/75 leading-6">
        {value}
      </p>

    </div>
  );
}

export default RestaurantWebsite;