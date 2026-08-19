const API_URL = "http://localhost:5000/api";

// =====================================
// PUBLIC MENU
// =====================================
export type PublicMenuItem = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  veg: boolean;
  isAvailable: boolean;
};

export const getPublicMenu = async () => {
  const response = await fetch(`${API_URL}/menu/public`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch menu");
  }

  return data.data || [];
};

// =====================================
// OWNER AUTH
// =====================================

const getToken = () => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token not found");
  }

  return token;
};

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

// =====================================
// OWNER - GET ALL MENU ITEMS
// =====================================

export const getMenu = async () => {
  const response = await fetch(`${API_URL}/menu`, {
    method: "GET",
    headers: authHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch menu");
  }

  return data.data || [];
};

// =====================================
// OWNER - ADD ITEM
// =====================================

export const addMenuItem = async (item: {
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  rating?: number;
  veg?: boolean;
  isAvailable?: boolean;
}) => {
  const response = await fetch(`${API_URL}/menu`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(item),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to add menu item");
  }

  return data.data;
};

// =====================================
// OWNER - UPDATE ITEM
// =====================================

export const updateMenuItem = async (
  id: string,
  updates: {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    image?: string;
    rating?: number;
    veg?: boolean;
    isAvailable?: boolean;
  }
) => {
  const response = await fetch(`${API_URL}/menu/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update menu item");
  }

  return data.data;
};

// =====================================
// OWNER - DELETE ITEM
// =====================================

export const deleteMenuItem = async (id: string) => {
  const response = await fetch(`${API_URL}/menu/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete menu item");
  }

  return data;
};