import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import LoginForm from './LoginForm';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/useAuthStore';

// Mock api client and store
vi.mock('@/lib/api-client');
vi.mock('@/store/useAuthStore');

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      setAuth: vi.fn(),
      loadProfile: vi.fn(() => Promise.resolve()),
    } as any);
  });

  it('should show error messages for empty fields', async () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /login|acceder/i }));

    await waitFor(() => {
      // Zod/react-hook-form errors might take a moment or need validation trigger
      expect(screen.getByText(/email es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/password es requerido/i)).toBeInTheDocument();
    });
  });

  it('should call api and redirect on success', async () => {
    const mockToken = 'test-token';
    vi.mocked(apiClient.post).mockResolvedValue({ data: { access_token: mockToken } });
    const mockSetAuth = vi.fn();
    vi.mocked(useAuthStore).mockReturnValue({
      setAuth: mockSetAuth,
      loadProfile: vi.fn(() => Promise.resolve()),
    } as any);

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login|acceder/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockSetAuth).toHaveBeenCalledWith(mockToken);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show backend error message on failure', async () => {
    vi.mocked(apiClient.post).mockRejectedValue({
      response: { data: { message: 'Credenciales inválidas' } },
    });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login|acceder/i }));

    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
    });
  });
});
