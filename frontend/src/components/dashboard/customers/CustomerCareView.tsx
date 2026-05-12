import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserPlus, Star, Activity, BarChart2 } from 'lucide-react';
import { ReviewModeration } from './ReviewModeration';
import { AppointmentTimeline } from './AppointmentTimeline';
import { RetentionTab } from '../analytics/RetentionTab';
import type { Review, StaffMember } from '@/types/api';

interface CustomerCareViewProps {
  reviews: Review[];
  onModerateReview: (id: number, approved: boolean) => void;
  appointments: any[];
  staffMembers: StaffMember[];
  onLogWalkIn: () => void;
  dateRange: { start: string; end: string };
}

export const CustomerCareView: React.FC<CustomerCareViewProps> = ({
  reviews,
  onModerateReview,
  appointments,
  staffMembers,
  onLogWalkIn,
  dateRange
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <Button 
          onClick={onLogWalkIn} 
          className="btn-primary gap-2 px-8 shadow-lg shadow-primary/20"
        >
          <UserPlus className="h-4 w-4" /> New Walk-in
        </Button>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="bg-transparent border-b border-hairline w-full justify-start h-auto p-0 mb-8 rounded-none gap-8">
          <TabsTrigger 
            value="activity" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-4 utility-xs text-mute data-[state=active]:text-ink"
          >
            <Activity className="h-3.5 w-3.5 mr-2" /> Daily Activity
          </TabsTrigger>
          <TabsTrigger 
            value="feedback" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-4 utility-xs text-mute data-[state=active]:text-ink"
          >
            <Star className="h-3.5 w-3.5 mr-2" /> Public Feedback
          </TabsTrigger>
          <TabsTrigger 
            value="retention" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-4 utility-xs text-mute data-[state=active]:text-ink"
          >
            <BarChart2 className="h-3.5 w-3.5 mr-2" /> Retention Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-0">
          <AppointmentTimeline appointments={appointments} staffMembers={staffMembers} />
        </TabsContent>

        <TabsContent value="feedback" className="mt-0">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="display-lg text-ink">Feedback Moderation</h2>
              <p className="utility-xs text-mute">{reviews.length} Total Submissions</p>
            </div>
            <ReviewModeration reviews={reviews} onModerateReview={onModerateReview} />
          </div>
        </TabsContent>

        <TabsContent value="retention" className="mt-0">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="display-lg text-ink">Loyalty Analytics</h2>
              <p className="utility-xs text-mute">Rolling 30-Day Period</p>
            </div>
            <RetentionTab dateRange={{ preset: 'custom', startDate: dateRange.start, endDate: dateRange.end }} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
