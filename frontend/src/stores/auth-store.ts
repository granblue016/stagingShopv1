import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { apiFetch } from "@/lib/api-service";
import { useCartStore } from "@/stores/cart-store";

interface AuthState {
  user: User | null;
  token: string | null;
  idToken: string | null; // Firebase ID Token for NLP service authentication
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setIdToken: (idToken: string | null) => void;
}

/**
 * Forcefully wipe ALL private session data so a logged-out user
 * (or session expiry) cannot leak data to the next visitor on the
 * same browser. Clears:
 *   - auth state (this store)
 *   - cart state (zustand)
 *   - persisted storage entries used by both stores
 *   - any sessionStorage entries we own
 */
export function purgeSession() {
  // Reset in-memory stores first so subscribers re-render immediately.
  useCartStore.getState().clear();

  if (typeof window !== "undefined") {
    try {
      // Persist middleware keys
      localStorage.removeItem("shopcart_auth");
      localStorage.removeItem("shopcart_cart");
      // Any private session-scoped data
      sessionStorage.clear();
    } catch {
      // ignore storage failures (private mode, quota, etc.)
    }
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      idToken: null,
      isAuthenticated: () => !!get().token,
      isAdmin: () => get().user?.role === "ADMIN",
      login: async (email, _password) => {
        // Always start a fresh session — never inherit a previous user's cart.
        purgeSession();
        const { user, token } = await apiFetch<{ user: User; token: string }>(
          "/api/auth/login",
          { method: "POST", body: { email, password: _password } },
        );
        set({ user, token });
      },
      register: async (name, email, password) => {
        // Always start a fresh session — never inherit a previous user's cart.
        purgeSession();
        const user = await apiFetch<User>(
          "/api/auth/register",
          { method: "POST", body: { name, email, password } },
        );
        set({ user, token: null });
      },
      logout: () => {
        set({ user: null, token: null, idToken: null });
        purgeSession();
      },
      setIdToken: (idToken) => {
        set({ idToken });
      },
    }),
    { name: "shopcart_auth" },
  ),
);
