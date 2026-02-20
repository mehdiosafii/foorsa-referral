import { useState, useEffect } from "react";
import type { User } from "@shared/schema";

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("ambassador_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("ambassador_user");
      setUser(stored ? JSON.parse(stored) : null);
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("ambassador_login", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("ambassador_login", handleStorageChange);
    };
  }, []);

  const login = (userData: User) => {
    localStorage.setItem("ambassador_user", JSON.stringify(userData));
    setUser(userData);
    window.dispatchEvent(new Event("ambassador_login"));
  };

  const logout = () => {
    localStorage.removeItem("ambassador_user");
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    authType: user ? "ambassador" as const : null,
    login,
    logout,
  };
}
