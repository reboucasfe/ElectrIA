import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginFormContent from '@/components/LoginFormContent';

const Login = () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Entre com seu email e senha ou use sua conta Google</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginFormContent />
      </CardContent>
    </Card>
  );
};

export default Login;