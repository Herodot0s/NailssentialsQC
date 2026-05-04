import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Check, X } from 'lucide-react';
import type { ReviewModerationProps } from './types';

export const ReviewModeration: React.FC<ReviewModerationProps> = ({ reviews, onModerateReview }) => {
  return (
    <div className="animate-in fade-in duration-700">
      <Card className="rounded-none border-none shadow-sm overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="pl-8 py-5 text-[9px] uppercase font-bold">Client Feedback</TableHead>
              <TableHead className="text-[9px] uppercase font-bold">Artisan</TableHead>
              <TableHead className="text-[9px] uppercase font-bold">Rating</TableHead>
              <TableHead className="text-[9px] uppercase font-bold">Praise</TableHead>
              <TableHead className="text-right pr-8 text-[9px] uppercase font-bold">Curate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map(review => (
              <TableRow key={review.id} className="hover:bg-primary-ultra/10 border-gray-50 transition-colors">
                <TableCell className="pl-8 py-6">
                  <p className="font-bold text-sm tracking-tight">{review.customer.full_name}</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold italic opacity-60">On {review.appointment_item.service.name}</p>
                </TableCell>
                <TableCell className="text-[10px] font-bold tracking-tighter uppercase">{review.staff.full_name}</TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-primary fill-primary' : 'text-gray-100 stroke-[1]'}`} />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(review.tags as string[]).map(tag => (
                      <Badge key={tag} variant="outline" className="rounded-none text-[8px] uppercase tracking-tighter border-primary/5 bg-gray-50/50 px-2 py-0 text-muted-foreground">{tag}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="pr-8 text-right">
                  <div className="flex justify-end gap-2">
                    {review.is_approved_for_public ? (
                      <Button onClick={() => onModerateReview(review.id, false)} variant="ghost" size="icon" className="h-9 w-9 text-destructive border border-destructive/10 bg-destructive/5 hover:bg-destructive hover:text-white rounded-none transition-all"><X className="h-4 w-4" /></Button>
                    ) : (
                      <Button onClick={() => onModerateReview(review.id, true)} variant="ghost" size="icon" className="h-9 w-9 text-success-color border border-success-color/10 bg-success-color/5 hover:bg-success-color hover:text-white rounded-none transition-all"><Check className="h-4 w-4" /></Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
