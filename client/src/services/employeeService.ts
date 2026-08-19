const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export type EmployeeRole =
  | "manager"
  | "waiter"
  | "kitchen";

export type Employee = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: EmployeeRole;
  restaurantId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type EmployeeResponse = {
  success: boolean;
  message?: string;
  data?: Employee[];
};

type SingleEmployeeResponse = {
  success: boolean;
  message?: string;
  data?: Employee;
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
// GET EMPLOYEES
// ===============================
export const getEmployees =
  async (): Promise<EmployeeResponse> => {
    const response = await fetch(
      `${API_URL}/employees`,
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
          "Unable to fetch employees"
      );
    }

    return data;
  };

// ===============================
// CREATE EMPLOYEE
// ===============================
export const createEmployee =
  async (employee: {
    fullName: string;
    email: string;
    phone?: string;
    role: EmployeeRole;
    password: string;
  }): Promise<SingleEmployeeResponse> => {
    const response = await fetch(
      `${API_URL}/employees`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(employee),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to create employee"
      );
    }

    return data;
  };

// ===============================
// UPDATE EMPLOYEE
// ===============================
export const updateEmployee =
  async (
    id: string,
    employee: {
      fullName?: string;
      email?: string;
      phone?: string;
      role?: EmployeeRole;
      password?: string;
    }
  ): Promise<SingleEmployeeResponse> => {
    const response = await fetch(
      `${API_URL}/employees/${id}`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(employee),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to update employee"
      );
    }

    return data;
  };

// ===============================
// DELETE EMPLOYEE
// ===============================
export const deleteEmployee =
  async (
    id: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    const response = await fetch(
      `${API_URL}/employees/${id}`,
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
          "Unable to delete employee"
      );
    }

    return data;
  };