import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { API_CONFIG } from "./lib/api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import FinOps from "./pages/FinOps";
import Events from "./pages/Events";
import Calendar from "./pages/Calendar";
import Media from "./pages/Media";
import Sponsorships from "./pages/Sponsorships";
import Notes from "./pages/Notes";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    fetch(`${API_CONFIG.BASE_URL}/csrf-token`, { credentials: 'include' }).catch(() => { });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/members" element={<Members />} />
              <Route path="/finops" element={<FinOps />} />
              <Route path="/events" element={<Events />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/media" element={<Media />} />
              <Route path="/sponsorships" element={<Sponsorships />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/admin" element={<Admin />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
