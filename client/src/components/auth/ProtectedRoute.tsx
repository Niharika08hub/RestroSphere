import React from "react";
import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

const getTokenRole = (): string | null => {
  try {
    const token =
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (!token) return null;

    const parts = token.split(".");

    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));

    return String(payload?.role || "")
      .trim()
      .toLowerCase();
  } catch {
    return null;
  }
};

const getStoredUserRole = (): string | null => {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return null;

    const user = JSON.parse(storedUser);

    return String(user?.role || "")
      .trim()
      .toLowerCase();
  } catch {
    return null;
  }
};

const getDashboard = (role: string) => {
  switch (role) {
    case "owner":
      return "/owner/dashboard";

    case "manager":
      return "/manager/dashboard";

    case "kitchen":
      return "/kitchen/dashboard";

    case "waiter":
      return "/waiter/dashboard";

    case "customer":
      return "/customer/dashboard";

    default:
      return "/login";
  }
};

const ProtectedRoute: React.FC<Props> = ({
  children,
  allowedRoles,
}) => {
  const tokenRole = getTokenRole();
  const storedUserRole = getStoredUserRole();

  // No valid login session
  if (!tokenRole) {
    return <Navigate to="/login" replace />;
  }

  /*
   * JWT token is the source of truth.
   *
   * Example:
   * token role = kitchen
   * customer route = blocked
   */
  const currentRole = tokenRole;

  // Keep localStorage user role synchronized with the token.
  if (storedUserRole !== currentRole) {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          role: currentRole,
        })
      );
    } catch {
      // Ignore invalid stored user data.
    }
  }

  // Route doesn't specify roles.
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  const hasAccess = allowedRoles.some(
    (role) =>
      String(role).trim().toLowerCase() === currentRole
  );

  // Correct role → allow page
  if (hasAccess) {
    return <>{children}</>;
  }

  // Wrong role → ALWAYS send to that role's dashboard.
  return (
    <Navigate
      to={getDashboard(currentRole)}
      replace
    />
  );
};

export default ProtectedRoute;