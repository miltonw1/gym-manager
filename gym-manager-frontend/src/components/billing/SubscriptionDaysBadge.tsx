import { useAuthStore } from '@/store/useAuthStore';
import { Badge } from '@/components/ui/badge';

const LOW_DAYS_THRESHOLD = 14;

const SubscriptionDaysBadge = () => {
  const { subscription } = useAuthStore();

  if (!subscription) {
    return null;
  }

  if (!subscription.active || subscription.daysRemaining <= 0) {
    return (
      <Badge
        variant="destructive"
        title="Tu suscripción venció"
        aria-label="Suscripción vencida"
      >
        Suscripción vencida
      </Badge>
    );
  }

  const low = subscription.daysRemaining < LOW_DAYS_THRESHOLD;

  return (
    <Badge
      variant={low ? 'destructive' : 'default'}
      className={low ? undefined : 'bg-green-600 text-white hover:bg-green-700'}
      title={`Quedan ${subscription.daysRemaining} días de suscripción`}
      aria-label={`Quedan ${subscription.daysRemaining} días de suscripción`}
    >
      {subscription.daysRemaining} días
    </Badge>
  );
};

export default SubscriptionDaysBadge;
