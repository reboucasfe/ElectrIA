import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Welcome back, {user?.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is your protected dashboard. Only logged-in users can see this.</p>
          <Button onClick={signOut} className="mt-4">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;