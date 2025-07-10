import { Switch, Route } from "wouter";
import { Calendar } from "lucide-react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import MyEvents from "@/pages/my-events";
import Browse from "@/pages/browse";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="max-w-sm mx-auto bg-gradient-to-br from-primary to-accent min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="mb-8">
            <Calendar className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">EventConnect</h1>
            <p className="text-lg opacity-90">Discover amazing events near you</p>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/profile" component={Profile} />
          <Route path="/my-events" component={MyEvents} />
          <Route path="/browse" component={Browse} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
