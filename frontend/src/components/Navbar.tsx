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

import { Calendar, LayoutDashboard, Menu, ShoppingCart, Image, List } from 'lucide-react';
import { UserButton, SignInButton, SignUpButton, useUser } from '@clerk/clerk-react';

import NotificationBell from './NotificationBell';
import { useCart } from '../context/CartContext';


const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { user: clerkUser, isSignedIn, isLoaded: isClerkLoaded } = useUser();
  const { cart } = useCart();
  const navigate = useNavigate();

  // Get role from either local DB or Clerk metadata (for immediate sync)
  const userRole = user?.role || (clerkUser?.publicMetadata?.role as string);



  const isStaffOrManager = userRole === 'staff' || userRole === 'manager';
  const showCartIcon = !isStaffOrManager || cart.length > 0;

  const CartIcon = (
    <Link
      to="/booking"
      className="relative text-body hover:text-ink transition-all p-2"
    >
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
                  <UserButton
                    appearance={{
                      elements: {
                        userButtonPopoverCard: "border border-hairline rounded-md shadow-xl bg-white",
                        userButtonPopoverActionButton: "text-ink hover:bg-surface-soft transition-colors",
                        userButtonPopoverActionButtonText: "font-medium",
                        userButtonAvatarBox: "h-9 w-9 border border-hairline/50",
                      }
                    }}
                  >
                    <UserButton.MenuItems>
                      <UserButton.Action
                        label="Cart"
                        labelIcon={<ShoppingCart className="h-4 w-4" />}
                        onClick={() => navigate('/booking')}
                      />
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
                      <UserButton.Action
                        label="Services"
                        labelIcon={<List className="h-4 w-4" />}
                        onClick={() => navigate('/services')}
                      />
                      <UserButton.Action
                        label="Exhibit"
                        labelIcon={<Image className="h-4 w-4" />}
                        onClick={() => navigate('/gallery')}
                      />
                      {userRole === 'customer' && (
                        <UserButton.Action
                          label="My Appointments"
                          labelIcon={<Calendar className="h-4 w-4" />}
                          onClick={() => navigate('/appointments')}
                        />
                      )}
                    </UserButton.MenuItems>
                  </UserButton>
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
                  <Button
                    className="h-10 px-6 rounded-full bg-primary text-white hover:bg-primary-pressed transition-all uppercase tracking-[0.2em] text-[10px] font-extrabold shadow-sm"
                  >
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
                <UserButton
                  appearance={{
                    elements: {
                      userButtonPopoverCard: "border border-hairline rounded-md shadow-xl bg-white",
                      userButtonPopoverActionButton: "text-ink hover:bg-surface-soft transition-colors",
                      userButtonAvatarBox: "h-8 w-8 border border-hairline/50",
                    }
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Action
                      label="Cart"
                      labelIcon={<ShoppingCart className="h-4 w-4" />}
                      onClick={() => navigate('/booking')}
                    />
                    <UserButton.Action
                      label="Services"
                      labelIcon={<List className="h-4 w-4" />}
                      onClick={() => navigate('/services')}
                    />
                    <UserButton.Action
                      label="Exhibit"
                      labelIcon={<Image className="h-4 w-4" />}
                      onClick={() => navigate('/gallery')}
                    />
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
