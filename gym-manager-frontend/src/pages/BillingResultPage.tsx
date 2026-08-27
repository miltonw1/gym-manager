import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Clock, RefreshCw, Home, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { subscriptionsService } from '@/services/subscriptions.service';

const BillingResultPage = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') || 'pending';
  const navigate = useNavigate();
  const { loadProfile } = useAuthStore();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const subscriptionIdParam = searchParams.get('subscriptionId');
  const storedSubscriptionId = localStorage.getItem('gym-manager-pending-subscription');
  const subscriptionId = subscriptionIdParam || storedSubscriptionId;

  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const handleVerify = useCallback(async () => {
    if (!subscriptionId || verified) return;
    setVerifying(true);
    try {
      await subscriptionsService.verify(Number(subscriptionId));
      await refreshProfile();
      localStorage.removeItem('gym-manager-pending-subscription');
      setVerified(true);
    } catch (error) {
      console.error('Error verifying payment:', error);
    } finally {
      setVerifying(false);
    }
  }, [subscriptionId, verified, refreshProfile]);

  // Verificación automática al volver de Mercado Pago (cubre el sandbox donde
  // el webhook no dispara). En producción el webhook lo hace en paralelo.
  useEffect(() => {
    if ((status === 'success' || status === 'pending') && subscriptionId) {
      handleVerify();
    }
  }, [status, subscriptionId, handleVerify]);

  const config = {
    success: {
      icon: <CheckCircle2 className="h-14 w-14 text-green-600" />,
      title: '¡Pago exitoso!',
      description: 'Tus días de uso se acreditaron correctamente.',
    },
    pending: {
      icon: <Clock className="h-14 w-14 text-yellow-500" />,
      title: 'Pago en revisión',
      description: 'Estamos esperando la confirmación de tu pago.',
    },
    failure: {
      icon: <XCircle className="h-14 w-14 text-destructive" />,
      title: 'El pago no se completó',
      description: 'Podés volver a intentarlo cuando quieras.',
    },
  }[status] || {};

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/50 p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-3">
          <div className="flex justify-center">{config.icon}</div>
          <CardTitle className="text-2xl">{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(status === 'pending' || status === 'success') && subscriptionId && (
            <Button className="w-full gap-2" onClick={handleVerify} disabled={verifying || verified}>
              {verifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {verified ? 'Pago confirmado' : 'Confirmar pago'}
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2" onClick={() => navigate('/billing')}>
              <CreditCard className="h-4 w-4" />
              Ir a Suscripción
            </Button>
            <Button className="flex-1 gap-2" onClick={() => navigate('/dashboard')}>
              <Home className="h-4 w-4" />
              Ir al Dashboard
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            ¿Volviste por otro medio? También podés{' '}
            <Link to="/billing" className="text-primary hover:underline">
              revisar tu suscripción
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingResultPage;
