import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router';
import { Loader2, MailCheck } from 'lucide-react';
import { authService } from '@/services/auth.service';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email requerido').email('Email inválido'),
});

type ForgotValues = z.infer<typeof forgotSchema>;

const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(values.email);
      setSent(true);
    } catch {
      setError('No se pudo procesar la solicitud. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-2">
          <div className="flex justify-center">
            <MailCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-xl text-center">Revisá tu correo</CardTitle>
          <CardDescription className="text-center">
            Si el email existe, te enviamos un enlace para restablecer tu contraseña.
            (En modo desarrollo, el enlace se muestra en la consola del backend.)
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/login">Volver al inicio de sesión</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Recuperar contraseña</CardTitle>
        <CardDescription className="text-center">
          Ingresá tu email y te enviamos un enlace para crear una nueva contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="nombre@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="text-sm font-medium text-destructive text-center">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar enlace
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-center w-full text-muted-foreground">
          ¿Recordás tu contraseña?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Iniciar sesión
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ForgotPasswordForm;
