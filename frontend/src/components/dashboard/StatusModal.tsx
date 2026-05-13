'use client';

import { CheckCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'success' | 'error';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function StatusModal({
  open,
  onOpenChange,
  type,
  title,
  description,
  actionLabel = 'Close',
  onAction,
}: StatusModalProps) {
  const isSuccess = type === 'success';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm overflow-hidden p-0 border-none">
        <div className={cn('h-2 w-full', isSuccess ? 'bg-green-500' : 'bg-destructive')} />

        <div className="p-8">
          <DialogHeader className="items-center text-center gap-4">
            <div
              className={cn(
                'p-3 rounded-full',
                isSuccess ? 'bg-green-50 text-green-600' : 'bg-destructive/10 text-destructive',
              )}
            >
              {isSuccess ? (
                <CheckCircle className="h-8 w-8 stroke-[1.5]" />
              ) : (
                <AlertCircle className="h-8 w-8 stroke-[1.5]" />
              )}
            </div>

            <div className="space-y-2">
              <DialogTitle className="text-xl font-serif font-light normal-case tracking-normal">
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogFooter className="mt-8 sm:justify-center">
            <Button
              onClick={() => {
                if (onAction) onAction();
                onOpenChange(false);
              }}
              className={cn(
                'w-full rounded-none h-12 text-[10px] uppercase font-bold tracking-[0.2em]',
                isSuccess
                  ? 'bg-foreground hover:bg-foreground/90'
                  : 'bg-destructive hover:bg-destructive/90',
              )}
            >
              {actionLabel}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
