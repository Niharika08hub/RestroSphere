const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://restrosphere.onrender.com/api";
  
const getToken = () => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token not found");
  }

  return token;
};

// Today's dashboard stats
export const getTodayStats = async () => {
  const token = getToken();

  const response = await fetch(`${API_URL}/orders/today-stats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to fetch today's statistics"
    );
  }

  return data;
};

// Get all orders of owner's restaurant
export const getOwnerOrders = async () => {
  const token = getToken();

  const response = await fetch(`${API_URL}/orders/owner`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to fetch restaurant orders"
    );
  }

  return data.data?.orders || data.data || [];
};

// Update order status
export const updateOrderStatus = async (
  orderId: string,
  status: string
) => {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/orders/${orderId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to update order status"
    );
  }

  return data.data?.order || data.data;
};
