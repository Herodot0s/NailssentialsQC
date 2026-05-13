import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { LogOut, Calendar, LayoutDashboard, Menu, ShoppingCart } from 'lucide-react';
import { UserButton, SignInButton, SignUpButton, useUser } from '@clerk/clerk-react';

import NotificationBell from './NotificationBell';
import { useCart } from '../context/CartContext';


const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { user: clerkUser, isSignedIn, isLoaded: isClerkLoaded } = useUser();
  const { cart } = useCart();
  const navigate = useNavigate();

  // Get role from either local DB or Clerk metadata (for immediate sync)
  const userRole = user?.role || (clerkUser?.publicMetadata?.role as string);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link
              to="/"
              className="font-serif text-2xl font-bold text-primary tracking-tight hover:text-primary-dark transition-colors"
            >
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
              Exhibit
            </Link>
            {isClerkLoaded && isSignedIn ? (
              <>
                {userRole === 'customer' && (
                  <Link
                    to="/booking"
                    className="relative text-muted-foreground hover:text-foreground transition-all p-2 mr-2"
                  >
                    <ShoppingCart className="h-5 w-5 stroke-[1.5]" />
                    {cart.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                        {cart.length}
                      </span>
                    )}
                  </Link>
                )}
                {userRole === 'staff' && (
                  <Link
                    to="/dashboard"
                    className="text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground hover:text-foreground transition-all"
                  >
                    Dashboard
                  </Link>
                )}

                {(userRole === 'staff' || userRole === 'manager') && <NotificationBell />}

                <UserButton 
                  appearance={{
                    elements: {
                      userButtonPopoverCard: "border border-hairline rounded-[6px] shadow-xl bg-white",
                      userButtonPopoverActionButton: "text-ink hover:bg-surface-soft transition-colors",
                      userButtonPopoverActionButtonText: "font-medium",
                      userButtonAvatarBox: "h-9 w-9 border border-hairline",
                    }
                  }}
                >
                  <UserButton.MenuItems>
                    {userRole === 'manager' && (
                      <UserButton.Action
                        label="Manager Dashboard"
                        labelIcon={<LayoutDashboard className="h-4 w-4" />}
                        onClick={() => navigate('/manager')}
                      />
                    )}
                    {userRole === 'staff' && (
                      <UserButton.Action
                        label="Staff Dashboard"
                        labelIcon={<Calendar className="h-4 w-4" />}
                        onClick={() => navigate('/dashboard')}
                      />
                    )}
                    {userRole === 'customer' && (
                      <UserButton.Action
                        label="My Appointments"
                        labelIcon={<Calendar className="h-4 w-4" />}
                        onClick={() => navigate('/appointments')}
                      />
                    )}
                  </UserButton.MenuItems>
                </UserButton>

              </>
            ) : (
              <div className="flex items-center gap-8">
                <SignInButton mode="modal">
                  <button className="text-[10px] tracking-[0.2em] uppercase font-semibold text-muted-foreground hover:text-foreground transition-all">
                    Login
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button
                    variant="outline"
                    className="h-10 px-8 rounded-none border-primary/40 text-primary hover:bg-primary hover:text-white transition-all duration-500 uppercase tracking-[0.2em] text-[10px] font-bold"
                  >
                    Sign Up
                  </Button>
                </SignUpButton>
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
              <DropdownMenuContent
                align="end"
                className="w-64 mt-4 border-none shadow-xl rounded-none p-4 space-y-2"
              >
                <DropdownMenuItem
                  onClick={() => navigate('/gallery')}
                  className="rounded-none px-4 py-3 cursor-pointer"
                >
                  Exhibit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/services')}
                  className="rounded-none px-4 py-3 cursor-pointer"
                >
                  Services
                </DropdownMenuItem>
                {!isClerkLoaded || !isSignedIn ? (
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
