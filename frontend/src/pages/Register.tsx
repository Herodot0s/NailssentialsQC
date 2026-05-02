import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { RegisterRequest } from '@/types/api';

const Register: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const password = watch('password');

  const onSubmit = async (data: RegisterRequest) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const response = await apiClient.post('/auth/register', {
        fullName: data.fullName,
        email: data.email || undefined,
        phone: data.phone || undefined,
        password: data.password,
      });

      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        navigate('/');
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.';
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
            Create an Account
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Join NailssentialsQC to start booking your appointments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {serverError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                {...register('fullName', { required: 'Full name is required' })}
                placeholder="Juan Dela Cruz"
                className={
                  errors.fullName ? 'border-destructive focus-visible:ring-destructive' : ''
                }
              />
              {errors.fullName && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.fullName.message as string}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="juan@example.com"
                />
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input id="phone" type="tel" {...register('phone')} placeholder="09123456789" />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                    message: 'Must contain uppercase and number',
                  },
                })}
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

            <div className="space-y-2 text-left">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', {
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                placeholder="••••••••"
                className={
                  errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''
                }
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.confirmPassword.message as string}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full h-11 text-base mt-4" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Register Now'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t py-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Login here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
