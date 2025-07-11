import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: (failureCount, error) => {
      // Only retry on network errors, not on 401s
      return failureCount < 2 && !error.message.includes('401');
    },
    staleTime: 30 * 1000, // 30 seconds - shorter for development
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Enable refetch on window focus
    refetchOnMount: true, // Enable refetch on mount
    refetchOnReconnect: true, // Enable refetch on reconnect
    refetchInterval: 60 * 1000, // Refetch every minute to maintain auth state
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
