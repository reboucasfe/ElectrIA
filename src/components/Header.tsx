import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onOpenRegisterModal?: () => void;
}

export const Header = ({ onOpenRegisterModal }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleStartNowClick = () => {
    if (onOpenRegisterModal) {
      onOpenRegisterModal();
    } else {
      navigate('/register'); // Fallback if prop is not provided (shouldn't happen in App.tsx)
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to={user ? "/#planos" : "/"} className="flex items-center">
          <Zap className="h-8 w-8 text-blue-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">EletroProposta IA</span>
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/#como-funciona" className="text-gray-600 hover:text-blue-600 transition-colors">Como Funciona</Link>
          <Link to="/#planos" className="text-gray-600 hover:text-blue-600 transition-colors">Planos</Link>
          <Link to="/#faq" className="text-gray-600 hover:text-blue-600 transition-colors">FAQ</Link>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>Dashboard</Button>
              <Button onClick={handleSignOut}>Sair</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
              <Button onClick={handleStartNowClick} className="bg-blue-600 hover:bg-blue-700">Começar Agora</Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};