import { useNavigate } from 'react-router';
import { useAuthStore } from '@/store/useAuthStore';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ReadOnlyBanner = () => {
  const { subscription } = useAuthStore();
  const navigate = useNavigate();

  if (!subscription?.isReadOnly) {
    return null;
  }

  return (
    <div className="w-full bg-destructive text-destructive-foreground">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-2 py-2.5 px-4 text-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Tu suscripción venció. Podés ver tus datos, pero no editarlos. Renová para
            volver a usar la plataforma.
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5 whitespace-nowrap"
          onClick={() => navigate('/billing')}
        >
          <RefreshCw className="h-4 w-4" />
          Renovar suscripción
        </Button>
      </div>
    </div>
  );
};

export default ReadOnlyBanner;
