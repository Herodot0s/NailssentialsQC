import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Calendar, Settings, LayoutDashboard, Menu, ShoppingCart, Image as ImageIcon } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useCart } from '../context/CartContext';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="font-serif text-2xl font-bold text-primary tracking-tight hover:text-primary-dark transition-colors">
              NailssentialsQC
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-10">
            <Link
              to="/services"
              className="text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground hover:text-foreground transition-all"
            >
              Services
            </Link>
            <Link
              to="/gallery"
              className="text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground hover:text-foreground transition-all"
            >
              Gallery
            </Link>
            {isAuthenticated ? (
              <>
                {user?.role === 'customer' && (
                  <Link
                    to="/booking"
                    className="text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground hover:text-foreground transition-all flex items-center gap-2"
                  >
                    <span>Book Now</span>
                    {cart.length > 0 && (
                      <div className="relative h-5 w-5 flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 stroke-[1.5]" />
                        <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[7px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
                          {cart.length}
                        </span>
                      </div>
                    )}
                  </Link>
                )}
                {user?.role === 'staff' && (
                  <Link
                    to="/dashboard"
                    className="text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground hover:text-foreground transition-all"
                  >
                    Staff Portal
                  </Link>
                )}
                {user?.role === 'manager' && (
                  <Link
                    to="/manager"
                    className="text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground hover:text-foreground transition-all"
                  >
                    Manager Dashboard
                  </Link>
                )}

                {(user?.role === 'staff' || user?.role === 'manager') && <NotificationBell />}

                <DropdownMenu>
                  {/* FIX APPLIED HERE: Removed asChild and merged button classes */}
                  <DropdownMenuTrigger className="relative inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-primary/5 transition-colors outline-none border-none">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary-ultra text-primary font-serif font-bold text-sm border-[0.5px] border-primary/20">
                        {user?.fullName ? (
                          getInitials(user.fullName)
                        ) : (
                          <User className="h-4 w-4 stroke-[1.5]" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mt-4 border-none shadow-xl rounded-none p-2 z-[100]" align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="font-normal px-4 py-3">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-serif font-bold leading-none text-foreground">{user?.fullName}</p>
                          <p className="text-[10px] tracking-[0.1em] uppercase leading-none text-muted-foreground mt-1">
                            {user?.role}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-primary/5" />
                    <DropdownMenuItem
                      onClick={() => navigate('/profile')}
                      className="rounded-none px-4 py-3 cursor-pointer"
                    >
                      <User className="mr-3 h-4 w-4 stroke-[1.5]" />
                      <span className="text-xs font-medium">Profile Settings</span>
                    </DropdownMenuItem>
                    {user?.role === 'customer' && (
                      <DropdownMenuItem
                        onClick={() => navigate('/appointments')}
                        className="rounded-none px-4 py-3 cursor-pointer"
                      >
                        <Calendar className="mr-3 h-4 w-4 stroke-[1.5]" />
                        <span className="text-xs font-medium">My Appointments</span>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'manager' && (
                      <DropdownMenuItem
                        onClick={() => navigate('/manager')}
                        className="rounded-none px-4 py-3 cursor-pointer"
                      >
                        <LayoutDashboard className="mr-3 h-4 w-4 stroke-[1.5]" />
                        <span className="text-xs font-medium">Manager Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'staff' && (
                      <DropdownMenuItem
                        onClick={() => navigate('/dashboard')}
                        className="rounded-none px-4 py-3 cursor-pointer"
                      >
                        <LayoutDashboard className="mr-3 h-4 w-4 stroke-[1.5]" />
                        <span className="text-xs font-medium">Staff Portal</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-primary/5" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="rounded-none px-4 py-3 text-destructive focus:bg-destructive/5"
                    >
                      <LogOut className="mr-3 h-4 w-4 stroke-[1.5]" />
                      <span className="text-xs font-medium">Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-8">
                <Link
                  to="/login"
                  className="text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground hover:text-foreground transition-all"
                >
                  Login
                </Link>
                <Button
                  variant="outline"
                  className="h-10 px-8 rounded-none border-primary/40 text-primary hover:bg-primary hover:text-white transition-all duration-500 uppercase tracking-[0.2em] text-[10px] font-bold"
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden">
            <DropdownMenu>
              {/* FIX APPLIED HERE: Removed asChild and merged button classes */}
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-10 w-10 hover:bg-primary/5 transition-colors outline-none border-none">
                <Menu className="h-6 w-6 stroke-[1.5]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 mt-4 border-none shadow-xl rounded-none p-4 space-y-2">
                <DropdownMenuItem
                  onClick={() => navigate('/gallery')}
                  className="rounded-none px-4 py-3 cursor-pointer"
                >
                  Gallery
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/services')}
                  className="rounded-none px-4 py-3 cursor-pointer"
                >
                  Services
                </DropdownMenuItem>
                {isAuthenticated && user?.role === 'customer' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => navigate('/booking')}
                      className="rounded-none px-4 py-3 cursor-pointer font-bold text-primary"
                    >
                      Book Now {cart.length > 0 ? `(${cart.length})` : ''}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate('/appointments')}
                      className="rounded-none px-4 py-3 cursor-pointer"
                    >
                      My Appointments
                    </DropdownMenuItem>
                  </>
                )}
                {isAuthenticated && user?.role === 'staff' && (
                  <DropdownMenuItem
                    onClick={() => navigate('/dashboard')}
                    className="rounded-none px-4 py-3 cursor-pointer font-bold text-primary"
                  >
                    Staff Portal
                  </DropdownMenuItem>
                )}
                {isAuthenticated && user?.role === 'manager' && (
                  <DropdownMenuItem
                    onClick={() => navigate('/manager')}
                    className="rounded-none px-4 py-3 cursor-pointer font-bold text-primary"
                  >
                    Manager Dashboard
                  </DropdownMenuItem>
                )}
                {!isAuthenticated ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => navigate('/login')}
                      className="rounded-none px-4 py-3 cursor-pointer"
                    >
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate('/register')}
                      className="rounded-none px-4 py-3 cursor-pointer"
                    >
                      Sign Up
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuSeparator className="bg-primary/5" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="rounded-none px-4 py-3 text-destructive"
                    >
                      <LogOut className="mr-3 h-4 w-4 stroke-[1.5]" />
                      Logout
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;