import { Outlet, useNavigate, Link } from 'react-router';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutGrid, CreditCard } from 'lucide-react';

const MainLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            <Link className="mr-6 flex items-center space-x-2" to="/">
              <span className="font-bold inline-block">Gym Manager</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Dashboard
              </Link>
              <Link 
                to="/plans" 
                className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-2"
              >
                <CreditCard className="h-4 w-4" />
                Planes
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center">
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
