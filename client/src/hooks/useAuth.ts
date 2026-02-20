import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

async function fetchWithNullOn401(url: string): Promise<User | null> {
  const res = await fetch(url, { credentials: "include" });
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export function useAuth() {
  const { data: replitUser, isLoading: replitLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: () => fetchWithNullOn401("/api/auth/user"),
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const { data: ambassadorUser, isLoading: ambassadorLoading } = useQuery<User | null>({
    queryKey: ["/api/ambassador/me"],
    queryFn: () => fetchWithNullOn401("/api/ambassador/me"),
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const user = replitUser || ambassadorUser || null;
  const isLoading = replitLoading || ambassadorLoading;
  const authType = replitUser ? "replit" : ambassadorUser ? "ambassador" : null;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    authType,
  };
}
