import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SubscriptionDaysBadge from './SubscriptionDaysBadge';
import { useAuthStore } from '@/store/useAuthStore';

vi.mock('@/store/useAuthStore');

describe('SubscriptionDaysBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when subscription is null', () => {
    vi.mocked(useAuthStore).mockReturnValue({ subscription: null } as any);
    const { container } = render(<SubscriptionDaysBadge />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render "Suscripción vencida" when subscription is inactive', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      subscription: { active: false, daysRemaining: 0 },
    } as any);
    render(<SubscriptionDaysBadge />);
    expect(screen.getByText(/suscripción vencida/i)).toBeInTheDocument();
  });

  it('should show remaining days in red when below the threshold', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      subscription: { active: true, daysRemaining: 6 },
    } as any);
    render(<SubscriptionDaysBadge />);
    const badge = screen.getByText('6 días');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-variant', 'destructive');
  });

  it('should show remaining days in green when above the threshold', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      subscription: { active: true, daysRemaining: 30 },
    } as any);
    render(<SubscriptionDaysBadge />);
    const badge = screen.getByText('30 días');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-variant', 'default');
    expect(badge).toHaveClass('bg-green-600');
  });
});
