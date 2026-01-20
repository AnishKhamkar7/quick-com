import { type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "./auth-context";
import api from "@/lib/axios";

interface User {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "DELIVERY_PARTNER" | "ADMIN";
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  isLoading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: "CUSTOMER" | "DELIVERY_PARTNER" | "ADMIN";
  address?: string;
  vehicleType?: string;
}

// API functions
const authApi = {
  getProfile: async (): Promise<User> => {
    const { data } = await api.get("/auth/profile");
    return data.data;
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<User> => {
    const { data } = await api.post("/auth/login", credentials);
    if (data.data.accessToken) {
      localStorage.setItem("accessToken", data.data.accessToken);
    }
    return data.data.user;
  },

  register: async (registerData: RegisterData): Promise<User> => {
    const { data } = await api.post("/auth/register", registerData);
    if (data.data.accessToken) {
      localStorage.setItem("accessToken", data.data.accessToken);
    }
    return data.data.user;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
    localStorage.removeItem("accessToken");
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Query for checking auth status
  const {
    data: user = null,
    isLoading,
    refetch: checkAuth,
  } = useQuery({
    queryKey: ["auth", "profile"],
    queryFn: authApi.getProfile,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    enabled: !!localStorage.getItem("accessToken"), // Only run if token exists
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "profile"], data);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "profile"], data);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "profile"], null);
      queryClient.clear(); // Clear all queries on logout
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (registerData: RegisterData) => {
    await registerMutation.mutateAsync(registerData);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        checkAuth: () => checkAuth().then(() => {}),
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
