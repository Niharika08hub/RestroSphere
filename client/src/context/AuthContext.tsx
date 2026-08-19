import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";
import { loginUser, getProfile } from "../services/authService";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      const res = await loginUser({ email, password });

      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));

      setUser(res.data.user);

      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  const logout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) return;

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("restaurantId");
    sessionStorage.removeItem("selectedRestaurant");

    localStorage.removeItem("accessToken");

    setUser(null);
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await getProfile();
        const loggedInUser = profile?.data?.user;

        if (loggedInUser) {
          setUser(loggedInUser);
          sessionStorage.setItem(
            "user",
            JSON.stringify(loggedInUser)
          );
        }
      } catch (error) {
        console.error("PROFILE LOAD ERROR:", error);

        try {
          const savedUser = sessionStorage.getItem("user");

          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);

            if (parsedUser?.role) {
              setUser(parsedUser);
            }
          }
        } catch (storageError) {
          console.error(
            "SAVED USER RESTORE ERROR:",
            storageError
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext)!;
};