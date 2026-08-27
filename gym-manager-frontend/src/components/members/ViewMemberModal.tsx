import { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { CreditCard, User, RefreshCw, Loader2, PlusCircle, Lock } from 'lucide-react';
import { enrollmentsService } from '@/services/enrollments.service';
import { plansService, type Plan } from '@/services/plans.service';
import { useIsReadOnly } from '@/hooks/useIsReadOnly';
import type { Member } from '@/types/members.types';
import type { Enrollment } from '@/types/enrollments.types';

interface ViewMemberModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const ViewMemberModal = ({ member, isOpen, onClose, onUpdate }: ViewMemberModalProps) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [renewingId, setRenewingId] = useState<number | null>(null);
  const isReadOnly = useIsReadOnly();

  const fetchData = useCallback(async () => {
    if (!member?.id) return;
    try {
      setIsLoading(true);
      const [enrollmentsData, plansData] = await Promise.all([
        enrollmentsService.findByMember(member.id),
        plansService.findAll()
      ]);
      setEnrollments(enrollmentsData);
      setAvailablePlans(plansData.filter(p => p.active));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [member?.id]);

  useEffect(() => {
    if (isOpen && member) {
      fetchData();
      setSelectedPlanId('');
    }
  }, [isOpen, member, fetchData]);

  const handleRenew = async (enrollmentId: number) => {
    try {
      setRenewingId(enrollmentId);
      await enrollmentsService.renew(enrollmentId);
      await fetchData(); 
      onUpdate(); 
    } catch (error) {
      console.error('Error al renovar:', error);
      alert('Hubo un error al procesar la renovación.');
    } finally {
      setRenewingId(null);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlanId || !member?.id) return;
    
    try {
      setIsActionLoading(true);
      await enrollmentsService.create({
        memberId: member.id,
        planId: Number(selectedPlanId),
        startDate: new Date().toISOString()
      });
      await fetchData();
      onUpdate();
      setSelectedPlanId('');
    } catch (error: any) {
      console.error('Error al suscribir:', error);
      if (error.response?.status === 409) {
        alert('Este socio ya tiene este plan. Use la renovación.');
      } else {
        alert('Error al contratar el plan.');
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            Detalle del Socio
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Info Personal */}
          <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg border">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre Completo</p>
              <p className="text-sm font-semibold">{member.lastName}, {member.firstName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">DNI</p>
              <p className="text-sm">{member.dni}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Teléfono</p>
              <p className="text-sm">{member.phone || 'N/R'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</p>
              <p className="text-sm truncate max-w-[180px]">{member.email || 'N/R'}</p>
            </div>
          </div>

          <hr className="border-muted" />

          {/* Sección de Gestión de Planes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Planes y Membresías
              </h3>
            </div>

            {/* Contratar Nuevo Plan */}
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-3">
              <p className="text-xs font-semibold text-primary uppercase">Contratar nuevo servicio</p>
              <div className="flex gap-2">
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger className="flex-1 bg-background">
                    <SelectValue placeholder="Seleccione un plan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlans
                      .filter(p => !enrollments.some(e => e.planId === p.id))
                      .map(plan => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name} - ${plan.price}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  className="gap-2" 
                  disabled={!selectedPlanId || isActionLoading || isReadOnly}
                  onClick={handleSubscribe}
                >
                  <PlusCircle className="h-4 w-4" />
                  Contratar
                </Button>
              </div>
            </div>

            {/* Listado de actuales / anteriores */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase px-1">Historial / Actuales</p>
              {isLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : enrollments.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed rounded-lg text-muted-foreground italic text-sm">
                  Sin planes previos.
                </div>
              ) : (
                enrollments.map((enrollment) => {
                  const now = new Date();
                  const isExpired = new Date(enrollment.endDate) < now;
                  const sevenDaysFromNow = new Date(now);
                  sevenDaysFromNow.setDate(now.getDate() + 7);
                  const isExpiringSoon = !isExpired && new Date(enrollment.endDate) <= sevenDaysFromNow;
                  const isRenewing = renewingId === enrollment.id;

                  return (
                    <div 
                      key={enrollment.id} 
                      className="p-3 rounded-lg border bg-card flex items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{enrollment.plan?.name}</span>
                          {isExpired ? (
                            <Badge variant="destructive" className="text-[10px] h-4">Vencido</Badge>
                          ) : isExpiringSoon ? (
                            <Badge className="bg-yellow-500 text-white text-[10px] h-4">Próximo a vencer</Badge>
                          ) : (
                            <Badge className="bg-green-600 text-[10px] h-4">Activo</Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Vence el {new Date(enrollment.endDate).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 text-[11px] border-primary text-primary hover:bg-primary hover:text-white"
                        onClick={() => handleRenew(enrollment.id)}
                        disabled={isRenewing || isActionLoading || isReadOnly}
                      >
                        {isReadOnly ? <Lock className="h-3 w-3 mr-1" /> : (
                          <RefreshCw className={`h-3 w-3 mr-1 ${isRenewing ? 'animate-spin' : ''}`} />
                        )}
                        Renovar
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="w-full" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewMemberModal;
