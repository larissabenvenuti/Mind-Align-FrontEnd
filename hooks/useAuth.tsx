"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { api } from "@/lib/api";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  theme?: string;
  taskResetPreference?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ user: User; token: string }>;
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => void;
  updateUserTheme: (theme: string) => Promise<void>;
  updateTaskResetPreference: (preference: string) => Promise<void>;
  loading: boolean;
  booted: boolean;
  setAuthData: (user: Partial<User>, token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [booted, setBooted] = useState(false);

  const router = useRouter();

  const applyTheme = (theme: string) => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    root.classList.remove(
      "theme-purple",
      "theme-blue",
      "theme-green",
      "theme-orange",
      "theme-pink",
      "theme-dark",
      "theme-sun",
      "theme-red",
    );

    if (theme && theme !== "default") {
      root.classList.add(theme);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;

        setToken(storedToken);
        setUser(parsedUser);

        applyTheme(parsedUser.theme || "default");

        Cookies.set("token", storedToken, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        Cookies.remove("token");
      }
    }

    setBooted(true);
  }, []);

  const setAuthData = (
    partialUser: Partial<User>,
    newToken: string,
  ) => {
    let existingUser: Partial<User> = {};

    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        existingUser = JSON.parse(storedUser);
      }
    } catch {
      existingUser = {};
    }

    const newUser = {
      ...existingUser,
      ...user,
      ...partialUser,
    } as User;

    setUser(newUser);
    setToken(newToken);

    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("token", newToken);

    Cookies.set("token", newToken, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    if (newUser.theme) {
      applyTheme(newUser.theme);
    }
  };

  const login = async (
    email: string,
    password: string,
  ) => {
    setLoading(true);

    try {
      const data = await api.post<{
        user: User;
        token: string;
      }>("/api/auth/login", {
        email,
        password,
      });

      setAuthData(data.user, data.token);

      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ) => {
    setLoading(true);

    try {
      return await api.post<{
        user: User;
        token: string;
      }>("/api/auth/register", {
        name,
        email,
        password,
      });
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (
    googleToken: string,
  ) => {
    setLoading(true);

    try {
      const data = await api.post<{
        user: User;
        token: string;
      }>("/api/auth/google", {
        token: googleToken,
      });

      setAuthData(data.user, data.token);

      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    Cookies.remove("token");

    document.documentElement.classList.remove(
      "theme-purple",
      "theme-blue",
      "theme-green",
      "theme-orange",
      "theme-pink",
      "theme-dark",
      "theme-sun",
      "theme-red",
    );

    router.push("/");
  };

  const updateUserTheme = async (theme: string) => {
    if (!user || !token) return;

    await api.patch("/api/user/settings", {
      theme,
    });

    setAuthData(
      {
        theme,
      },
      token,
    );
  };

  const updateTaskResetPreference = async (
    taskResetPreference: string,
  ) => {
    if (!user || !token) return;

    await api.patch("/api/user/settings", {
      taskResetPreference,
    });

    setAuthData(
      {
        taskResetPreference,
      },
      token,
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUserTheme,
        updateTaskResetPreference,
        loading,
        booted,
        setAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider",
    );
  }

  return context;
};