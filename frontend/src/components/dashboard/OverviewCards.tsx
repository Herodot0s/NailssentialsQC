import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Star } from 'lucide-react';
import type { SalesStats } from '@/types/api';

interface OverviewCardsProps {
  salesStats: SalesStats | null;
  activeStaffCount: number;
  pendingReviewCount: number;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  salesStats,
  activeStaffCount,
  pendingReviewCount
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {/* Today's Revenue */}
      <Card className="rounded-none border-none shadow-sm bg-white overflow-hidden group relative p-8">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <CardHeader className="p-0 pb-4">
          <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
            Today's Revenue
          </CardDescription>
          <CardTitle className="text-4xl font-serif font-light">
            ₱{salesStats?.totalRevenue.toLocaleString() || '0'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center gap-1 text-[10px] text-success-color font-bold uppercase">
            <TrendingUp className="h-3 w-3" /> +12% Efficiency
          </div>
        </CardContent>
      </Card>

      {/* Active Rituals */}
      <Card className="rounded-none border-none shadow-sm bg-white overflow-hidden group relative p-8">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <CardHeader className="p-0 pb-4">
          <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            Active Rituals
          </CardDescription>
          <CardTitle className="text-4xl font-serif font-light">
            {salesStats?.transactionCount || 0}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">
            {salesStats?.onlineCount || 0} Digital • {salesStats?.walkInCount || 0} Walk-in
          </p>
        </CardContent>
      </Card>

      {/* Active Staff */}
      <Card className="rounded-none border-none shadow-sm bg-white overflow-hidden group relative p-8">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <CardHeader className="p-0 pb-4">
          <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            Active Staff
          </CardDescription>
          <CardTitle className="text-4xl font-serif font-light">
            {activeStaffCount}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Users className="h-3 w-3" /> Checked in today
          </p>
        </CardContent>
      </Card>

      {/* Pending Reviews */}
      <Card className="rounded-none border-none shadow-sm bg-white overflow-hidden group relative p-8">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <CardHeader className="p-0 pb-4">
          <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            Pending Reviews
          </CardDescription>
          <CardTitle className="text-4xl font-serif font-light">
            {pendingReviewCount}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Star className="h-3 w-3" /> Awaiting moderation
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
