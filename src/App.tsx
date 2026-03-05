import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import AppSidebar from "@/components/AppSidebar";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm animate-pulse">A carregar...</p>
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <AppProvider>
      <SidebarProvider>
        <div className="min-h-screen flex flex-col w-full">
          <Header />
          <div className="flex flex-1 w-full">
            <AppSidebar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          
        </div>
      </SidebarProvider>
    </AppProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ProtectedLayout />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
