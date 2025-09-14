import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { isSupabaseConfigured } from "./lib/supabaseClient";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import UpdatePassword from "./pages/UpdatePassword"; // Importando a nova página

const queryClient = new QueryClient();

const SupabaseSetupMessage = () => (
  <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
    <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-xl text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Needed</h1>
      <p className="text-gray-700 mb-2">
        Your Supabase connection details are missing.
      </p>
      <p className="text-gray-600 text-sm mb-6">
        The application cannot start until you provide the Supabase URL and Anon Key.
      </p>
      <div className="text-left bg-gray-50 p-4 rounded-md border border-gray-200">
        <h2 className="font-semibold text-gray-800 mb-2">What to do:</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Go to the <strong>Integrations</strong> tab in the Dyad UI.</li>
          <li>Find the Supabase integration (or add it if it's not there).</li>
          <li>Enter your project's <strong>URL</strong> and <strong>Anon Key</strong>.</li>
          <li>Click <strong>Save</strong>.</li>
          <li>Click the <strong>Rebuild</strong> button above the chat to apply the changes.</li>
        </ol>
      </div>
    </div>
  </div>
);

const App = () => {
  if (!isSupabaseConfigured) {
    return <SupabaseSetupMessage />;
  }

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/update-password" element={<UpdatePassword />} /> {/* Nova rota */}
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;