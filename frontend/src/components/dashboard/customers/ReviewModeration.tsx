import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Check, X } from 'lucide-react';
import type { ReviewModerationProps } from '../types';

export const ReviewModeration: React.FC<ReviewModerationProps> = ({ reviews, onModerateReview }) => {
  return (
    <div className="animate-in fade-in duration-700">
      <Card className="rounded-md border border-hairline shadow-none overflow-hidden bg-surface-card">
        <Table>
          <TableHeader className="bg-surface-soft/50">
            <TableRow className="hover:bg-transparent border-hairline-soft">
              <TableHead className="pl-8 py-5 utility-xs text-mute">Client Feedback</TableHead>
              <TableHead className="utility-xs text-mute">Artisan</TableHead>
              <TableHead className="utility-xs text-mute">Rating</TableHead>
              <TableHead className="utility-xs text-mute">Praise</TableHead>
              <TableHead className="text-right pr-8 utility-xs text-mute">Curate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map(review => (
              <TableRow key={review.id} className="hover:bg-surface-soft/50 border-hairline-soft transition-colors">
                <TableCell className="pl-8 py-6">
                  <p className="body-strong text-ink">{review.customer.full_name}</p>
                  <p className="caption-xs text-mute italic opacity-60">On {review.appointment_item.service.name}</p>
                </TableCell>
                <TableCell className="caption-md text-ink uppercase">{review.staff.full_name}</TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-primary fill-primary' : 'text-stone stroke-[1]'}`} />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(review.tags as string[]).map(tag => (
                      <Badge key={tag} variant="outline" className="rounded-full caption-xs border-hairline bg-surface-soft/50 px-2 py-0 text-mute">{tag}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="pr-8 text-right">
                  <div className="flex justify-end gap-2">
                    {review.is_approved_for_public ? (
                      <Button 
                        onClick={() => onModerateReview(review.id, false)} 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-accent-red border border-accent-red/10 bg-accent-red-soft hover:bg-accent-red hover:text-white rounded-md transition-all"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => onModerateReview(review.id, true)} 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-accent-green border border-accent-green/10 bg-accent-green-soft hover:bg-accent-green hover:text-white rounded-md transition-all"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
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
