import React, { useState } from "react";
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
import UpdatePassword from "./pages/UpdatePassword";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Upgrade from "./pages/Upgrade";
import WhatsAppButton from "./components/WhatsAppButton";
import RegisterModal from "./components/RegisterModal";
import LoginModal from "./components/LoginModal";
import PaymentPage from "./pages/PaymentPage";
import ProposalsList from "./pages/ProposalsList";
import ProposalsOverview from "./pages/ProposalsOverview";
import ProposalFormPage from "./pages/ProposalFormPage";
import ProposalsInProgress from "./pages/ProposalsInProgress";
import ProposalsClosed from "./pages/ProposalsClosed";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Services from "./pages/Services";
import ProposalsKanbanView from "./components/proposals/ProposalsKanbanView"; // Importar o novo componente Kanban
import Finance from "./pages/Finance"; // Importar a nova página de Finanças

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
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedPlanIdForRegister, setSelectedPlanIdForRegister] = useState<string | undefined>(undefined);
  const [selectedBillingCycleForRegister, setSelectedBillingCycleForRegister] = useState<'monthly' | 'annual' | undefined>(undefined);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleOpenRegisterModal = (planId?: string, billingCycle?: 'monthly' | 'annual') => {
    console.log("App.tsx: handleOpenRegisterModal received planId:", planId, "and billingCycle:", billingCycle);
    setIsLoginModalOpen(false);
    setSelectedPlanIdForRegister(planId);
    setSelectedBillingCycleForRegister(billingCycle);
    setIsRegisterModalOpen(true);
  };

  const handleOpenLoginModal = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  if (!isSupabaseConfigured) {
    return <SupabaseSetupMessage />;
  }

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter basename="/eletricia"> {/* <--- ATENÇÃO: Substitua 'eletricia' pelo nome do seu repositório GitHub */}
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index onOpenRegisterModal={handleOpenRegisterModal} onOpenLoginModal={handleOpenLoginModal} />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            
            {/* Auth Routes with Header */}
            <Route element={<AuthLayout onOpenRegisterModal={handleOpenRegisterModal} onOpenLoginModal={handleOpenLoginModal} />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register onOpenLoginModal={handleOpenLoginModal} />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
            </Route>
            
            {/* Protected Dashboard Routes (apenas para usuários pagantes) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/upgrade" element={<Upgrade />} />
                <Route path="/services" element={<Services />} />
                <Route path="/proposals" element={<ProposalsList />} />
                <Route path="/proposals-overview" element={<ProposalsOverview />} />
                <Route path="/proposals/new" element={<ProposalFormPage />} />
                <Route path="/proposals/edit/:id" element={<ProposalFormPage />} />
                <Route path="/proposals/in-progress" element={<ProposalsInProgress />} />
                <Route path="/proposals/closed" element={<ProposalsClosed />} />
                <Route path="/proposals/kanban" element={<ProposalsKanbanView />} />
                <Route path="/finance" element={<Finance />} /> {/* Nova rota para Finanças */}
              </Route>
            </Route>

            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <WhatsAppButton />
          <RegisterModal
            isOpen={isRegisterModalOpen}
            onClose={() => setIsRegisterModalOpen(false)}
            selectedPlanId={selectedPlanIdForRegister}
            selectedBillingCycle={selectedBillingCycleForRegister}
            onOpenLoginModal={handleOpenLoginModal}
          />
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onOpenRegisterModal={handleOpenRegisterModal}
          />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;