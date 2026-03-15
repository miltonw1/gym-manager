import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, RefreshCw, Loader2 } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Member } from '@/types/members.types';
import ViewMemberModal from './ViewMemberModal';
import { enrollmentsService } from '@/services/enrollments.service';

interface ExpiredMembersTableProps {
  members: Member[];
  onUpdate?: () => void;
}

const ExpiredMembersTable = ({ members, onUpdate }: ExpiredMembersTableProps) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [renewingId, setRenewingId] = useState<number | null>(null);

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
    <div className='relative w-full overflow-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Socio</TableHead>
            <TableHead>Plan Anterior</TableHead>
            <TableHead>Fecha Vencimiento</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className='text-right'>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const lastEnrollment = member.enrollments?.[0];
            const isRenewing = lastEnrollment ? renewingId === lastEnrollment.id : false;
            return (
              <TableRow key={member.id}>
                <TableCell className='font-medium'>
                  {member.firstName} {member.lastName}
                </TableCell>
                <TableCell>{lastEnrollment?.plan?.name || '-'}</TableCell>
                <TableCell>
                  {lastEnrollment ? format(parseISO(lastEnrollment.endDate), 'PP', { locale: es }) : '-'}
                </TableCell>
                <TableCell className='text-red-600 font-medium'>
                  {lastEnrollment ? getDaysAgo(lastEnrollment.endDate) : '-'}
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-2'>
                    {lastEnrollment && (
                      <Button
                        variant='ghost'
                        size='icon'
                        title='Renovación Rápida'
                        disabled={isRenewing}
                        onClick={() => handleQuickRenew(lastEnrollment.id)}
                      >
                        {isRenewing ? (
                          <Loader2 className='h-4 w-4 animate-spin text-primary' />
                        ) : (
                          <RefreshCw className='h-4 w-4 text-primary' />
                        )}
                      </Button>
                    )}
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
    </div>
  );
};

export default ExpiredMembersTable;
