import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

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

  // Se o usuário está logado, mas o status de pagamento não é 'paid', redireciona para a página de upgrade
  if (user && user.user_metadata?.payment_status !== 'paid') {
    return <Navigate to="/upgrade" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;