import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, RefreshCw, Loader2 } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Member } from '@/types/members.types';
import type { Enrollment } from '@/types/enrollments.types';
import ViewMemberModal from './ViewMemberModal';
import { enrollmentsService } from '@/services/enrollments.service';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface ExpiredMembershipRow {
  member: Member;
  enrollment: Enrollment;
}

interface ExpiredMembersTableProps {
  rows: ExpiredMembershipRow[];
  onUpdate?: () => void;
}

const ExpiredMembersTable = ({ rows, onUpdate }: ExpiredMembersTableProps) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [renewingId, setRenewingId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [enrollmentToRenew, setEnrollmentToRenew] = useState<{ id: number; name: string; planName: string } | null>(null);

  const getDaysAgo = (endDate: string) => {
    const days = Math.abs(differenceInDays(parseISO(endDate), new Date()));
    if (days === 0) return 'Venció hoy';
    if (days === 1) return 'Venció ayer';
    return `Hace ${days} días`;
  };

  const handleOpenViewModal = (member: Member) => {
    setSelectedMember(member);
    setIsViewModalOpen(true);
  };

  const handleOpenConfirm = (enrollmentId: number, memberName: string, planName: string) => {
    setEnrollmentToRenew({ id: enrollmentId, name: memberName, planName });
    setIsConfirmOpen(true);
  };

  const handleConfirmRenew = async () => {
    if (!enrollmentToRenew) return;

    try {
      setRenewingId(enrollmentToRenew.id);
      setIsConfirmOpen(false);
      await enrollmentsService.renew(enrollmentToRenew.id);
      if (onUpdate) await onUpdate();
    } catch (error) {
      console.error('Error al renovar:', error);
      alert('Hubo un error al procesar la renovación.');
    } finally {
      setRenewingId(null);
      setEnrollmentToRenew(null);
    }
  };

  return (
    <div className='relative w-full overflow-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Socio</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Fecha Vencimiento</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className='text-right'>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ member, enrollment }) => {
            const isRenewing = renewingId === enrollment.id;
            const memberName = `${member.firstName} ${member.lastName}`;
            return (
              <TableRow key={enrollment.id}>
                <TableCell className='font-medium'>{memberName}</TableCell>
                <TableCell>{enrollment.plan?.name || '-'}</TableCell>
                <TableCell>
                  {format(parseISO(enrollment.endDate), 'PP', { locale: es })}
                </TableCell>
                <TableCell className='text-red-600 dark:text-red-400 font-medium'>
                  {getDaysAgo(enrollment.endDate)}
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='ghost'
                      size='icon'
                      title='Renovación Rápida'
                      disabled={isRenewing}
                      onClick={() => handleOpenConfirm(enrollment.id, memberName, enrollment.plan?.name || '')}
                    >
                      {isRenewing ? (
                        <Loader2 className='h-4 w-4 animate-spin text-primary' />
                      ) : (
                        <RefreshCw className='h-4 w-4 text-primary' />
                      )}
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      title='Ver detalle'
                      onClick={() => handleOpenViewModal(member)}
                    >
                      <Eye className='h-4 w-4' />
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

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Renovación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas renovar la membresía de {enrollmentToRenew?.name} en el plan{' '}
              {enrollmentToRenew?.planName}?
              Esta acción inscribirá al socio nuevamente en ese plan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsConfirmOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmRenew}>Confirmar Renovación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpiredMembersTable;
