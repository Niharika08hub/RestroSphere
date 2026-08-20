const API_URL = "https://restrosphere.onrender.com/api";

export type ReportSummary = {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  revenue: number;
  averageOrderValue: number;
};

export type ReportItem = {
  name: string;
  quantity: number;
  revenue: number;
};

export type DailyReport = {
  date: string;
  orders: number;
  completed: number;
  cancelled: number;
  revenue: number;
};

export type ReportData = {
  range: string;
  summary: ReportSummary;
  itemReport: ReportItem[];
  dailyReport: DailyReport[];
};

type ReportResponse = {
  success: boolean;
  message?: string;
  data?: ReportData;
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
// GET REPORT
// ===============================

export const getReport = async (
  range: "today" | "7d" | "30d" = "7d"
): Promise<ReportResponse> => {
  const response = await fetch(
    `${API_URL}/reports?range=${range}`,
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
        "Unable to generate report"
    );
  }

  return data;
};