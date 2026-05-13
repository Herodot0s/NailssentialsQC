import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-canvas px-4 py-12 sm:px-6 lg:px-8">
      <SignUp 
        routing="path" 
        path="/register" 
        signInUrl="/login"
        appearance={{
          elements: {
            formButtonPrimary: 'bg-primary hover:bg-primary-pressed transition-colors',
            footerActionLink: 'text-primary hover:text-primary-pressed font-semibold',
            card: 'border-hairline shadow-none rounded-md',
          }
        }}
      />
    </div>
  );
};

export default RegisterPage;
