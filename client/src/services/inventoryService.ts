const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export type InventoryItem = {
  _id: string;
  restaurantId: string;

  itemName: string;
  category: string;

  quantity: number;
  unit: string;

  minimumStock: number;

  supplier?: string;
  price?: number;

  createdAt?: string;
  updatedAt?: string;
};

type InventoryResponse = {
  success: boolean;
  message?: string;
  data?: InventoryItem[];
};

type SingleInventoryResponse = {
  success: boolean;
  message?: string;
  data?: InventoryItem;
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
// GET INVENTORY
// ===============================

export const getInventory =
  async (): Promise<InventoryResponse> => {
    const response = await fetch(
      `${API_URL}/inventory`,
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
          "Unable to fetch inventory"
      );
    }

    return data;
  };

// ===============================
// CREATE INVENTORY ITEM
// ===============================

export const createInventory =
  async (item: {
    itemName: string;
    category: string;
    quantity: number;
    unit: string;
    minimumStock: number;
    supplier?: string;
    price?: number;
  }): Promise<SingleInventoryResponse> => {
    const response = await fetch(
      `${API_URL}/inventory`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(item),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to create inventory item"
      );
    }

    return data;
  };

// ===============================
// UPDATE INVENTORY ITEM
// ===============================

export const updateInventory =
  async (
    id: string,
    item: {
      itemName?: string;
      category?: string;
      quantity?: number;
      unit?: string;
      minimumStock?: number;
      supplier?: string;
      price?: number;
    }
  ): Promise<SingleInventoryResponse> => {
    const response = await fetch(
      `${API_URL}/inventory/${id}`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(item),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to update inventory item"
      );
    }

    return data;
  };

// ===============================
// DELETE INVENTORY ITEM
// ===============================

export const deleteInventory =
  async (
    id: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    const response = await fetch(
      `${API_URL}/inventory/${id}`,
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
          "Unable to delete inventory item"
      );
    }

    return data;
  };