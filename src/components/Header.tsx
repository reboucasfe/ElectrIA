"use client";

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, Menu } from 'lucide-react'; // Importar Menu
import { useAuth } from '@/contexts/AuthContext';
import { useMemo, useState } from 'react'; // Importar useState
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // Importar Sheet components
import { cn } from '@/lib/utils'; // Importar cn para classes condicionais

interface HeaderProps {
  onOpenRegisterModal?: (planId?: string, billingCycle?: 'monthly' | 'annual') => void;
  onOpenLoginModal?: () => void;
}

export const Header = ({ onOpenRegisterModal, onOpenLoginModal }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Estado para controlar o menu mobile

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
    setIsMobileMenuOpen(false); // Fechar menu mobile ao clicar
    if (onOpenRegisterModal) {
      onOpenRegisterModal();
    } else {
      navigate('/register');
    }
  };

  const handleLoginClick = () => {
    setIsMobileMenuOpen(false); // Fechar menu mobile ao clicar
    if (onOpenLoginModal) {
      onOpenLoginModal();
    } else {
      navigate('/login');
    }
  };

  const handleFinalizeSubscriptionClick = () => {
    setIsMobileMenuOpen(false); // Fechar menu mobile ao clicar
    navigate('/payment');
  };

  const handleLogoClick = () => {
    setIsMobileMenuOpen(false); // Fechar menu mobile ao clicar
    if (!user) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavLinkClick = (path: string) => {
    setIsMobileMenuOpen(false); // Fechar menu mobile ao clicar em um link
    navigate(path);
  };

  const navItems = [
    { href: '/#como-funciona', label: 'Como Funciona' },
    { href: '/#planos', label: 'Planos' },
    { href: '/#faq', label: 'FAQ' },
    { href: '/#contato', label: 'Contato' },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link 
          to={user ? "/#planos" : "/"} 
          className="flex items-center"
          onClick={handleLogoClick}
        >
          <Zap className="h-8 w-8 text-blue-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">EletricIA</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map(item => (
            <Link key={item.href} to={item.href} className="text-gray-600 hover:text-blue-600 transition-colors">
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <div className="flex flex-col h-full bg-gray-50">
                <div className="p-4 border-b">
                  <Link to={user ? "/#planos" : "/"} className="flex items-center" onClick={handleLogoClick}>
                    <Zap className="h-8 w-8 text-blue-600 mr-2" />
                    <span className="text-xl font-bold text-gray-900">EletricIA</span>
                  </Link>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => handleNavLinkClick(item.href)}
                      className={cn(
                        'flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-200',
                        location.hash === item.href.split('#')[1] && 'bg-blue-600 text-white hover:bg-blue-700'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="pt-4 border-t mt-4 space-y-2">
                    {user ? (
                      isPaid ? (
                        <>
                          <Button onClick={() => handleNavLinkClick('/dashboard')} className="w-full bg-blue-600 hover:bg-blue-700">Dashboard</Button>
                          <Button variant="ghost" onClick={handleSignOut} className="w-full">Sair</Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" onClick={handleSignOut} className="w-full">Sair</Button>
                          <Button onClick={handleFinalizeSubscriptionClick} className="w-full bg-blue-600 hover:bg-blue-700">Finalizar Assinatura</Button>
                        </>
                      )
                    ) : (
                      <>
                        <Button variant="ghost" onClick={handleLoginClick} className="w-full">Login</Button>
                        <Button onClick={handleStartNowClick} className="w-full bg-blue-600 hover:bg-blue-700">Começar Agora</Button>
                      </>
                    )}
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Auth/Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            isPaid ? (
              <>
                <Button onClick={() => navigate('/dashboard')} className="bg-blue-600 hover:bg-blue-700">Dashboard</Button>
                <Button variant="ghost" onClick={handleSignOut}>Sair</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={handleSignOut}>Sair</Button>
                <Button onClick={handleFinalizeSubscriptionClick} className="bg-blue-600 hover:bg-blue-700">Finalizar Assinatura</Button>
              </>
            )
          ) : (
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