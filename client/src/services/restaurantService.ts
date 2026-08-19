const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export type NotificationPreferences = {
  newOrders: boolean;
  reservations: boolean;
  inventoryAlerts: boolean;
  employeeUpdates: boolean;
};

export type RestaurantSettings = {
  _id: string;
  ownerId: string;

  name: string;
  type: string;
  logo: string;

  email: string;
  phone: string;
  address: string;

  openingTime: string;
  closingTime: string;

  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;

  aboutTitle?: string;
  aboutText?: string;

  instagram?: string;
  facebook?: string;

  acceptsOrders: boolean;
  acceptsReservations: boolean;

  isActive: boolean;

  notificationPreferences: NotificationPreferences;

  createdAt?: string;
  updatedAt?: string;
};

type RestaurantResponse = {
  success: boolean;
  message?: string;
  data?: RestaurantSettings;
};

// =====================================
// GET TOKEN
// =====================================

const getToken = () => {
  return (
    sessionStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    ""
  );
};

// =====================================
// GET HEADERS
// =====================================

const getHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

// =====================================
// HANDLE API RESPONSE
// =====================================

const handleResponse = async (
  response: Response
): Promise<RestaurantResponse> => {
  const contentType =
    response.headers.get("content-type") || "";

  const text = await response.text();

  let data: RestaurantResponse = {
    success: false,
  };

  // ===============================
  // JSON RESPONSE
  // ===============================

  if (contentType.includes("application/json")) {
    try {
      data = text
        ? JSON.parse(text)
        : { success: false };
    } catch (error) {
      console.error(
        "INVALID JSON RESPONSE:",
        text.slice(0, 500)
      );

      throw new Error(
        "Invalid response received from server."
      );
    }
  } else {
    // ===============================
    // NON JSON RESPONSE
    // ===============================

    console.error(
      "EXPECTED JSON BUT RECEIVED:",
      text.slice(0, 500)
    );

    throw new Error(
      `Backend returned an invalid response (${response.status}).`
    );
  }

  // ===============================
  // API ERROR
  // ===============================

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Request failed (${response.status})`
    );
  }

  return data;
};

// =====================================
// GET RESTAURANT SETTINGS
// =====================================

export const getRestaurantSettings =
  async (): Promise<RestaurantResponse> => {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Authentication required. Please login again."
      );
    }

    const response = await fetch(
      `${API_URL}/restaurants/settings`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  };

// =====================================
// UPDATE RESTAURANT SETTINGS
// =====================================

export const updateRestaurantSettings =
  async (
    settings: Partial<RestaurantSettings>
  ): Promise<RestaurantResponse> => {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Authentication required. Please login again."
      );
    }

    const response = await fetch(
      `${API_URL}/restaurants/settings`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(settings),
      }
    );

    return handleResponse(response);
  };