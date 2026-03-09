import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Enrollment } from '@/types/enrollments.types';

interface ExpiringMembersTableProps {
  enrollments: Enrollment[];
}

const ExpiringMembersTable = ({ enrollments }: ExpiringMembersTableProps) => {
  const getDaysRemaining = (endDate: string) => {
    const days = differenceInDays(parseISO(endDate), new Date());
    if (days < 0) return 'Vencido';
    if (days === 0) return 'Vence hoy';
    if (days === 1) return 'Vence mañana';
    return `En ${days} días`;
  };

  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Socio</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Fecha Vencimiento</TableHead>
            <TableHead>Días Restantes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => (
            <TableRow key={enrollment.id}>
              <TableCell className="font-medium">
                {enrollment.member?.firstName} {enrollment.member?.lastName}
              </TableCell>
              <TableCell>{enrollment.plan?.name}</TableCell>
              <TableCell>
                {format(parseISO(enrollment.endDate), 'PP', { locale: es })}
              </TableCell>
              <TableCell>{getDaysRemaining(enrollment.endDate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExpiringMembersTable;
