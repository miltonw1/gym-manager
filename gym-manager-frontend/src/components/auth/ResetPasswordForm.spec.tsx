import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import ResetPasswordForm from './ResetPasswordForm';
import { authService } from '@/services/auth.service';

vi.mock('@/services/auth.service');

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams('token=abc123')],
  };
});

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show mismatch error for different passwords', async () => {
    render(
      <MemoryRouter>
        <ResetPasswordForm />
      </MemoryRouter>
    );

    const passwords = screen.getAllByLabelText(/contraseña/i);
    fireEvent.change(passwords[0], { target: { value: 'secret12' } });
    fireEvent.change(passwords[1], { target: { value: 'secret34' } });
    fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));

    await waitFor(() => {
      expect(screen.getByText(/no coinciden/i)).toBeInTheDocument();
    });
  });

  it('should submit and show success when passwords match', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValue({ message: 'ok' });
    render(
      <MemoryRouter>
        <ResetPasswordForm />
      </MemoryRouter>
    );

    const passwords = screen.getAllByLabelText(/contraseña/i);
    fireEvent.change(passwords[0], { target: { value: 'secret123' } });
    fireEvent.change(passwords[1], { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));

    await waitFor(() => {
      expect(authService.resetPassword).toHaveBeenCalledWith('abc123', 'secret123');
      expect(screen.getByText(/contraseña actualizada/i)).toBeInTheDocument();
    });
  });
});
