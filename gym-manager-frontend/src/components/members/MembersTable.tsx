import { useEffect, useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Search, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import { membersService } from '@/services/members.service';
import { MemberFilterStatus } from '@/types/members.types';
import type { Member, MemberFilterStatusType } from '@/types/members.types';
import ViewMemberModal from './ViewMemberModal';
import AddMemberModal from './AddMemberModal';
import EditMemberModal from './EditMemberModal';

const MembersTable = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Estado para modales
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Filtros y Paginación
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<MemberFilterStatusType>(MemberFilterStatus.ALL);
  const [page, setPage] = useState(0);
  const take = 10;

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await membersService.findAll({
        skip: page * take,
        take,
        search,
        status,
      });
      setMembers(data.members);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleOpenViewModal = (member: Member) => {
    setSelectedMember(member);
    setIsViewModalOpen(true);
  };

  const handleOpenEditModal = (member: Member) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedMember(null);
  };

  const handleAddSuccess = () => {
    setPage(0);
    fetchMembers();
  };

  // Debounce para la búsqueda (opcional, por ahora directo)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0); // Reiniciar a la primera página al buscar
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as MemberFilterStatusType);
    setPage(0);
  };

  const totalPages = Math.ceil(total / take);

  const getStatusBadge = (member: Member) => {
    switch (member.status) {
      case 'ACTIVE':
        return <Badge className="bg-green-600 hover:bg-green-700">Activo</Badge>;
      case 'EXPIRING_SOON':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Próximo a vencer</Badge>;
      case 'EXPIRED':
        return <Badge variant="destructive">Vencido</Badge>;
      case 'NO_PLAN':
      default:
        return <Badge variant="secondary">Sin Membresía</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, apellido o DNI..."
              value={search}
              onChange={handleSearchChange}
              className="pl-8"
            />
          </div>
          
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={MemberFilterStatus.ALL}>Todos</SelectItem>
              <SelectItem value={MemberFilterStatus.ACTIVE}>Activos</SelectItem>
              <SelectItem value={MemberFilterStatus.EXPIRED}>Vencidos</SelectItem>
              <SelectItem value={MemberFilterStatus.INACTIVE}>Inactivos (2 meses)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Nuevo Socio
        </Button>
      </div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Vence el</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Cargando socios...
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                  No se encontraron socios con esos filtros.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.lastName}, {member.firstName}
                  </TableCell>
                  <TableCell>{member.dni}</TableCell>
                  <TableCell>{getStatusBadge(member)}</TableCell>
                  <TableCell>
                    {member.nextExpiryDate 
                      ? new Date(member.nextExpiryDate).toLocaleDateString('es-AR')
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Ver detalle"
                        onClick={() => handleOpenViewModal(member)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Editar socio"
                        onClick={() => handleOpenEditModal(member)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Mostrando {members.length} de {total} socios
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
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
            disabled={page >= totalPages - 1 || loading}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modales */}
      <ViewMemberModal 
        member={selectedMember} 
        isOpen={isViewModalOpen} 
        onClose={handleCloseModals}
        onUpdate={fetchMembers}
      />

      <EditMemberModal
        member={selectedMember}
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        onUpdate={fetchMembers}
      />

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUpdate={handleAddSuccess}
      />
    </div>
  );
};

export default MembersTable;
