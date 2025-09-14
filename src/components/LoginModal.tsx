"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginFormContent from "@/components/LoginFormContent";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegisterModal: (planId?: string, billingCycle?: 'monthly' | 'annual') => void;
}

const LoginModal = ({ isOpen, onClose, onOpenRegisterModal }: LoginModalProps) => {
  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in-0"
      onMouseDown={handleOverlayMouseDown}
    >
      <Card className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Entre com seu email e senha ou use sua conta Google</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginFormContent onClose={onClose} onOpenRegisterModal={onOpenRegisterModal} />
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginModal;