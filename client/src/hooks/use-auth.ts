import { create } from "zustand";

interface AuthState {
  token: string | null;
  role: string | null;
  setAuth: (token: string, role: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("dd_token"),
  role: localStorage.getItem("dd_role"),
  setAuth: (token, role) => {
    localStorage.setItem("dd_token", token);
    localStorage.setItem("dd_role", role);
    set({ token, role });
  },
  clearAuth: () => {
    localStorage.removeItem("dd_token");
    localStorage.removeItem("dd_role");
    set({ token: null, role: null });
  },
}));
