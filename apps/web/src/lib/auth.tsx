"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/src/lib/api-client";

export type UserRole = "innovator" | "mentor" | "investor" | "admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_super_admin?: boolean;
  avatar_url?: string;
  onboarding_completed: boolean;
  bio?: string;
  skills?: string[];
  sectors_of_interest?: string[];
  membership_tier?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("auth_token");
          setIsLoading(false);
          return;
        }
      } catch {
        localStorage.removeItem("auth_token");
        setIsLoading(false);
        return;
      }
      const data = await api.get<User>("/auth/me");
      setUser(data);
    } catch {
      localStorage.removeItem("auth_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const setAuth = async (accessToken: string) => {
    localStorage.setItem("auth_token", accessToken);
    try {
      const data = await api.get<User>("/auth/me");
      setUser(data);
      return data;
    } catch {
      setUser(null);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    const data = await api.post<{ access_token: string; refresh_token: string }>("/auth/login", {
      email,
      password,
    });
    const user = await setAuth(data.access_token);
    if (user) {
      const dashPaths: Record<string, string> = {
        admin: "/admin",
        innovator: "/innovator/projects",
        mentor: "/mentor/browse",
        investor: "/investor/browse",
      };
      router.push(user.onboarding_completed ? dashPaths[user.role] || "/" : "/onboarding");
    }
  };

  const register = async (registerData: RegisterData) => {
    const data = await api.post<{ access_token: string; refresh_token: string }>(
      "/auth/register",
      {
        email: registerData.email,
        password: registerData.password,
        full_name: registerData.fullName,
      }
    );
    const user = await setAuth(data.access_token);
    if (user) {
      router.push("/onboarding");
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
    } finally {
      localStorage.removeItem("auth_token");
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: UserRole[];
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
    if (!isLoading && roles && user && !roles.includes(user.role)) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, user, roles, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (roles && user && !roles.includes(user.role)) return null;

  return <>{children}</>;
}
