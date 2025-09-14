import { Header } from '@/components/Header';
import { Outlet } from 'react-router-dom';

interface AuthLayoutProps {
  onOpenRegisterModal: () => void;
}

const AuthLayout = ({ onOpenRegisterModal }: AuthLayoutProps) => {
  return (
    <>
      <Header onOpenRegisterModal={onOpenRegisterModal} />
      <main className="flex items-center justify-center py-20 bg-gray-50 min-h-[calc(100vh-80px)]">
        <Outlet />
      </main>
    </>
  );
};

export default AuthLayout;