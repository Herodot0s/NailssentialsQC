import * as React from 'react';

import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { size?: 'default' | 'sm' }
>(({ className, size = 'default', ...props }, ref) => (
  <div
    ref={ref}
    data-impeccable-variants="2a772b01"
    data-impeccable-variant-count="3"
    style={{ display: 'contents' }}
  >
    {/* impeccable-variants-start 2a772b01 */}
    <div data-impeccable-variant="original">
      <div
        data-slot="card"
        data-size={size}
        className={cn(
          'group/card flex flex-col overflow-hidden bg-card text-card-foreground rounded-xl border shadow-sm transition-all duration-200 has-[>img:first-child]:pt-0',
          className,
        )}
        {...props}
      />
    </div>
    {/* Variants: insert below this line */}
    {/* impeccable-variants-end 2a772b01 */}
  </div>
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn(
        'group/card-header flex flex-col gap-1.5 p-6 group-data-[size=sm]/card:p-4',
        className,
      )}
      {...props}
    />
  ),
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-title"
      className={cn('font-heading text-xl font-bold leading-none tracking-tight', className)}
      {...props}
    />
  ),
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground leading-relaxed', className)}
      {...props}
    />
  ),
);
CardDescription.displayName = 'CardDescription';

const CardAction = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-action"
      className={cn('ml-auto self-start', className)}
      {...props}
    />
  ),
);
CardAction.displayName = 'CardAction';

const CardContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-content"
      className={cn('p-6 pt-0 group-data-[size=sm]/card:p-4 group-data-[size=sm]/card:pt-0', className)}
      {...props}
    />
  ),
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn('flex items-center p-6 pt-0 group-data-[size=sm]/card:p-4 group-data-[size=sm]/card:pt-0', className)}
      {...props}
    />
  ),
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
