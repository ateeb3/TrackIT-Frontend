import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";

// 1. Define the shape of our User and Context
interface User {
  email: string;
  roles: string[];
  sub: string; // ID
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// 2. Create the Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        
        // Map JWT claims to our User object
        // Note: .NET Identity often puts roles in "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        // We check for that long string OR just "role"
        const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role;
        
        setUser({
          email: decoded.email,
          roles: Array.isArray(roleClaim) ? roleClaim : [roleClaim],
          sub: decoded.sub
        });

        // Set the token in Axios headers
        localStorage.setItem("token", token);
      } catch (e) {
        console.error("Invalid Token", e);
        logout();
      }
    } else {
      localStorage.removeItem("token");
    }
    setIsLoading(false);
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    // Optional: Refresh page to clear all states
    // window.location.href = '/login';
  };

  // Helper to check if user is Admin
  const isAdmin = user?.roles.includes("Admin") ?? false;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom Hook to use the context easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};