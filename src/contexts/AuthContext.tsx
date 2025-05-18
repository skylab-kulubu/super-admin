"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { parseCookies, destroyCookie } from "nookies";
import { jwtDecode } from "jwt-decode";
import { DecodedToken, User } from "@/types";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (role: string) => boolean;
  getRedirectPath: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const cookies = parseCookies();
    const storedToken = cookies.token;

    if (storedToken) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(storedToken);
        if (decodedToken.exp * 1000 > Date.now()) {
          setUser({ id: decodedToken.sub, email: decodedToken.sub, roles: decodedToken.roles }); // Adjust user object as needed
          setToken(storedToken);
        } else {
          // Token expired
          destroyCookie(null, "token", { path: "/" });
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        destroyCookie(null, "token", { path: "/" });
        setUser(null);
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string) => {
    try {
      const decodedToken = jwtDecode<DecodedToken>(newToken);
      setUser({ id: decodedToken.sub, email: decodedToken.sub, roles: decodedToken.roles }); // Adjust as needed
      setToken(newToken);
      // nookies.set will be called on the login page for HttpOnly
    } catch (error) {
      console.error("Failed to decode token on login:", error);
      // Handle error, maybe show a toast
    }
  };

  const logout = () => {
    destroyCookie(null, "token", { path: "/" });
    setUser(null);
    setToken(null);
    router.push("/login");
  };

  const isAuthenticated = () => {
    if (!token) return false;
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      return decodedToken.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  const hasRole = (role: string) => {
    if (user?.roles?.includes("ROLE_ADMIN")) {
      return true; // ROLE_ADMIN has all permissions
    }
    return user?.roles?.includes(role) || false;
  };
  
  const getRedirectPath = () => {
    if (!user || !user.roles) return "/login"; 

    if (user.roles.includes("ROLE_ADMIN")) {
      return "/superadmin"; // ROLE_ADMIN goes to /superadmin
    }

    const roleToPathMap: Record<string, string> = {
      ROLE_BIZBIZE_ADMIN: "/bizbize",
      ROLE_GECEKODU_ADMIN: "/gecekodu", 
      ROLE_AGC_ADMIN: "/agc",
    };

    for (const role of user.roles) {
      if (roleToPathMap[role]) {
        return roleToPathMap[role];
      }
    }
    
    return "/"; // Fallback for authenticated users without a specific role path (should be rare)
  };


  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated, hasRole, getRedirectPath }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
