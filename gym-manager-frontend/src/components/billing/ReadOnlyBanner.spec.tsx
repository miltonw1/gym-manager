import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import ReadOnlyBanner from './ReadOnlyBanner';
import { useAuthStore } from '@/store/useAuthStore';

vi.mock('@/store/useAuthStore');

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ReadOnlyBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when subscription is active', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      subscription: { isReadOnly: false },
    } as any);
    render(
      <MemoryRouter>
        <ReadOnlyBanner />
      </MemoryRouter>
    );
    expect(screen.queryByText(/tu suscripción venció/i)).not.toBeInTheDocument();
  });

  it('should render banner and navigate to billing when read-only', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      subscription: { isReadOnly: true },
    } as any);
    render(
      <MemoryRouter>
        <ReadOnlyBanner />
      </MemoryRouter>
    );
    expect(screen.getByText(/tu suscripción venció/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /renovar suscripción/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/billing');
  });
});
