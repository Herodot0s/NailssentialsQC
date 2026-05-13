import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Trophy, TrendingUp, Users, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StaffPerformanceViewProps {
  performanceData: Array<{
    staffId: number;
    fullName: string;
    revenue: number;
    commission: number;
    serviceCount: number;
    categoryBreakdown: Record<string, number>;
  }>;
}

export const StaffPerformanceView: React.FC<StaffPerformanceViewProps> = ({ performanceData }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="rounded-none border-none shadow-sm bg-white p-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-ultra/10 rounded-none">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground">
                Top Performer
              </p>
              <h3 className="text-lg font-serif italic">{performanceData[0]?.fullName || '---'}</h3>
            </div>
          </div>
        </Card>

        <Card className="rounded-none border-none shadow-sm bg-white p-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success-color/10 rounded-none">
              <TrendingUp className="h-6 w-6 text-success-color" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground">
                Total Revenue
              </p>
              <h3 className="text-xl font-bold">
                ₱{performanceData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="rounded-none border-none shadow-sm bg-white p-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-none">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground">
                Total Rituals
              </p>
              <h3 className="text-xl font-bold">
                {performanceData.reduce((acc, curr) => acc + curr.serviceCount, 0)}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-none border-none shadow-sm bg-white">
        <CardHeader className="border-b border-gray-50 p-8">
          <CardTitle className="font-serif text-2xl font-light">Artisan Success Metrics</CardTitle>
          <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">
            Performance Breakdown by Technician
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full">
            <div className="grid grid-cols-[1fr_120px_120px_120px_200px] gap-4 p-4 bg-muted/30 text-[9px] uppercase tracking-widest font-bold text-muted-foreground border-b border-gray-50">
              <div className="pl-4">Technician</div>
              <div>Revenue</div>
              <div>Commissions</div>
              <div>Rituals</div>
              <div className="pr-4 text-right">Contribution</div>
            </div>

            <div className="divide-y divide-gray-50">
              {performanceData.length === 0 ? (
                <div className="py-12 text-center text-sm font-light italic text-muted-foreground">
                  No performance data available for this period.
                </div>
              ) : (
                performanceData.map((staff) => {
                  const totalRevenue = performanceData.reduce((acc, curr) => acc + curr.revenue, 0);
                  const contribution = totalRevenue > 0 ? (staff.revenue / totalRevenue) * 100 : 0;

                  return (
                    <div
                      key={staff.staffId}
                      className="grid grid-cols-[1fr_120px_120px_120px_200px] gap-4 p-6 items-center hover:bg-gray-50 transition-colors"
                    >
                      <div className="pl-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-primary/10 flex items-center justify-center">
                          <Award className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-bold text-foreground">{staff.fullName}</span>
                      </div>
                      <div className="text-sm font-medium">₱{staff.revenue.toLocaleString()}</div>
                      <div className="text-sm text-primary font-bold">
                        ₱{staff.commission.toLocaleString()}
                      </div>
                      <div className="text-sm tabular-nums">{staff.serviceCount}</div>
                      <div className="pr-4 space-y-2">
                        <div className="flex justify-between text-[9px] uppercase font-bold tracking-widest">
                          <span className="text-muted-foreground">Share of Sales</span>
                          <span>{contribution.toFixed(1)}%</span>
                        </div>
                        <Progress value={contribution} className="h-1 rounded-none bg-gray-100" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
