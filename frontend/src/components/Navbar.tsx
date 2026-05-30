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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import {
  Calendar,
  LayoutDashboard,
  Menu,
  ShoppingCart,
  Image,
  List,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { SignInButton, SignUpButton, useUser, useClerk } from '@clerk/clerk-react';

import NotificationBell from './NotificationBell';
import { useCart } from '../context/CartContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { user: clerkUser, isSignedIn, isLoaded: isClerkLoaded } = useUser();
  const { openUserProfile } = useClerk();
  const { cart } = useCart();
  const navigate = useNavigate();

  // Get role from either local DB or Clerk metadata (for immediate sync)
  const userRole = user?.role || (clerkUser?.publicMetadata?.role as string);

  const isStaffOrManager = userRole === 'staff' || userRole === 'manager';
  const showCartIcon = !isStaffOrManager;

  const CartIcon = (
    <Link to="/booking" className="relative text-body hover:text-ink transition-all p-2">
      <ShoppingCart className="h-5 w-5 stroke-[1.8]" />
      {isClerkLoaded && cart.length > 0 && (
        <span className="absolute top-1 right-1 bg-primary text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
          {cart.length}
        </span>
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-canvas/80 backdrop-blur-md border-b border-hairline/50">
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
            {showCartIcon && CartIcon}

            {isClerkLoaded && isSignedIn ? (
              <div className="flex items-center gap-6">
                {userRole === 'staff' && (
                  <Link
                    to="/dashboard"
                    className="text-[11px] tracking-[0.2em] uppercase font-bold text-body hover:text-ink transition-all"
                  >
                    Dashboard
                  </Link>
                )}

                {(userRole === 'staff' || userRole === 'manager') && <NotificationBell />}

                <div className="pl-2 border-l border-hairline h-6 flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none cursor-pointer">
                      <div className="relative group flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-surface-soft transition-all duration-300 border border-hairline/25 hover:border-hairline">
                        <span className="hidden lg:inline text-[11px] uppercase tracking-[0.2em] font-extrabold text-ink">
                          {user?.fullName?.split(' ')[0] || clerkUser?.firstName || 'Artisan'}
                        </span>
                        <Avatar className="h-8 w-8 border border-hairline/50 shadow-sm group-hover:scale-105 transition-transform duration-300">
                          <AvatarImage src={clerkUser?.imageUrl} className="object-cover" />
                          <AvatarFallback className="bg-primary/5 font-serif text-xs text-primary font-semibold">
                            {(user?.fullName || clerkUser?.fullName || 'A').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-64 mt-3 border border-hairline shadow-2xl rounded-xl bg-white p-3 space-y-1 animate-in slide-in-from-top-2 duration-300"
                    >
                      <div className="px-3 py-2.5 border-b border-hairline/30 mb-2">
                        <p className="font-serif text-sm font-bold text-ink leading-tight">
                          {user?.fullName || clerkUser?.fullName || 'Artisan'}
                        </p>
                        <p className="text-[10px] text-mute font-medium truncate mt-0.5">
                          {clerkUser?.primaryEmailAddress?.emailAddress}
                        </p>
                        {userRole && (
                          <span className="inline-flex self-start mt-2 px-2.5 py-0.5 rounded-full bg-primary/5 border border-primary/10 text-[9px] font-bold text-primary uppercase tracking-wider">
                            {userRole}
                          </span>
                        )}
                      </div>

                      {/* Dashboard / Control Panel */}
                      {userRole === 'manager' && (
                        <DropdownMenuItem
                          onClick={() => navigate('/manager')}
                          className="rounded-md px-3 py-2 cursor-pointer hover:bg-surface-soft transition-colors flex items-center gap-3 text-xs font-semibold text-ink uppercase tracking-wider"
                        >
                          <LayoutDashboard className="h-4 w-4 text-primary" />
                          Manager Panel
                        </DropdownMenuItem>
                      )}
                      {userRole === 'staff' && (
                        <DropdownMenuItem
                          onClick={() => navigate('/dashboard')}
                          className="rounded-md px-3 py-2 cursor-pointer hover:bg-surface-soft transition-colors flex items-center gap-3 text-xs font-semibold text-ink uppercase tracking-wider"
                        >
                          <Calendar className="h-4 w-4 text-primary" />
                          Staff Schedule
                        </DropdownMenuItem>
                      )}

                      {/* Customer-specific panels */}
                      {userRole === 'customer' && (
                        <DropdownMenuItem
                          onClick={() => navigate('/appointments')}
                          className="rounded-md px-3 py-2 cursor-pointer hover:bg-surface-soft transition-colors flex items-center gap-3 text-xs font-semibold text-ink uppercase tracking-wider"
                        >
                          <Calendar className="h-4 w-4 text-primary" />
                          My Appointments
                        </DropdownMenuItem>
                      )}

                      {/* Booking and Shop Links */}
                      {userRole !== 'staff' && (
                        <>
                          <DropdownMenuItem
                            onClick={() => navigate('/booking')}
                            className="rounded-md px-3 py-2 cursor-pointer hover:bg-surface-soft transition-colors flex items-center gap-3 text-xs font-semibold text-ink uppercase tracking-wider"
                          >
                            <ShoppingCart className="h-4 w-4 text-primary" />
                            Book Appointment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate('/services')}
                            className="rounded-md px-3 py-2 cursor-pointer hover:bg-surface-soft transition-colors flex items-center gap-3 text-xs font-semibold text-ink uppercase tracking-wider"
                          >
                            <List className="h-4 w-4 text-primary" />
                            Treatments Menu
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate('/gallery')}
                            className="rounded-md px-3 py-2 cursor-pointer hover:bg-surface-soft transition-colors flex items-center gap-3 text-xs font-semibold text-ink uppercase tracking-wider"
                          >
                            <Image className="h-4 w-4 text-primary" />
                            Artisan Exhibit
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator className="bg-hairline/30" />

                      {/* Settings & Profile */}
                      {userRole === 'customer' ? (
                        <DropdownMenuItem
                          onClick={() => navigate('/profile')}
                          className="rounded-md px-3 py-2 cursor-pointer hover:bg-surface-soft transition-colors flex items-center gap-3 text-xs font-semibold text-ink uppercase tracking-wider"
                        >
                          <User className="h-4 w-4 text-primary" />
                          Settings
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => openUserProfile()}
                          className="rounded-md px-3 py-2 cursor-pointer hover:bg-surface-soft transition-colors flex items-center gap-3 text-xs font-semibold text-ink uppercase tracking-wider"
                        >
                          <Settings className="h-4 w-4 text-primary" />
                          Manage Account
                        </DropdownMenuItem>
                      )}

                      {/* Sign Out */}
                      <DropdownMenuItem
                        onClick={logout}
                        className="rounded-md px-3 py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center gap-3 text-xs font-semibold uppercase tracking-wider"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <SignInButton mode="modal">
                  <button className="text-[11px] tracking-[0.2em] uppercase font-bold text-body hover:text-ink transition-all">
                    Login
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="h-10 px-6 rounded-full bg-primary text-white hover:bg-primary-pressed transition-all uppercase tracking-[0.2em] text-[10px] font-extrabold shadow-sm">
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            )}
          </nav>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-3">
            {showCartIcon && CartIcon}

            {isClerkLoaded && isSignedIn && (
              <div className="flex items-center gap-3">
                {(userRole === 'staff' || userRole === 'manager') && <NotificationBell />}
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none cursor-pointer">
                    <Avatar className="h-8 w-8 border border-hairline/50 shadow-sm active:scale-95 transition-transform duration-200">
                      <AvatarImage src={clerkUser?.imageUrl} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 font-serif text-xs text-primary font-semibold">
                        {(user?.fullName || clerkUser?.fullName || 'A').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-60 mt-3 border border-hairline shadow-2xl rounded-xl bg-white p-3 space-y-1 animate-in slide-in-from-top-2 duration-300"
                  >
                    <div className="px-3 py-2 border-b border-hairline/30 mb-2">
                      <p className="font-serif text-xs font-bold text-ink leading-tight truncate">
                        {user?.fullName || clerkUser?.fullName || 'Artisan'}
                      </p>
                      <p className="text-[9px] text-mute font-medium truncate mt-0.5">
                        {clerkUser?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>

                    {/* Dashboard / Control Panel */}
                    {userRole === 'manager' && (
                      <DropdownMenuItem
                        onClick={() => navigate('/manager')}
                        className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-surface-soft transition-colors flex items-center gap-3 text-xs font-semibold text-ink uppercase tracking-wider"
                      >
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                        Manager Panel
                      </DropdownMenuItem>
                    )}
                    {userRole === 'staff' && (
                      <DropdownMenuItem
                        onClick={() => navigate('/dashboard')}
                        className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-surface-soft transition-colors flex items-center gap-3 text-xs font-semibold text-ink uppercase tracking-wider"
                      >
                        <Calendar className="h-4 w-4 text-primary" />
                        Staff Schedule
                      </DropdownMenuItem>
                    )}

                    {/* Customer-specific panels */}
                    {userRole === 'customer' && (
                      <DropdownMenuItem
                        onClick={() => navigate('/appointments')}
                        className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-surface-soft transition-colors flex items-center gap-3 text-xs font-semibold text-ink uppercase tracking-wider"
                      >
                        <Calendar className="h-4 w-4 text-primary" />
                        My Appointments
                      </DropdownMenuItem>
                    )}

                    {/* Booking and Shop Links */}
                    {userRole !== 'staff' && (
                      <>
                        <DropdownMenuItem
                          onClick={() => navigate('/booking')}
                          className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-surface-soft transition-colors flex items-center gap-3 text-xs font-semibold text-ink uppercase tracking-wider"
                        >
                          <ShoppingCart className="h-4 w-4 text-primary" />
                          Book Appointment
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate('/services')}
                          className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-surface-soft transition-colors flex items-center gap-3 text-xs font-semibold text-ink uppercase tracking-wider"
                        >
                          <List className="h-4 w-4 text-primary" />
                          Treatments Menu
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate('/gallery')}
                          className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-surface-soft transition-colors flex items-center gap-3 text-xs font-semibold text-ink uppercase tracking-wider"
                        >
                          <Image className="h-4 w-4 text-primary" />
                          Artisan Exhibit
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator className="bg-hairline/30" />

                    {/* Settings & Profile */}
                    {userRole === 'customer' ? (
                      <DropdownMenuItem
                        onClick={() => navigate('/profile')}
                        className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-surface-soft transition-colors flex items-center gap-3 text-xs font-semibold text-ink uppercase tracking-wider"
                      >
                        <User className="h-4 w-4 text-primary" />
                        Retreat Settings
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => openUserProfile()}
                        className="rounded-md px-3 py-2.5 cursor-pointer hover:bg-surface-soft transition-colors flex items-center gap-3 text-xs font-semibold text-ink uppercase tracking-wider"
                      >
                        <Settings className="h-4 w-4 text-primary" />
                        Manage Account
                      </DropdownMenuItem>
                    )}

                    {/* Sign Out */}
                    <DropdownMenuItem
                      onClick={logout}
                      className="rounded-md px-3 py-2.5 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center gap-3 text-xs font-semibold uppercase tracking-wider"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {(!isClerkLoaded || !isSignedIn) && (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center h-10 w-10 hover:bg-ink/5 transition-colors outline-none border-none rounded-md">
                  <Menu className="h-6 w-6 stroke-[1.5]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 mt-4 border border-hairline shadow-xl rounded-md bg-white p-4 space-y-2 animate-in slide-in-from-top-2 duration-300"
                >
                  <DropdownMenuItem
                    onClick={() => navigate('/gallery')}
                    className="rounded-md px-4 py-3 cursor-pointer hover:bg-surface-soft transition-colors"
                  >
                    Exhibit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate('/services')}
                    className="rounded-md px-4 py-3 cursor-pointer hover:bg-surface-soft transition-colors"
                  >
                    Services
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate('/booking')}
                    className="rounded-md px-4 py-3 cursor-pointer hover:bg-surface-soft transition-colors"
                  >
                    <ShoppingCart className="mr-3 h-4 w-4 stroke-[1.5]" />
                    Cart {isClerkLoaded && `(${cart.length})`}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-hairline/30" />
                  <DropdownMenuItem
                    onClick={() => navigate('/login')}
                    className="rounded-md px-4 py-3 cursor-pointer hover:bg-surface-soft font-bold text-primary"
                  >
                    Login
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate('/register')}
                    className="rounded-md px-4 py-3 cursor-pointer bg-primary text-white font-bold"
                  >
                    Sign Up
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
