"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'; // Importar Dialog components
import LoginFormContent from "@/components/LoginFormContent";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegisterModal: (planId?: string, billingCycle?: 'monthly' | 'annual') => void;
}

const LoginModal = ({ isOpen, onClose, onOpenRegisterModal }: LoginModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]"> {/* sm:max-w-[425px] para responsividade */}
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl">Login</DialogTitle>
          <DialogDescription>Entre com seu email e senha ou use sua conta Google</DialogDescription>
        </DialogHeader>
        <LoginFormContent onClose={onClose} onOpenRegisterModal={onOpenRegisterModal} />
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;