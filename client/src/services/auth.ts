// services/auth.ts
import { store } from "../store";
import api from "./axios";

// -----------------------------
// Interfaces
// -----------------------------
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface GoogleAuthData {
  email: string;
  name: string;
  googleId: string;
  picture?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
}

// -----------------------------
// Login
// -----------------------------
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post("/auth/login", data, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw new Error("שגיאה בהתחברות");
  }
};

// -----------------------------
// Register
// -----------------------------
export const register = async (
  data: RegisterData & Partial<{ category: string; regions: string; kashrut: string; description: string }>,
  role: string
): Promise<AuthResponse> => {
  try {
    const route = role === "supplier" ? "/suppliers/register" : "/auth/register";
    const payload = role === "supplier" ? { ...data, role: "supplier" } : data;
    const response = await api.post(route, payload, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw new Error("שגיאה בהרשמה");
  }
};

// -----------------------------
// Logout
// -----------------------------
export const logout = async (): Promise<void> => {
  await api.post("/auth/logout", {}, { withCredentials: true });
  store.dispatch({ type: "auth/clearUser" });
};

// -----------------------------
// Fetch Current User
// -----------------------------
export const fetchUser = async (): Promise<User> => {
  const res = await api.get("/users/me", { withCredentials: true });
  return res.data;
};

// -----------------------------
// Authentication Checks
// -----------------------------
export const isAuthenticated = (): boolean => {
  const state = store.getState();
  return !!state.auth.user;
};

export const isAuthenticatedAsync = async (): Promise<boolean> => {
  try {
    await api.get("/users/me", { withCredentials: true });
    return true;
  } catch {
    return false;
  }
};

// -----------------------------
// Get User Role
// -----------------------------
export const getUserRole = (): string | null => {
  const state = store.getState();
  return state.auth.user?.role || null;
};

export const getUserRoleAsync = async (): Promise<string | null> => {
  try {
    const res = await api.get("/users/me", { withCredentials: true });
    return res.data.role || null;
  } catch {
    return null;
  }
};

// -----------------------------
// Google Auth
// -----------------------------
export const googleAuth = async (data: GoogleAuthData): Promise<AuthResponse> => {
  try {
    const response = await api.post("/auth/google", data, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) throw new Error(error.response.data.message);
    throw new Error("שגיאה בהתחברות עם Google. אנא נסה שוב.");
  }
};
