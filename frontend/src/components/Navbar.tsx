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
import { LogOut, User, Calendar, Settings, LayoutDashboard, Menu, ShoppingCart } from 'lucide-react';
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
            {isAuthenticated && user?.role === 'customer' && (
              <Link
                to="/booking"
                className="relative text-muted-foreground hover:text-foreground transition-all p-2"
              >
                <ShoppingCart className="h-5 w-5 stroke-[1.5]" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                    {cart.length}
                  </span>
                )}
              </Link>
            )}
            {isAuthenticated ? (
              <>
                {user?.role === 'customer' && (
                  <>
                    <Link
                      to="/booking"
                      className="text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground hover:text-foreground transition-all"
                    >
                      Book Now
                    </Link>
                    <Link
                      to="/appointments"
                      className="text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground hover:text-foreground transition-all"
                    >
                      My Appointments
                    </Link>
                  </>
                )}
                {user?.role === 'staff' && (
                  <Link
                    to="/dashboard"
                    className="text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground hover:text-foreground transition-all"
                  >
                    Dashboard
                  </Link>
                )}
                {user?.role === 'manager' && (
                  <Link
                    to="/manage-services"
                    className="text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground hover:text-foreground transition-all"
                  >
                    Manage Services
                  </Link>
                )}

                {(user?.role === 'staff' || user?.role === 'manager') && <NotificationBell />}

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={() => (
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary/5 transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary-ultra text-primary font-serif font-bold text-sm border-[0.5px] border-primary/20">
                            {user?.fullName ? (
                              getInitials(user.fullName)
                            ) : (
                              <User className="h-4 w-4 stroke-[1.5]" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mt-4 border-none shadow-xl rounded-none p-2" align="end">
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
                      render={() => (
                        <Link to="/profile">
                          <User className="mr-3 h-4 w-4 stroke-[1.5]" />
                          <span className="text-xs font-medium">Profile Settings</span>
                        </Link>
                      )}
                    />
                    {user?.role === 'customer' && (
                      <DropdownMenuItem
                        render={() => (
                          <Link to="/appointments">
                            <Calendar className="mr-3 h-4 w-4 stroke-[1.5]" />
                            <span className="text-xs font-medium">My Appointments</span>
                          </Link>
                        )}
                      />
                    )}
                    {user?.role === 'manager' && (
                      <DropdownMenuItem
                        render={() => (
                          <Link to="/manager">
                            <LayoutDashboard className="mr-3 h-4 w-4 stroke-[1.5]" />
                            <span className="text-xs font-medium">Manager Dashboard</span>
                          </Link>
                        )}
                      />
                    )}
                    {user?.role === 'staff' && (
                      <DropdownMenuItem
                        render={() => (
                          <Link to="/dashboard">
                            <LayoutDashboard className="mr-3 h-4 w-4 stroke-[1.5]" />
                            <span className="text-xs font-medium">Staff Portal</span>
                          </Link>
                        )}
                      />
                    )}
                    {user?.role === 'manager' && (
                      <DropdownMenuItem
                        className="rounded-none px-4 py-3"
                        render={
                          <Link to="/manage-services">
                            <Settings className="mr-3 h-4 w-4 stroke-[1.5]" />
                            <span className="text-xs font-medium">Manage Services</span>
                          </Link>
                        }
                      />
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
                  asChild
                >
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary/5">
                  <Menu className="h-6 w-6 stroke-[1.5]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 mt-4 border-none shadow-xl rounded-none p-4 space-y-2">
                <DropdownMenuItem
                  render={() => (
                    <Link to="/services">Services</Link>
                  )}
                />
                {!isAuthenticated ? (
                  <>
                    <DropdownMenuItem
                      render={() => (
                        <Link to="/login">Login</Link>
                      )}
                    />
                    <DropdownMenuItem
                      render={() => (
                        <Link to="/register">Sign Up</Link>
                      )}
                    />
                  </>
                ) : (
                  <>
                    <DropdownMenuSeparator className="bg-primary/5" />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-none px-4 py-3 text-xs uppercase tracking-widest text-destructive">
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
