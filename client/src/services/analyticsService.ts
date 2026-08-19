const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export type AnalyticsStats = {
  revenue: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
};

export type TopItem = {
  name: string;
  quantity: number;
  revenue: number;
};

export type DailyAnalytics = {
  date: string;
  revenue: number;
  orders: number;
};

export type AnalyticsData = {
  range: string;
  stats: AnalyticsStats;
  topItems: TopItem[];
  dailyAnalytics: DailyAnalytics[];
};

type AnalyticsResponse = {
  success: boolean;
  message?: string;
  data?: AnalyticsData;
};

const getToken = () => {
  return (
    sessionStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
};

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

// ===============================
// GET ANALYTICS
// ===============================

export const getAnalytics = async (
  range: "today" | "7d" | "30d" = "7d"
): Promise<AnalyticsResponse> => {
  const response = await fetch(
    `${API_URL}/analytics?range=${range}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Unable to fetch analytics"
    );
  }

  return data;
};