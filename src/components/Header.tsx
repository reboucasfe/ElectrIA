"use client";

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

interface HeaderProps {
  onOpenRegisterModal?: (planId?: string, billingCycle?: 'monthly' | 'annual') => void;
  onOpenLoginModal?: () => void; // Nova prop para abrir o modal de login
}

export const Header = ({ onOpenRegisterModal, onOpenLoginModal }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isPaid = useMemo(() => user?.user_metadata?.payment_status === 'paid', [user]);

  const handleSignOut = async () => {
    await signOut();
    if (location.pathname === '/payment') {
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  const handleStartNowClick = () => {
    if (onOpenRegisterModal) {
      onOpenRegisterModal();
    } else {
      navigate('/register');
    }
  };

  const handleLoginClick = () => {
    if (onOpenLoginModal) {
      onOpenLoginModal();
    } else {
      navigate('/login');
    }
  };

  const handleFinalizeSubscriptionClick = () => {
    navigate('/payment');
  };

  const handleLogoClick = () => {
    if (!user) { // Apenas se o usuário não estiver logado
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link 
          to={user ? "/#planos" : "/"} 
          className="flex items-center"
          onClick={handleLogoClick} // Adicionado onClick para scroll-to-top
        >
          <Zap className="h-8 w-8 text-blue-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">EletroProposta IA</span>
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/#como-funciona" className="text-gray-600 hover:text-blue-600 transition-colors">Como Funciona</Link>
          <Link to="/#planos" className="text-gray-600 hover:text-blue-600 transition-colors">Planos</Link>
          <Link to="/#faq" className="text-gray-600 hover:text-blue-600 transition-colors">FAQ</Link>
        </div>
        <div className="flex items-center space-x-4">
          {user ? ( // Usuário está logado
            isPaid ? ( // Usuário é pagante
              <>
                <Button onClick={() => navigate('/dashboard')} className="bg-blue-600 hover:bg-blue-700">Dashboard</Button>
                <Button variant="ghost" onClick={handleSignOut}>Sair</Button>
              </>
            ) : ( // Usuário está logado, mas NÃO é pagante
              <>
                <Button variant="ghost" onClick={handleSignOut}>Sair</Button>
                <Button onClick={handleFinalizeSubscriptionClick} className="bg-blue-600 hover:bg-blue-700">Finalizar Assinatura</Button>
              </>
            )
          ) : ( // Usuário NÃO está logado
            <>
              <Button variant="ghost" onClick={handleLoginClick}>Login</Button>
              <Button onClick={handleStartNowClick} className="bg-blue-600 hover:bg-blue-700">Começar Agora</Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};