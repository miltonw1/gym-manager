import { useEffect, useState, useMemo, useCallback } from 'react';
import { enrollmentsService } from '@/services/enrollments.service';
import type { Enrollment } from '@/types/enrollments.types';
import ExpiringMembersTable from '@/components/members/ExpiringMembersTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ExpiringMembersPage = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Pagination states
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const take = 20;

  const fetchExpiring = useCallback(async () => {
    try {
      setLoading(true);
      const data = await enrollmentsService.findExpiring(7);
      setEnrollments(data);
    } catch (error) {
      console.error('Error fetching expiring enrollments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpiring();
  }, [fetchExpiring]);

  // Frontend Filtering
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e) => {
      const fullName = `${e.member?.firstName} ${e.member?.lastName}`.toLowerCase();
      const planName = e.plan?.name.toLowerCase() || '';
      const searchTerm = search.toLowerCase();
      return fullName.includes(searchTerm) || planName.includes(searchTerm);
    });
  }, [enrollments, search]);

  // Frontend Pagination
  const totalPages = Math.ceil(filteredEnrollments.length / take);
  const paginatedEnrollments = useMemo(() => {
    const start = page * take;
    return filteredEnrollments.slice(start, start + take);
  }, [filteredEnrollments, page, take]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-bold tracking-tight">Socios Próximos a Vencer</h1>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o plan..."
            value={search}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>
      </div>

      <div className="flex-1 rounded-xl bg-background border p-6 flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center py-8">Cargando...</div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="flex justify-center py-8 text-muted-foreground">
            {search 
              ? `No se encontraron resultados para "${search}"`
              : "No se encontraron socios próximos a vencer en los próximos 7 días."}
          </div>
        ) : (
          <>
            <ExpiringMembersTable 
              enrollments={paginatedEnrollments} 
              onUpdate={fetchExpiring}
            />
            
            {/* Pagination Controls */}
            <div className="mt-auto flex items-center justify-between px-2 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando {paginatedEnrollments.length} de {filteredEnrollments.length} socios
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <div className="text-sm font-medium">
                  Página {page + 1} de {totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExpiringMembersPage;
