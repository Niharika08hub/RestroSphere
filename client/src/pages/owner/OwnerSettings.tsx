import { useEffect, useState } from "react";
import {
  Save,
  RefreshCw,
  Store,
  UserRound,
  Clock3,
  Bell,
  ShieldCheck,
  Globe,
} from "lucide-react";

import {
  getRestaurantSettings,
  updateRestaurantSettings,
  type RestaurantSettings,
} from "../../services/restaurantService";

type WebsiteCustomizationFields = {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  aboutTitle: string;
  aboutText: string;
  instagram: string;
  facebook: string;
};

type OwnerRestaurantSettings =
  RestaurantSettings & WebsiteCustomizationFields;

function OwnerSettings() {
  const [settings, setSettings] =
    useState<OwnerRestaurantSettings | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState("restaurant");

    const [subscription, setSubscription] =
  useState<any>(null);

const [subscriptionLoading, setSubscriptionLoading] =
  useState(true);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const response =
        await getRestaurantSettings();

      setSettings(
        response.data
          ? (response.data as OwnerRestaurantSettings)
          : null
      );
    } catch (error: any) {
      console.error(
        "LOAD SETTINGS ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to load restaurant settings."
      );
    } finally {
      setLoading(false);
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

    const response = await fetch(
      "/api/subscriptions/me",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      setSubscription(null);
      return;
    }

    const data = await response.json();

    setSubscription(
      data.subscription || null
    );
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
  loadSettings();
  loadSubscription();
}, []);

const hasActiveSubscription =
  (
    subscription?.status === "active" &&
    subscription?.endDate &&
    new Date(subscription.endDate) > new Date()
  ) ||
  (
    (settings as any)?.subscription?.status === "active" &&
    (settings as any)?.subscription?.endDate &&
    new Date((settings as any).subscription.endDate) > new Date()
  );

