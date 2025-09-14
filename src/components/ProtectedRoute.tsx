import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom'; // Importar useLocation
import { Skeleton } from '@/components/ui/skeleton';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation(); // Obter a localização atual

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
    return <Navigate to="/login" replace />;
  }

  // Rotas permitidas mesmo com status de pagamento pendente
  const allowedPathsForPendingPayment = ['/upgrade', '/payment'];
  const isTryingToAccessPaymentRelatedPage = allowedPathsForPendingPayment.includes(location.pathname);

  // Se o usuário está logado, mas o status de pagamento não é 'paid',
  // e ele NÃO está tentando acessar uma página relacionada a pagamento,
  // então redireciona para a página de upgrade.
  if (user && user.user_metadata?.payment_status !== 'paid' && !isTryingToAccessPaymentRelatedPage) {
    return <Navigate to="/upgrade" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;