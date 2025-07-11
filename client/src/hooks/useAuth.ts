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
    staleTime: 5 * 1000, // 5 seconds - very short for development
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Enable refetch on window focus
    refetchOnMount: true, // Enable refetch on mount
    refetchOnReconnect: true, // Enable refetch on reconnect
    refetchInterval: 30 * 1000, // Refetch every 30 seconds to maintain auth state
  });

  // Debug auth state in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Auth Hook Debug:', { user: !!user, isLoading, error: error?.message });
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
