import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paymentsService } from '@/services/payments.service';
import { enrollmentsService } from '@/services/enrollments.service';
import { membersService } from '@/services/members.service';
import type { MonthlyRevenue } from '@/types/payments.types';
import { DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router';
import MembersTable from '@/components/members/MembersTable';
import { useAuthStore } from '@/store/useAuthStore';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { gym } = useAuthStore();
  const [revenue, setRevenue] = useState<MonthlyRevenue | null>(null);
  const [expiringCount, setExpiringCount] = useState<number>(0);
  const [expiredCount, setExpiredCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [revenueData, expiringData, expiredCountData] = await Promise.all([
          paymentsService.getRevenue(),
          enrollmentsService.findExpiring(7),
          membersService.getExpiredCount(),
        ]);
        setRevenue(revenueData);
        setExpiringCount(expiringData.length);
        setExpiredCount(expiredCountData);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <div className='flex items-center justify-between py-4'>
        <h1 className='text-2xl font-bold tracking-tight'>
          Dashboard{gym ? ` — ${gym.name}` : ''}
        </h1>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Recaudación del Mes</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {loading ? '...' : formatCurrency(revenue?.totalRevenue || 0)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {loading ? '' : `${revenue?.transactionCount || 0} transacciones registradas`}
            </p>
          </CardContent>
        </Card>

        <Card
          className='cursor-pointer hover:bg-muted/50 transition-colors'
          onClick={() => navigate('/dashboard/expiring-members')}
        >
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Vencimientos Próximos</CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{loading ? '...' : expiringCount}</div>
            <p className='text-xs text-muted-foreground'>
              Socios con membresía por vencer en los próximos 7 días
            </p>
          </CardContent>
        </Card>

        <Card
          className='cursor-pointer border-red-200 hover:bg-red-50/50 dark:border-red-900 dark:hover:bg-red-500/10 transition-colors'
          onClick={() => navigate('/dashboard/expired-members')}
        >
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-red-600 dark:text-red-400'>Vencidos (30d)</CardTitle>
            <AlertTriangle className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-700 dark:text-red-400'>{loading ? '...' : expiredCount}</div>
            <p className='text-xs text-red-600/80 dark:text-red-400/80'>
              Membresías que vencieron en los últimos 30 días
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='mt-4 flex-1 rounded-xl bg-background border p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-semibold tracking-tight'>Gestión de Socios</h2>
        </div>

        <MembersTable />
      </div>
    </div>
  );
};

export default DashboardPage;
