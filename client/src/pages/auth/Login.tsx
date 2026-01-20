import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/axios";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: "CUSTOMER" | "DELIVERY_PARTNER" | "ADMIN";
    };
    accessToken?: string;
  };
}

// API function
const loginUser = async (credentials: LoginCredentials) => {
  const { data } = await api.post<LoginResponse>("/auth/login", credentials);
  if (data.data.accessToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
  }
  return data.data.user;
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case "ADMIN":
        navigate("/admin/dashboard", { replace: true });
        break;
      case "DELIVERY_PARTNER":
        navigate("/delivery/dashboard", { replace: true });
        break;
      case "CUSTOMER":
        navigate("/customer/dashboard", { replace: true });
        break;
      default:
        navigate("/", { replace: true });
    }
  };
  // Login mutation using TanStack Query
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (userData) => {
      // Redirect based on role after successful login
      redirectBasedOnRole(userData.role);
    },
  });

  // Redirect if already logged in - use user.id to prevent infinite loop
  useEffect(() => {
    if (user?.id) {
      redirectBasedOnRole(user.role);
    }
  }, [user?.id]); // Only depend on user.id, not the entire user object

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

      {loginMutation.isError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {loginMutation.error instanceof Error
            ? loginMutation.error.message
            : "Login failed. Please try again."}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
