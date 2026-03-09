import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, RefreshCw, Loader2 } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Enrollment } from '@/types/enrollments.types';
import type { Member } from '@/types/members.types';
import ViewMemberModal from './ViewMemberModal';
import { enrollmentsService } from '@/services/enrollments.service';

interface ExpiringMembersTableProps {
  enrollments: Enrollment[];
  onUpdate?: () => void;
}

const ExpiringMembersTable = ({ enrollments, onUpdate }: ExpiringMembersTableProps) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [renewingId, setRenewingId] = useState<number | null>(null);

  const getDaysRemaining = (endDate: string) => {
    const days = differenceInDays(parseISO(endDate), new Date());
    if (days < 0) return 'Vencido';
    if (days === 0) return 'Vence hoy';
    if (days === 1) return 'Vence mañana';
    return `En ${days} días`;
  };

  const handleOpenViewModal = (enrollment: Enrollment) => {
    if (enrollment.member) {
      setSelectedMember({
        id: enrollment.memberId,
        firstName: enrollment.member.firstName,
        lastName: enrollment.member.lastName,
        dni: enrollment.member.dni,
        gymId: 0,
        joinDate: '',
        active: true,
      } as Member);
      setIsViewModalOpen(true);
    }
  };

  const handleQuickRenew = async (enrollmentId: number) => {
    try {
      setRenewingId(enrollmentId);
      await enrollmentsService.renew(enrollmentId);
      if (onUpdate) await onUpdate();
    } catch (error) {
      console.error('Error al renovar:', error);
      alert('Hubo un error al procesar la renovación.');
    } finally {
      setRenewingId(null);
    }
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
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => {
            const isRenewing = renewingId === enrollment.id;
            return (
              <TableRow key={enrollment.id}>
                <TableCell className="font-medium">
                  {enrollment.member?.firstName} {enrollment.member?.lastName}
                </TableCell>
                <TableCell>{enrollment.plan?.name}</TableCell>
                <TableCell>
                  {format(parseISO(enrollment.endDate), 'PP', { locale: es })}
                </TableCell>
                <TableCell>{getDaysRemaining(enrollment.endDate)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Renovación Rápida"
                      disabled={isRenewing}
                      onClick={() => handleQuickRenew(enrollment.id)}
                    >
                      {isRenewing ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <RefreshCw className="h-4 w-4 text-primary" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Ver detalle"
                      onClick={() => handleOpenViewModal(enrollment)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <ViewMemberModal
        member={selectedMember}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onUpdate={() => onUpdate?.()}
      />
    </div>
  );
};

export default ExpiringMembersTable;
