import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { paymentsService } from '@/services/payments.service';
import type { MonthlyRevenue, RevenueByPlan, RevenuePeriod } from '@/types/payments.types';
import { DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const StatisticsPage = () => {
  const [revenue, setRevenue] = useState<MonthlyRevenue | null>(null);
  const [revenueByPlan, setRevenueByPlan] = useState<RevenueByPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [period, setPeriod] = useState<RevenuePeriod>('month');

  const monthOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        value: `${date.getMonth() + 1}-${date.getFullYear()}`,
        label: format(date, 'MMMM yyyy', { locale: es }),
      });
    }
    return options;
  }, []);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);
        const data = await paymentsService.getRevenue(selectedMonth, selectedYear);
        setRevenue(data);
      } catch (error) {
        console.error('Error fetching revenue:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const fetchByPlan = async () => {
      try {
        const data = await paymentsService.getRevenueByPlan(period, selectedMonth, selectedYear);
        setRevenueByPlan(data);
      } catch (error) {
        console.error('Error fetching revenue by plan:', error);
      }
    };

    fetchByPlan();
  }, [period, selectedMonth, selectedYear]);

  const handleMonthChange = (value: string) => {
    const [month, year] = value.split('-').map(Number);
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const changePercent = revenue?.changePercent ?? null;
  const changeLabel =
    changePercent === null
      ? 'Sin datos del mes anterior'
      : changePercent > 0
        ? `+${changePercent.toFixed(1)}%`
        : changePercent < 0
          ? `${changePercent.toFixed(1)}%`
          : '0%';

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <div className='flex items-center justify-between py-4'>
        <h1 className='text-2xl font-bold tracking-tight'>Estadísticas</h1>
        <Select value={`${selectedMonth}-${selectedYear}`} onValueChange={handleMonthChange}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Seleccionar mes' />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Recaudación del Mes</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2 text-2xl font-bold'>
              {loading ? '...' : formatCurrency(revenue?.totalRevenue || 0)}
            </div>
            <div className='mt-1 flex items-center gap-1 text-xs'>
              {changePercent !== null && !loading && (
                <>
                  {changePercent > 0 ? (
                    <TrendingUp className='h-3.5 w-3.5 text-green-600' />
                  ) : changePercent < 0 ? (
                    <TrendingDown className='h-3.5 w-3.5 text-red-600' />
                  ) : (
                    <Minus className='h-3.5 w-3.5 text-muted-foreground' />
                  )}
                  <span
                    className={
                      changePercent > 0
                        ? 'text-green-600'
                        : changePercent < 0
                          ? 'text-red-600'
                          : 'text-muted-foreground'
                    }
                  >
                    {changeLabel}
                  </span>
                  <span className='text-muted-foreground'>
                    vs {formatCurrency(revenue?.previousMonth.totalRevenue || 0)}
                  </span>
                </>
              )}
            </div>
            <p className='mt-1 text-xs text-muted-foreground'>
              {loading ? '' : `${revenue?.transactionCount || 0} transacciones registradas`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Recaudación por Disciplina</CardTitle>
          <Select value={period} onValueChange={(value) => setPeriod(value as RevenuePeriod)}>
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='Período' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='month'>Mes</SelectItem>
              <SelectItem value='year'>Año</SelectItem>
              <SelectItem value='all'>Todo el tiempo</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex h-[280px] w-full items-center justify-center text-muted-foreground'>
              Cargando...
            </div>
          ) : revenueByPlan && revenueByPlan.items.length > 0 ? (
            <div className='h-[280px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={revenueByPlan.items} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='3 3' vertical={false} />
                  <XAxis dataKey='planName' tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={90}
                    tickFormatter={(value) => formatCurrency(Number(value))}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), 'Total']}
                    labelFormatter={(label) => String(label)}
                  />
                  <Bar dataKey='total' fill='hsl(var(--primary))' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className='flex h-[280px] w-full items-center justify-center text-muted-foreground italic'>
              No hay pagos registrados para este período.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsPage;
