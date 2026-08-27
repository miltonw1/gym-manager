import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import RegisterForm from './RegisterForm';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';

vi.mock('@/services/auth.service');
vi.mock('@/store/useAuthStore');

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      setAuth: vi.fn(),
      loadProfile: vi.fn(() => Promise.resolve()),
    } as any);
  });

  it('should submit the register form and redirect to dashboard', async () => {
    vi.mocked(authService.register).mockResolvedValue({ access_token: 'token' });

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/nombre del gimnasio/i), { target: { value: 'Gym Fit' } });
    fireEvent.change(screen.getByLabelText(/dirección/i), { target: { value: 'Av 123' } });
    fireEvent.change(screen.getByLabelText(/ciudad/i), { target: { value: 'CABA' } });
    fireEvent.change(screen.getByLabelText(/provincia/i), { target: { value: 'CABA' } });
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '1122334455' } });
    fireEvent.change(screen.getByLabelText(/email del gimnasio/i), {
      target: { value: 'contacto@gym.com' },
    });
    fireEvent.change(screen.getByLabelText(/email de acceso/i), {
      target: { value: 'owner@fit.com' },
    });
    const passwords = screen.getAllByLabelText(/contraseña/i);
    fireEvent.change(passwords[0], { target: { value: 'secret123' } });
    fireEvent.change(passwords[1], { target: { value: 'secret123' } });

    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show an error when passwords do not match', async () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/nombre del gimnasio/i), { target: { value: 'Gym' } });
    fireEvent.change(screen.getByLabelText(/dirección/i), { target: { value: 'Av' } });
    fireEvent.change(screen.getByLabelText(/ciudad/i), { target: { value: 'CABA' } });
    fireEvent.change(screen.getByLabelText(/provincia/i), { target: { value: 'CABA' } });
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/email del gimnasio/i), {
      target: { value: 'c@d.com' },
    });
    fireEvent.change(screen.getByLabelText(/email de acceso/i), {
      target: { value: 'o@d.com' },
    });
    const passwords = screen.getAllByLabelText(/contraseña/i);
    fireEvent.change(passwords[0], { target: { value: 'secret12' } });
    fireEvent.change(passwords[1], { target: { value: 'secret34' } });

    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
    });
  });
});
