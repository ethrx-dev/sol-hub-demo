import { create } from "zustand";
import type { User } from "@/src/lib/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isLoading: false }),
  logout: () => {
    localStorage.removeItem("auth_token");
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
