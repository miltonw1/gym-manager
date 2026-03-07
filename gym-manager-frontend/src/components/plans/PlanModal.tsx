import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { plansService, type Plan } from '@/services/plans.service';
import { Loader2 } from 'lucide-react';

const planSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  durationDays: z.number().int().min(1, 'La duración debe ser de al menos 1 día'),
});

type PlanFormValues = z.infer<typeof planSchema>;

interface PlanModalProps {
  plan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const PlanModal = ({ plan, isOpen, onClose, onUpdate }: PlanModalProps) => {
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      price: 0,
      durationDays: 30,
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (isOpen) {
      if (plan) {
        form.reset({
          name: plan.name,
          price: Number(plan.price),
          durationDays: plan.durationDays,
        });
      } else {
        form.reset({
          name: '',
          price: 0,
          durationDays: 30,
        });
      }
    }
  }, [isOpen, plan, form]);

  const onSubmit = async (values: PlanFormValues) => {
    try {
      if (plan) {
        await plansService.update(plan.id, values);
      } else {
        await plansService.create(values);
      }
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error al guardar el plan:', error);
      alert('Hubo un error al guardar el plan.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{plan ? 'Editar Plan' : 'Nuevo Plan'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Plan</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Pase Libre, 3 Veces por Semana..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durationDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duración (Días)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {plan ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PlanModal;
