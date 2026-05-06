import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { LoginRequest } from '@/types/api';

const Login: React.FC = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginRequest>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const response = await apiClient.post('/auth/login', {
        identifier: data.identifier,
        password: data.password,
      });

      if (response.data.success) {
        const { user, tokens } = response.data.data;
        login(user, tokens);

        if (user.role === 'customer') {
          navigate('/');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Login failed. Please check your credentials.';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-primary-ultra px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-none shadow-card">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-serif font-bold mb-4">
            N
          </div>
          <CardTitle className="font-serif text-3xl font-bold tracking-tight text-primary">
            NailssentialsQC
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Welcome back! Log in to manage your appointments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {serverError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2 text-left">
              <Label htmlFor="identifier">Email or Phone Number</Label>
              <Input
                id="identifier"
                type="text"
                {...register('identifier', { required: 'Email or phone is required' })}
                placeholder="juan@example.com or 09123456789"
                className={
                  errors.identifier ? 'border-destructive focus-visible:ring-destructive' : ''
                }
              />
              {errors.identifier && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.identifier.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  title="Coming soon"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                {...register('password', { required: 'Password is required' })}
                placeholder="••••••••"
                className={
                  errors.password ? 'border-destructive focus-visible:ring-destructive' : ''
                }
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                onCheckedChange={(checked) => setValue('rememberMe', checked === true)}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Remember me
              </Label>
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-dashed">
            <p className="text-xs font-medium text-muted-foreground mb-2 text-center">
              Quick Login (Demo Accounts)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setValue('identifier', 'charlie_brown');
                  setValue('password', 'password123');
                }}
                className="text-xs h-8 border-primary/20 hover:bg-primary/5 hover:text-primary"
              >
                Customer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setValue('identifier', 'john_smith');
                  setValue('password', 'password123');
                }}
                className="text-xs h-8 border-primary/20 hover:bg-primary/5 hover:text-primary"
              >
                Staff
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setValue('identifier', 'admin');
                  setValue('password', 'password123');
                }}
                className="text-xs h-8 border-primary/20 hover:bg-primary/5 hover:text-primary"
              >
                Manager
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t py-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Register Now
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
