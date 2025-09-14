import { Header } from '@/components/Header';
import { Outlet } from 'react-router-dom';

interface AuthLayoutProps {
  onOpenRegisterModal: () => void;
  onOpenLoginModal: () => void; // Nova prop
}

const AuthLayout = ({ onOpenRegisterModal, onOpenLoginModal }: AuthLayoutProps) => {
  return (
    <>
      <Header onOpenRegisterModal={onOpenRegisterModal} onOpenLoginModal={onOpenLoginModal} />
      <main className="flex items-center justify-center py-20 bg-gray-50 min-h-[calc(100vh-80px)]">
        <Outlet />
      </main>
    </>
  );
};

export default AuthLayout;