useEffect(() => {
  if (
    !subscriptionLoading &&
    !hasActiveSubscription &&
    activeSection === "website"
  ) {
    setActiveSection("restaurant");
  }
}, [
  subscriptionLoading,
  hasActiveSubscription,
  activeSection,
]);

  const updateField = (
    field: keyof OwnerRestaurantSettings,
    value: any
  ) => {
    setSettings((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
  };

  const updateNotificationPreference = (
    field:
      | "newOrders"
      | "reservations"
      | "inventoryAlerts"
      | "employeeUpdates",
    value: boolean
  ) => {
    setSettings((current) =>
      current
        ? {
            ...current,
            notificationPreferences: {
              ...current.notificationPreferences,
              [field]: value,
            },
          }
        : current
    );
  };

const handleSave = async () => {
  if (!settings) return;

  if (!hasActiveSubscription) {
    alert(
      "Please subscribe to a RestroSphere plan to customize your restaurant website."
    );
    return;
  }

    try {
      setSaving(true);

      const response =
        await updateRestaurantSettings({
          name: settings.name,
          type: settings.type,
          logo: settings.logo,
          email: settings.email,
          phone: settings.phone,
          address: settings.address,
          openingTime: settings.openingTime,
          closingTime: settings.closingTime,

          // Website customization
          heroTitle: settings.heroTitle,
          heroSubtitle: settings.heroSubtitle,
          heroImage: settings.heroImage,
          aboutTitle: settings.aboutTitle,
          aboutText: settings.aboutText,
          instagram: settings.instagram,
          facebook: settings.facebook,

          acceptsOrders:
            settings.acceptsOrders,
          acceptsReservations:
            settings.acceptsReservations,
          notificationPreferences:
            settings.notificationPreferences,
        } as any);

      if (response.data) {
        setSettings(
          response.data as OwnerRestaurantSettings
        );
      }

      alert(
        response.message ||
          "Settings saved successfully."
      );
    } catch (error: any) {
      console.error(
        "SAVE SETTINGS ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="
          w-full
          min-h-screen
          bg-[#f7f7f8]
          -mt-8
          flex
          items-center
          justify-center
        "
      >
        <div className="text-center">
          <RefreshCw
            size={32}
            className="
              mx-auto
              text-orange-500
              animate-spin
            "
          />

          <p
            className="
              mt-3
              text-sm
              text-gray-500
            "
          >
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div
        className="
          w-full
          min-h-screen
          bg-[#f7f7f8]
          -mt-8
          flex
          items-center
          justify-center
          px-4
        "
      >
        <div
          className="
            bg-white
            border
            border-gray-200
            rounded-2xl
            p-8
            text-center
            max-w-md
            w-full
          "
        >
          <Store
            size={40}
            className="
              mx-auto
              text-gray-300
            "
          />

          <h2
            className="
              mt-4
              text-lg
              font-bold
              text-gray-700
            "
          >
            Restaurant not found
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-gray-400
            "
          >
            Unable to load your restaurant
            settings.
          </p>

          <button
            type="button"
            onClick={loadSettings}
            className="
              mt-5
              px-5
              h-10
              rounded-xl
              bg-orange-500
              text-white
              text-sm
              font-semibold
              hover:bg-orange-600
            "
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        w-full
        min-h-screen
        bg-[#f7f7f8]
        -mt-8
      "
    >
      {/* ===============================
          HEADER
      =============================== */}

      <div
        className="
          px-4 sm:px-6 lg:px-8
          pt-0
        "
      >
        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-5
          "
        >
          <div>
            <p
              className="
                text-xs
                uppercase
                tracking-[0.16em]
                text-orange-500
                font-semibold
              "
            >
              Restaurant Management
            </p>

            <h1
              className="
                mt-1
                text-2xl
                sm:text-3xl
                font-bold
                text-[#172033]
              "
            >
              Settings
            </h1>

            <p
              className="
                mt-1
                text-sm
                sm:text-base
                text-gray-500
              "
            >
              Manage your restaurant
              preferences and settings.
            </p>
          </div>

          <div
            className="
              flex
              gap-3
            "
          >
            <button
              type="button"
              onClick={loadSettings}
              disabled={loading || saving}
              className="
                h-11
                px-4
                rounded-xl
                border
                border-gray-200
                bg-white
                text-gray-700
                text-sm
                font-semibold
                inline-flex
                items-center
                justify-center
                gap-2
                hover:border-orange-300
                hover:text-orange-600
                disabled:opacity-60
              "
            >
              <RefreshCw
                size={17}
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="
                h-11
                px-5
                rounded-xl
                bg-orange-500
                text-white
                text-sm
                font-semibold
                inline-flex
                items-center
                justify-center
                gap-2
                hover:bg-orange-600
                disabled:opacity-60
              "
            >
              {saving ? (
                <RefreshCw
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Save size={17} />
              )}

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* ===============================
          SETTINGS CONTENT
      =============================== */}

      <div
        className="
          px-4 sm:px-6 lg:px-8
          py-6
        "
      >
        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-[240px_1fr]
            gap-6
          "
        >
          {/* ===========================
              SIDEBAR
          =========================== */}

          <div
            className="
              bg-white
              border
              border-gray-200
              rounded-2xl
              p-2
              h-fit
            "
          >
            <button
              type="button"
              onClick={() =>
                setActiveSection(
                  "restaurant"
                )
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
                font-semibold
                text-left
                ${
                  activeSection ===
                  "restaurant"
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-50"
                }
              `}
            >
              <Store size={18} />

              Restaurant
            </button>
{hasActiveSubscription && (
  <button
    type="button"
    onClick={() =>
      setActiveSection("website")
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
      font-semibold
      text-left
      ${
        activeSection === "website"
          ? "bg-orange-50 text-orange-600"
          : "text-gray-600 hover:bg-gray-50"
      }
    `}
  >
    <Globe size={18} />
    Website
  </button>
)}


            <button
              type="button"
              onClick={() =>
                setActiveSection(
                  "operations"
                )
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
                font-semibold
                text-left
                ${
                  activeSection ===
                  "operations"
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-50"
                }
              `}
            >
              <Clock3 size={18} />

              Operations
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveSection(
                  "notifications"
                )
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
                font-semibold
                text-left
                ${
                  activeSection ===
                  "notifications"
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-50"
                }
              `}
            >
              <Bell size={18} />

              Notifications
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveSection(
                  "security"
                )
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
                font-semibold
                text-left
                ${
                  activeSection ===
                  "security"
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-50"
                }
              `}
            >
              <ShieldCheck
                size={18}
              />

              Security
            </button>
          </div>

          {/* ===========================
              MAIN
          =========================== */}

          <div className="space-y-6">
            {/* =========================
                RESTAURANT
            ========================= */}

            {activeSection ===
              "restaurant" && (
              <div
                className="
                  bg-white
                  border
                  border-gray-200
                  rounded-2xl
                  p-5 sm:p-6
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-orange-50
                      text-orange-500
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Store size={20} />
                  </div>

                  <div>
                    <h2
                      className="
                        text-lg
                        font-bold
                        text-gray-800
                      "
                    >
                      Restaurant Profile
                    </h2>

                    <p
                      className="
                        text-sm
                        text-gray-500
                      "
                    >
                      Update your restaurant
                      information.
                    </p>
                  </div>
                </div>

                <div
                  className="
                    mt-6
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-5
                  "
                >
                  <div>
                    <label
                      className="
                        block
                        text-sm
                        font-semibold
                        text-gray-700
                        mb-2
                      "
                    >
                      Restaurant Name
                    </label>

                    <input
                      value={settings.name}
                      onChange={(e) =>
                        updateField(
                          "name",
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        h-11
                        px-4
                        rounded-xl
                        border
                        border-gray-200
                        outline-none
                        text-sm
                        focus:border-orange-400
                      "
                    />
                  </div>

                  <div>
                    <label
                      className="
                        block
                        text-sm
                        font-semibold
                        text-gray-700
                        mb-2
                      "
                    >
                      Restaurant Type
                    </label>

                    <input
                      value={settings.type}
                      onChange={(e) =>
                        updateField(
                          "type",
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        h-11
                        px-4
                        rounded-xl
                        border
                        border-gray-200
                        outline-none
                        text-sm
                        focus:border-orange-400
                      "
                    />
                  </div>

                  <div>
                    <label
                      className="
                        block
                        text-sm
                        font-semibold
                        text-gray-700
                        mb-2
                      "
                    >
                      Email
                    </label>

                    <input
                      type="email"
                      value={
                        settings.email
                      }
                      onChange={(e) =>
                        updateField(
                          "email",
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        h-11
                        px-4
                        rounded-xl
                        border
                        border-gray-200
                        outline-none
                        text-sm
                        focus:border-orange-400
                      "
                    />
                  </div>

                  <div>
                    <label
                      className="
                        block
                        text-sm
                        font-semibold
                        text-gray-700
                        mb-2
                      "
                    >
                      Phone
                    </label>

                    <input
                      value={
                        settings.phone
                      }
                      onChange={(e) =>
                        updateField(
                          "phone",
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        h-11
                        px-4
                        rounded-xl
                        border
                        border-gray-200
                        outline-none
                        text-sm
                        focus:border-orange-400
                      "
                    />
                  </div>

                  <div
                    className="
                      md:col-span-2
                    "
                  >
                    <label
                      className="
                        block
                        text-sm
                        font-semibold
                        text-gray-700
                        mb-2
                      "
                    >
                      Address
                    </label>

                    <textarea
                      value={
                        settings.address
                      }
                      onChange={(e) =>
                        updateField(
                          "address",
                          e.target.value
                        )
                      }
                      rows={4}
                      className="
                        w-full
                        px-4
                        py-3
                        rounded-xl
                        border
                        border-gray-200
                        outline-none
                        text-sm
                        resize-none
                        focus:border-orange-400
                      "
                    />
                  </div>
                </div>
              </div>
            )}

            {/* =========================
                WEBSITE CUSTOMIZATION
            ========================= */}

            {activeSection ===
              "website" && (
              <div className="space-y-6">

                {/* BRANDING & HERO */}
                <div
                  className="
                    bg-white
                    border
                    border-gray-200
                    rounded-2xl
                    p-5 sm:p-6
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        w-10
                        h-10
                        rounded-xl
                        bg-orange-50
                        text-orange-500
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Globe size={20} />
                    </div>

                    <div>
                      <h2
                        className="
                          text-lg
                          font-bold
                          text-gray-800
                        "
                      >
                        Website Customization
                      </h2>

                      <p
                        className="
                          text-sm
                          text-gray-500
                        "
                      >
                        Customize your restaurant's public website.
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      mt-6
                      grid
                      grid-cols-1
                      md:grid-cols-2
                      gap-5
                    "
                  >
                    {/* Restaurant Name */}
                    <div>
                      <label
                        className="
                          block
                          text-sm
                          font-semibold
                          text-gray-700
                          mb-2
                        "
                      >
                        Restaurant Name
                      </label>

                      <input
                        value={settings.name || ""}
                        onChange={(e) =>
                          updateField(
                            "name",
                            e.target.value
                          )
                        }
                        className="
                          w-full
                          h-11
                          px-4
                          rounded-xl
                          border
                          border-gray-200
                          outline-none
                          text-sm
                          focus:border-orange-400
                        "
                      />
                    </div>

                    {/* Hero Heading */}
                    <div>
                      <label
                        className="
                          block
                          text-sm
                          font-semibold
                          text-gray-700
                          mb-2
                        "
                      >
                        Hero Heading
                      </label>

                      <input
                        value={settings.heroTitle || ""}
                        onChange={(e) =>
                          updateField(
                            "heroTitle",
                            e.target.value
                          )
                        }
                        placeholder="Authentic flavours, beautiful moments"
                        className="
                          w-full
                          h-11
                          px-4
                          rounded-xl
                          border
                          border-gray-200
                          outline-none
                          text-sm
                          focus:border-orange-400
                        "
                      />
                    </div>

                    {/* Hero Subtitle */}
                    <div
                      className="
                        md:col-span-2
                      "
                    >
                      <label
                        className="
                          block
                          text-sm
                          font-semibold
                          text-gray-700
                          mb-2
                        "
                      >
                        Hero Subtitle
                      </label>

                      <textarea
                        value={settings.heroSubtitle || ""}
                        onChange={(e) =>
                          updateField(
                            "heroSubtitle",
                            e.target.value
                          )
                        }
                        rows={3}
                        placeholder="Fresh food, great taste and unforgettable moments."
                        className="
                          w-full
                          px-4
                          py-3
                          rounded-xl
                          border
                          border-gray-200
                          outline-none
                          text-sm
                          resize-none
                          focus:border-orange-400
                        "
                      />
                    </div>

                    {/* Hero Image */}
                    <div
                      className="
                        md:col-span-2
                      "
                    >
                      <label
                        className="
                          block
                          text-sm
                          font-semibold
                          text-gray-700
                          mb-2
                        "
                      >
                        Hero Image URL
                      </label>

                      <input
                        type="url"
                        value={settings.heroImage || ""}
                        onChange={(e) =>
                          updateField(
                            "heroImage",
                            e.target.value
                          )
                        }
                        placeholder="https://example.com/restaurant-hero.jpg"
                        className="
                          w-full
                          h-11
                          px-4
                          rounded-xl
                          border
                          border-gray-200
                          outline-none
                          text-sm
                          focus:border-orange-400
                        "
                      />

                      <p
                        className="
                          mt-2
                          text-xs
                          text-gray-400
                        "
                      >
                        Paste a public image URL for your restaurant hero section.
                      </p>

                      {settings.heroImage && (
                        <div
                          className="
                            mt-3
                            w-full
                            h-48
                            rounded-xl
                            overflow-hidden
                            bg-gray-100
                            border
                            border-gray-200
                          "
                        >
                          <img
                            src={settings.heroImage}
                            alt="Hero preview"
                            className="
                              w-full
                              h-full
                              object-cover
                            "
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Logo */}
                    <div
                      className="
                        md:col-span-2
                      "
                    >
                      <label
                        className="
                          block
                          text-sm
                          font-semibold
                          text-gray-700
                          mb-2
                        "
                      >
                        Logo URL
                      </label>

                      <input
                        type="url"
                        value={settings.logo || ""}
                        onChange={(e) =>
                          updateField(
                            "logo",
                            e.target.value
                          )
                        }
                        placeholder="https://example.com/logo.png"
                        className="
                          w-full
                          h-11
                          px-4
                          rounded-xl
                          border
                          border-gray-200
                          outline-none
                          text-sm
                          focus:border-orange-400
                        "
                      />

                      {settings.logo && (
                        <div
                          className="
                            mt-3
                            w-24
                            h-24
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            overflow-hidden
                            flex
                            items-center
                            justify-center
                          "
                        >
                          <img
                            src={settings.logo}
                            alt="Restaurant logo preview"
                            className="
                              w-full
                              h-full
                              object-contain
                            "
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ABOUT */}
                <div
                  className="
                    bg-white
                    border
                    border-gray-200
                    rounded-2xl
                    p-5 sm:p-6
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        w-10
                        h-10
                        rounded-xl
                        bg-blue-50
                        text-blue-500
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Store size={20} />
                    </div>

                    <div>
                      <h2
                        className="
                          text-lg
                          font-bold
                          text-gray-800
                        "
                      >
                        About Your Restaurant
                      </h2>

                      <p
                        className="
                          text-sm
                          text-gray-500
                        "
                      >
                        Tell customers your restaurant story.
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      mt-6
                      space-y-5
                    "
                  >
                    <div>
                      <label
                        className="
                          block
                          text-sm
                          font-semibold
                          text-gray-700
                          mb-2
                        "
                      >
                        About Section Title
                      </label>

                      <input
                        value={settings.aboutTitle || ""}
                        onChange={(e) =>
                          updateField(
                            "aboutTitle",
                            e.target.value
                          )
                        }
                        placeholder="Our Story"
                        className="
                          w-full
                          h-11
                          px-4
                          rounded-xl
                          border
                          border-gray-200
                          outline-none
                          text-sm
                          focus:border-orange-400
                        "
                      />
                    </div>

                    <div>
                      <label
                        className="
                          block
                          text-sm
                          font-semibold
                          text-gray-700
                          mb-2
                        "
                      >
                        About Your Restaurant
                      </label>

                      <textarea
                        value={settings.aboutText || ""}
                        onChange={(e) =>
                          updateField(
                            "aboutText",
                            e.target.value
                          )
                        }
                        rows={7}
                        placeholder="Write about your restaurant, story, food and specialities..."
                        className="
                          w-full
                          px-4
                          py-3
                          rounded-xl
                          border
                          border-gray-200
                          outline-none
                          text-sm
                          resize-none
                          focus:border-orange-400
                        "
                      />
                    </div>
                  </div>
                </div>

                {/* SOCIAL LINKS */}
                <div
                  className="
                    bg-white
                    border
                    border-gray-200
                    rounded-2xl
                    p-5 sm:p-6
                  "
                >
                  <div>
                    <h2
                      className="
                        text-lg
                        font-bold
                        text-gray-800
                      "
                    >
                      Social Media
                    </h2>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-gray-500
                      "
                    >
                      Add your restaurant's social media profiles.
                    </p>
                  </div>

                  <div
                    className="
                      mt-6
                      grid
                      grid-cols-1
                      md:grid-cols-2
                      gap-5
                    "
                  >
                    <div>
                      <label
                        className="
                          block
                          text-sm
                          font-semibold
                          text-gray-700
                          mb-2
                        "
                      >
                        Instagram
                      </label>

                      <input
                        type="url"
                        value={settings.instagram || ""}
                        onChange={(e) =>
                          updateField(
                            "instagram",
                            e.target.value
                          )
                        }
                        placeholder="https://instagram.com/yourrestaurant"
                        className="
                          w-full
                          h-11
                          px-4
                          rounded-xl
                          border
                          border-gray-200
                          outline-none
                          text-sm
                          focus:border-orange-400
                        "
                      />
                    </div>

                    <div>
                      <label
                        className="
                          block
                          text-sm
                          font-semibold
                          text-gray-700
                          mb-2
                        "
                      >
                        Facebook
                      </label>

                      <input
                        type="url"
                        value={settings.facebook || ""}
                        onChange={(e) =>
                          updateField(
                            "facebook",
                            e.target.value
                          )
                        }
                        placeholder="https://facebook.com/yourrestaurant"
                        className="
                          w-full
                          h-11
                          px-4
                          rounded-xl
                          border
                          border-gray-200
                          outline-none
                          text-sm
                          focus:border-orange-400
                        "
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* =========================
                OPERATIONS
            ========================= */}

            {activeSection ===
              "operations" && (
              <div
                className="
                  bg-white
                  border
                  border-gray-200
                  rounded-2xl
                  p-5 sm:p-6
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-blue-50
                      text-blue-500
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Clock3 size={20} />
                  </div>

                  <div>
                    <h2
                      className="
                        text-lg
                        font-bold
                        text-gray-800
                      "
                    >
                      Restaurant Operations
                    </h2>

                    <p
                      className="
                        text-sm
                        text-gray-500
                      "
                    >
                      Control your restaurant
                      operating preferences.
                    </p>
                  </div>
                </div>

                <div
                  className="
                    mt-6
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-5
                  "
                >
                  <div>
                    <label
                      className="
                        block
                        text-sm
                        font-semibold
                        text-gray-700
                        mb-2
                      "
                    >
                      Opening Time
                    </label>

                    <input
                      type="time"
                      value={
                        settings.openingTime
                      }
                      onChange={(e) =>
                        updateField(
                          "openingTime",
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        h-11
                        px-4
                        rounded-xl
                        border
                        border-gray-200
                        outline-none
                        text-sm
                        focus:border-orange-400
                      "
                    />
                  </div>

                  <div>
                    <label
                      className="
                        block
                        text-sm
                        font-semibold
                        text-gray-700
                        mb-2
                      "
                    >
                      Closing Time
                    </label>

                    <input
                      type="time"
                      value={
                        settings.closingTime
                      }
                      onChange={(e) =>
                        updateField(
                          "closingTime",
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        h-11
                        px-4
                        rounded-xl
                        border
                        border-gray-200
                        outline-none
                        text-sm
                        focus:border-orange-400
                      "
                    />
                  </div>
                </div>

                <div
                  className="
                    mt-6
                    space-y-3
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                      p-4
                      rounded-xl
                      bg-gray-50
                    "
                  >
                    <div>
                      <p
                        className="
                          text-sm
                          font-semibold
                          text-gray-800
                        "
                      >
                        Accept Orders
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-gray-500
                        "
                      >
                        Allow customers to
                        place new orders.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          "acceptsOrders",
                          !settings.acceptsOrders
                        )
                      }
                      className={`
                        relative
                        w-12
                        h-6
                        rounded-full
                        transition
                        ${
                          settings.acceptsOrders
                            ? "bg-orange-500"
                            : "bg-gray-300"
                        }
                      `}
                    >
                      <span
                        className={`
                          absolute
                          top-1
                          w-4
                          h-4
                          rounded-full
                          bg-white
                          transition
                          ${
                            settings.acceptsOrders
                              ? "left-7"
                              : "left-1"
                          }
                        `}
                      />
                    </button>
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                      p-4
                      rounded-xl
                      bg-gray-50
                    "
                  >
                    <div>
                      <p
                        className="
                          text-sm
                          font-semibold
                          text-gray-800
                        "
                      >
                        Accept Reservations
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-gray-500
                        "
                      >
                        Allow customers to
                        make reservations.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          "acceptsReservations",
                          !settings.acceptsReservations
                        )
                      }
                      className={`
                        relative
                        w-12
                        h-6
                        rounded-full
                        transition
                        ${
                          settings.acceptsReservations
                            ? "bg-orange-500"
                            : "bg-gray-300"
                        }
                      `}
                    >
                      <span
                        className={`
                          absolute
                          top-1
                          w-4
                          h-4
                          rounded-full
                          bg-white
                          transition
                          ${
                            settings.acceptsReservations
                              ? "left-7"
                              : "left-1"
                          }
                        `}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* =========================
                NOTIFICATIONS
            ========================= */}

            {activeSection ===
              "notifications" && (
              <div
                className="
                  bg-white
                  border
                  border-gray-200
                  rounded-2xl
                  p-5 sm:p-6
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-orange-50
                      text-orange-500
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Bell size={20} />
                  </div>

                  <div>
                    <h2
                      className="
                        text-lg
                        font-bold
                        text-gray-800
                      "
                    >
                      Notification Preferences
                    </h2>

                    <p
                      className="
                        text-sm
                        text-gray-500
                      "
                    >
                      Choose which restaurant
                      alerts you want to receive.
                    </p>
                  </div>
                </div>

                <div
                  className="
                    mt-6
                    space-y-3
                  "
                >
                  {[
                    {
                      key: "newOrders" as const,
                      title:
                        "New Orders",
                      description:
                        "Get notified when a new order is received.",
                    },
                    {
                      key:
                        "reservations" as const,
                      title:
                        "Reservations",
                      description:
                        "Get notified about new and updated reservations.",
                    },
                    {
                      key:
                        "inventoryAlerts" as const,
                      title:
                        "Inventory Alerts",
                      description:
                        "Get notified about low and out-of-stock items.",
                    },
                    {
                      key:
                        "employeeUpdates" as const,
                      title:
                        "Employee Updates",
                      description:
                        "Get notified when employees are added or updated.",
                    },
                  ].map(
                    (item) => (
                      <div
                        key={item.key}
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                          p-4
                          rounded-xl
                          bg-gray-50
                        "
                      >
                        <div>
                          <p
                            className="
                              text-sm
                              font-semibold
                              text-gray-800
                            "
                          >
                            {item.title}
                          </p>

                          <p
                            className="
                              mt-1
                              text-xs
                              text-gray-500
                            "
                          >
                            {item.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            updateNotificationPreference(
                              item.key,
                              !settings
                                .notificationPreferences[
                                item.key
                              ]
                            )
                          }
                          className={`
                            relative
                            w-12
                            h-6
                            shrink-0
                            rounded-full
                            transition
                            ${
                              settings
                                .notificationPreferences[
                                item.key
                              ]
                                ? "bg-orange-500"
                                : "bg-gray-300"
                            }
                          `}
                        >
                          <span
                            className={`
                              absolute
                              top-1
                              w-4
                              h-4
                              rounded-full
                              bg-white
                              transition
                              ${
                                settings
                                  .notificationPreferences[
                                  item.key
                                ]
                                  ? "left-7"
                                  : "left-1"
                              }
                            `}
                          />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* =========================
                SECURITY
            ========================= */}

            {activeSection ===
              "security" && (
              <div
                className="
                  bg-white
                  border
                  border-gray-200
                  rounded-2xl
                  p-5 sm:p-6
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-green-50
                      text-green-500
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <ShieldCheck
                      size={20}
                    />
                  </div>

                  <div>
                    <h2
                      className="
                        text-lg
                        font-bold
                        text-gray-800
                      "
                    >
                      Account Security
                    </h2>

                    <p
                      className="
                        text-sm
                        text-gray-500
                      "
                    >
                      Manage your owner account
                      security.
                    </p>
                  </div>
                </div>

                <div
                  className="
                    mt-6
                    p-5
                    rounded-xl
                    bg-gray-50
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >
                    <UserRound
                      size={20}
                      className="
                        mt-0.5
                        text-gray-500
                      "
                    />

                    <div>
                      <p
                        className="
                          text-sm
                          font-semibold
                          text-gray-800
                        "
                      >
                        Owner Account
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-gray-500
                        "
                      >
                        Password management is
                        handled through the account
                        security flow.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerSettings;