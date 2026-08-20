const API_URL = "https://restrosphere.onrender.com/api";
export type NotificationType =
  | "order"
  | "reservation"
  | "inventory"
  | "employee"
  | "system";

export type NotificationItem = {
  _id: string;
  restaurantId: string;
  recipientId: string;

  type: NotificationType;

  title: string;
  message: string;

  isRead: boolean;

  referenceId?: string | null;

  createdAt: string;
  updatedAt: string;
};

type NotificationsResponse = {
  success: boolean;
  message?: string;
  data?: NotificationItem[];
  unreadCount?: number;
};

type NotificationResponse = {
  success: boolean;
  message?: string;
  data?: NotificationItem;
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
// GET NOTIFICATIONS
// ===============================

export const getNotifications =
  async (): Promise<NotificationsResponse> => {
    const response = await fetch(
      `${API_URL}/notifications`,
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
          "Unable to fetch notifications"
      );
    }

    return data;
  };

// ===============================
// CREATE NOTIFICATION
// ===============================

export const createNotification =
  async (notification: {
    type: NotificationType;
    title: string;
    message: string;
    referenceId?: string | null;
  }): Promise<NotificationResponse> => {
    const response = await fetch(
      `${API_URL}/notifications`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(
          notification
        ),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to create notification"
      );
    }

    return data;
  };

// ===============================
// MARK ONE AS READ
// ===============================

export const markNotificationAsRead =
  async (
    id: string
  ): Promise<NotificationResponse> => {
    const response = await fetch(
      `${API_URL}/notifications/${id}/read`,
      {
        method: "PATCH",
        headers: getHeaders(),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to mark notification as read"
      );
    }

    return data;
  };

// ===============================
// MARK ALL AS READ
// ===============================

export const markAllNotificationsAsRead =
  async (): Promise<{
    success: boolean;
    message?: string;
  }> => {
    const response = await fetch(
      `${API_URL}/notifications/read-all`,
      {
        method: "PATCH",
        headers: getHeaders(),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to mark notifications as read"
      );
    }

    return data;
  };

// ===============================
// DELETE NOTIFICATION
// ===============================

export const deleteNotification =
  async (
    id: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    const response = await fetch(
      `${API_URL}/notifications/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to delete notification"
      );
    }

    return data;
  };