import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const ProtectedRoute = () => {
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
    // Se não estiver logado, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  // Usuário está logado
  const paymentStatus = user.user_metadata?.payment_status;
  const isPaid = paymentStatus === 'paid';
  const currentPath = location.pathname;

  // Rotas permitidas para usuários com status de pagamento pendente/não pago
  const allowedPathsForUnpaid = ['/payment']; 

  // Se o usuário NÃO é pagante
  if (!isPaid) {
    // Se ele está tentando acessar a página de pagamento, permite
    if (allowedPathsForUnpaid.includes(currentPath)) {
      return <Outlet />;
    }
    // Se ele está tentando acessar qualquer outra rota protegida (dashboard, perfil, configurações, upgrade),
    // redireciona-o para a página de pagamento.
    return <Navigate to="/payment" replace />;
  }

  // Se o usuário É pagante
  // Se um usuário pagante de alguma forma cair na página de pagamento, redireciona-o para o dashboard
  // (a menos que esteja explicitamente passando por um fluxo de upgrade, que seria tratado por estado,
  // mas para simplicidade, se ele é pagante e está em /payment, assume-se que não deveria estar lá).
  if (isPaid && currentPath === '/payment') {
    return <Navigate to="/dashboard" replace />;
  }

  // Se o usuário é pagante e está em qualquer outra rota protegida, permite o acesso
  return <Outlet />;
};

export default ProtectedRoute;