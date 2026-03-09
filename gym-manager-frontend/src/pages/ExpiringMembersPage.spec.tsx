import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import ExpiringMembersPage from './ExpiringMembersPage';
import { enrollmentsService } from '@/services/enrollments.service';
import { plansService } from '@/services/plans.service';
import { useAuthStore } from '@/store/useAuthStore';
import type { Enrollment } from '@/types/enrollments.types';

vi.mock('@/services/enrollments.service', () => ({
  enrollmentsService: {
    findExpiring: vi.fn(),
    findByMember: vi.fn(),
    renew: vi.fn(),
  },
}));

vi.mock('@/services/plans.service', () => ({
  plansService: {
    findAll: vi.fn(),
  },
}));

vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

const mockExpiringEnrollments: Enrollment[] = [
  {
    id: 1,
    memberId: 101,
    planId: 1,
    startDate: '2026-02-01T00:00:00.000Z',
    endDate: '2026-03-10T00:00:00.000Z', // Expiring soon (Today is March 9)
    status: 'ACTIVE',
    createdAt: '2026-02-01T00:00:00.000Z',
    member: {
      firstName: 'John',
      lastName: 'Doe',
      dni: '12345678',
    },
    plan: {
      name: 'Pase Libre',
      price: '5000',
      durationDays: 30,
    },
  },
  {
    id: 2,
    memberId: 102,
    planId: 2,
    startDate: '2026-02-05T00:00:00.000Z',
    endDate: '2026-03-12T00:00:00.000Z',
    status: 'ACTIVE',
    createdAt: '2026-02-05T00:00:00.000Z',
    member: {
      firstName: 'Jane',
      lastName: 'Smith',
      dni: '87654321',
    },
    plan: {
      name: 'Plan 2 días',
      price: '3000',
      durationDays: 30,
    },
  },
];

describe('ExpiringMembersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      token: 'test-token',
    } as any);
    vi.mocked(plansService.findAll).mockResolvedValue([]);
    vi.mocked(enrollmentsService.findByMember).mockResolvedValue([]);
  });

  it('should render the page title', () => {
    vi.mocked(enrollmentsService.findExpiring).mockResolvedValue([]);
    render(
      <MemoryRouter>
        <ExpiringMembersPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/socios próximos a vencer/i)).toBeInTheDocument();
  });

  it('should fetch and display expiring members in a table', async () => {
    vi.mocked(enrollmentsService.findExpiring).mockResolvedValue(mockExpiringEnrollments);
    
    render(
      <MemoryRouter>
        <ExpiringMembersPage />
      </MemoryRouter>
    );

    expect(enrollmentsService.findExpiring).toHaveBeenCalledWith(7);

    await waitFor(() => {
      expect(screen.getByText(/John/i)).toBeInTheDocument();
      expect(screen.getByText(/Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Jane/i)).toBeInTheDocument();
      expect(screen.getByText(/Smith/i)).toBeInTheDocument();
      expect(screen.getByText('Pase Libre')).toBeInTheDocument();
      expect(screen.getByText('Plan 2 días')).toBeInTheDocument();
    });
  });

  it('should show an empty state message if no members are found', async () => {
    vi.mocked(enrollmentsService.findExpiring).mockResolvedValue([]);
    
    render(
      <MemoryRouter>
        <ExpiringMembersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no se encontraron socios próximos a vencer en los próximos 7 días/i)).toBeInTheDocument();
    });
  });

  it('should filter members by name', async () => {
    vi.mocked(enrollmentsService.findExpiring).mockResolvedValue(mockExpiringEnrollments);
    
    render(
      <MemoryRouter>
        <ExpiringMembersPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/John/i)).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText(/buscar por nombre o plan/i);
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    expect(screen.queryByText(/John/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Jane/i)).toBeInTheDocument();
    expect(screen.getByText(/Smith/i)).toBeInTheDocument();
  });

  it('should paginate results', async () => {
    // Create 25 mock enrollments with unique names that don't overlap (A1, A2...)
    const manyEnrollments: Enrollment[] = Array.from({ length: 25 }, (_, i) => ({
      ...mockExpiringEnrollments[0],
      id: i + 1,
      member: { ...mockExpiringEnrollments[0].member!, firstName: `User${String.fromCharCode(65 + i)}${i}`, lastName: 'Test' },
    }));
    
    vi.mocked(enrollmentsService.findExpiring).mockResolvedValue(manyEnrollments);
    
    render(
      <MemoryRouter>
        <ExpiringMembersPage />
      </MemoryRouter>
    );

    // Page 1 should have UserA0 to UserT19
    await waitFor(() => expect(screen.getByText(/UserA0/i)).toBeInTheDocument());
    expect(screen.getByText(/UserT19/i)).toBeInTheDocument();
    expect(screen.queryByText(/UserU20/i)).not.toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    fireEvent.click(nextButton);

    // Page 2 should have UserU20 to UserY24
    expect(screen.queryByText(/UserA0/i)).not.toBeInTheDocument();
    expect(screen.getByText(/UserU20/i)).toBeInTheDocument();
    expect(screen.getByText(/UserY24/i)).toBeInTheDocument();
  });

  it('should open the view modal when clicking the view button', async () => {
    vi.mocked(enrollmentsService.findExpiring).mockResolvedValue([mockExpiringEnrollments[0]]);
    
    render(
      <MemoryRouter>
        <ExpiringMembersPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/John/i)).toBeInTheDocument());

    const viewButton = screen.getByTitle(/ver detalle/i);
    fireEvent.click(viewButton);

    // Check if the modal title (which usually contains member name) is present
    // ViewMemberModal likely has "Detalle del Socio" or similar
    await waitFor(() => {
      expect(screen.getByText(/detalle del socio/i)).toBeInTheDocument();
    });
  });

  it('should call renew service when clicking the quick renew button', async () => {
    vi.mocked(enrollmentsService.findExpiring).mockResolvedValue([mockExpiringEnrollments[0]]);
    vi.mocked(enrollmentsService.renew).mockResolvedValue({} as any);
    
    render(
      <MemoryRouter>
        <ExpiringMembersPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/John/i)).toBeInTheDocument());

    const renewButton = screen.getByTitle(/renovación rápida/i);
    fireEvent.click(renewButton);

    expect(enrollmentsService.renew).toHaveBeenCalledWith(mockExpiringEnrollments[0].id);
    await waitFor(() => {
      // It should re-fetch expiring list after renewal
      expect(enrollmentsService.findExpiring).toHaveBeenCalledTimes(2);
    });
  });
});
