import { useEffect, useState, useMemo, useCallback } from 'react';
import { membersService } from '@/services/members.service';
import type { Member } from '@/types/members.types';
import type { Enrollment } from '@/types/enrollments.types';
import ExpiredMembersTable, { type ExpiredMembershipRow } from '@/components/members/ExpiredMembersTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

const ExpiredMembersPage = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const take = 20;

  const fetchExpired = useCallback(async () => {
    try {
      setLoading(true);
      const data = await membersService.getExpired();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching expired members:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpired();
  }, [fetchExpired]);

  const rows = useMemo<ExpiredMembershipRow[]>(() => {
    return members.flatMap((member) =>
      (member.enrollments ?? []).map((enrollment: Enrollment) => ({ member, enrollment }))
    );
  }, [members]);

  const filteredRows = useMemo(() => {
    const searchTerm = search.toLowerCase();
    return rows.filter(({ member, enrollment }) => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      const dni = member.dni.toLowerCase();
      const planName = enrollment.plan?.name?.toLowerCase() || '';
      return fullName.includes(searchTerm) || dni.includes(searchTerm) || planName.includes(searchTerm);
    });
  }, [rows, search]);

  const totalPages = Math.ceil(filteredRows.length / take);
  const paginatedRows = useMemo(() => {
    const start = page * take;
    return filteredRows.slice(start, start + take);
  }, [filteredRows, page, take]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <div className='flex items-center gap-4 py-4'>
        <Button variant='ghost' size='icon' onClick={() => navigate('/dashboard')}>
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <h1 className='text-2xl font-bold tracking-tight'>Membresías Vencidas (Últimos 30 días)</h1>
      </div>

      <div className='flex flex-col gap-4 md:flex-row md:items-center'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar por nombre o DNI...'
            value={search}
            onChange={handleSearchChange}
            className='pl-8'
          />
        </div>
      </div>

      <div className='flex-1 rounded-xl bg-background border p-6 flex flex-col gap-4'>
        {loading ? (
          <div className='flex justify-center py-8'>Cargando...</div>
        ) : filteredRows.length === 0 ? (
          <div className='flex justify-center py-8 text-muted-foreground'>
            {search
              ? `No se encontraron resultados para '${search}'`
              : 'No se encontraron membresías vencidas en los últimos 30 días.'}
          </div>
        ) : (
          <>
            <ExpiredMembersTable
              rows={paginatedRows}
              onUpdate={fetchExpired}
            />

            {totalPages > 1 && (
              <div className='mt-auto flex items-center justify-between px-2 pt-4 border-t'>
                <div className='text-sm text-muted-foreground'>
                  Mostrando {paginatedRows.length} de {filteredRows.length} membresías
                </div>
                <div className='flex items-center space-x-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className='h-4 w-4' />
                    Anterior
                  </Button>
                  <div className='text-sm font-medium'>
                    Página {page + 1} de {totalPages || 1}
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= totalPages - 1}
                  >
                    Siguiente
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExpiredMembersPage;
