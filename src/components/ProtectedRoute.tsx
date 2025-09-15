import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

interface ProtectedRouteProps {
  children?: React.ReactNode; // Torna children opcional
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col space-y-3 p-8">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const paymentStatus = user.user_metadata?.payment_status;
  const isPaid = paymentStatus === 'paid';
  const currentPath = location.pathname;

  // Verifica se a navegação para /payment tem uma intenção de upgrade/renovação
  const isUpgradeOrRenewIntent = location.state?.isUpgradeOrRenew === true;

  // Se o usuário NÃO é pagante
  if (!isPaid) {
    // Se ele está tentando acessar a página de pagamento, permite
    if (currentPath === '/payment') {
      return children || <Outlet />; // Renderiza children se fornecido, senão Outlet
    }
    // Se ele está tentando acessar qualquer outra rota protegida (dashboard, perfil, configurações, upgrade),
    // redireciona-o para a página de pagamento.
    return <Navigate to="/payment" replace state={{ from: location }} />;
  }

  // Se o usuário É pagante
  // Se um usuário pagante de alguma forma cair na página de pagamento,
  // mas NÃO com uma intenção de upgrade/renovação, redireciona-o para o dashboard
  if (isPaid && currentPath === '/payment' && !isUpgradeOrRenewIntent) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  // Se o usuário é pagante e está em qualquer outra rota protegida, ou
  // se é pagante e está na página de pagamento COM intenção de upgrade/renovação,
  // permite o acesso
  return children || <Outlet />;
};

export default ProtectedRoute;