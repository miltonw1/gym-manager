import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { subscriptionsService } from '@/services/subscriptions.service';
import { extractApiError } from '@/lib/utils';
import type {
  SubscriptionPlan,
  SubscriptionHistoryItem,
} from '@/types/subscriptions.types';

const BillingPage = () => {
  const { subscription, setSubscription } = useAuthStore();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [history, setHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOutPlanId, setCheckingOutPlanId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Destraba pagos que hayan quedado pendientes (acredita días si MP los aprobó).
      await subscriptionsService.reconcile();
      const [plansData, historyData, statusData] = await Promise.all([
        subscriptionsService.getPlans(),
        subscriptionsService.getHistory(),
        subscriptionsService.getStatus(),
      ]);
      setPlans(plansData);
      setHistory(historyData);
      setSubscription(statusData);
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  }, [setSubscription]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(Number(amount));
  };

  const handleSubscribe = async (planId: number) => {
    setError(null);
    setCheckingOutPlanId(planId);
    try {
      const checkout = await subscriptionsService.checkout(planId);
      const initPoint = checkout.initPoint || checkout.sandboxInitPoint;
      if (!initPoint) {
        setError('No se pudo generar el pago. Intentá de nuevo.');
        return;
      }
      localStorage.setItem('gym-manager-pending-subscription', String(checkout.subscriptionId));
      window.location.href = initPoint;
    } catch (err) {
      const message = extractApiError(err);
      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setCheckingOutPlanId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-600 hover:bg-green-700">Aprobado</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Pendiente</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rechazado</Badge>;
      case 'EXPIRED':
        return <Badge variant="secondary">Expirado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-bold tracking-tight">Mi Suscripción</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado de la cuenta</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {subscription?.isReadOnly ? (
                    <Badge variant="destructive">Solo lectura</Badge>
                  ) : (
                    <Badge className="bg-green-600 hover:bg-green-700">Activa</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {subscription?.accessUntil ? (
                    <span>
                      Vence el {new Date(subscription.accessUntil).toLocaleDateString('es-AR')} ({subscription.daysRemaining} días restantes)
                    </span>
                  ) : (
                    <span>Sin suscripción activa</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="text-sm font-medium text-destructive text-center bg-destructive/10 rounded-md p-3">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.days} días de uso</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 flex-1">
                  <div className="text-3xl font-bold">{formatCurrency(plan.price)}</div>
                  <Button
                    className="mt-auto gap-2"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={checkingOutPlanId !== null}
                  >
                    {checkingOutPlanId === plan.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    Pagar con Mercado Pago
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial de pagos</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground italic">
                  Aún no hay pagos registrados.
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{item.planName || 'Trial'}</span>
                          {getStatusBadge(item.status)}
                        </div>
                        {item.paidAt && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Pagado el {new Date(item.paidAt).toLocaleDateString('es-AR')}
                          </p>
                        )}
                      </div>
                      <div className="text-sm font-medium">{formatCurrency(item.amount)}</div>
                      {item.status === 'APPROVED' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BillingPage;
