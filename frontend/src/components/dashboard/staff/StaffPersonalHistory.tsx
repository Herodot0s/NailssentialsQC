import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Camera, History, TrendingUp, Award } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatTime12h } from '@/lib/utils';


interface StaffPersonalHistoryProps {
  appointments: Array<{
    id: number;
    customer: { full_name: string };
    status: string;
    appointment_date: string;
    is_walk_in: boolean;
    service_photo_url: string | null;
    items: Array<{
      id: number;
      service: { name: string; price: number };
      staff_id: number;
      start_time: string;
      status: string;
    }>;
  }>;
  staffProfileId: number;
}

export const StaffPersonalHistory: React.FC<StaffPersonalHistoryProps> = ({
  appointments,
  staffProfileId,
}) => {
  const [selectedWork, setSelectedWork] = React.useState<any>(null);


  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const myWork = safeAppointments
    .flatMap((app) =>
      (app.items || [])
        .filter((item) => item.staff_id === staffProfileId)
        .map((item) => ({
          ...item,
          appId: app.id,
          customerName: app.customer?.full_name || 'Walk-in',
          date: app.appointment_date,
          photo: app.service_photo_url,
          is_walk_in: app.is_walk_in,
        })),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const completedWork = myWork.filter((w) => w.status === 'completed');
  const totalRevenue = completedWork.reduce((acc, curr) => acc + Number(curr.service.price), 0);
  const estCommission = totalRevenue * 0.08; // 8% placeholder

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="rounded-md border border-[#bfc1b7] shadow-none bg-white p-6">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#B8794E] mb-2">
            Total Services
          </p>
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-bold text-[#23251d]">{completedWork.length}</h3>
            <History className="h-5 w-5 text-[#bfc1b7]" />
          </div>
        </Card>

        <Card className="rounded-md border border-[#bfc1b7] shadow-none bg-white p-6">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#B8794E] mb-2">
            Revenue Generated
          </p>
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-bold text-[#23251d]">₱{totalRevenue.toLocaleString()}</h3>
            <TrendingUp className="h-5 w-5 text-success-color" />
          </div>
        </Card>

        <Card className="rounded-md border border-[#bfc1b7] shadow-none bg-white p-6">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#B8794E] mb-2">
            Est. Commissions
          </p>
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-bold text-[#23251d]">₱{estCommission.toLocaleString()}</h3>
            <Award className="h-5 w-5 text-primary" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <Card className="rounded-md border border-[#bfc1b7] shadow-none overflow-hidden bg-white">
            <CardHeader className="bg-[#fcfcfa] border-b border-[#bfc1b7] p-8">
              <CardTitle className="text-xl font-bold text-[#23251d]">Service History</CardTitle>
              <CardDescription className="text-[13px] text-[#4d4f46]">
                Detailed log of all rituals performed
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-[#e5e7e0]">
                  <TableRow className="hover:bg-transparent border-b border-[#bfc1b7]">
                    <TableHead className="pl-8 font-bold text-[11px] uppercase text-[#6c6e63]">
                      Date
                    </TableHead>
                    <TableHead className="font-bold text-[11px] uppercase text-[#6c6e63]">
                      Client
                    </TableHead>
                    <TableHead className="font-bold text-[11px] uppercase text-[#6c6e63]">
                      Service
                    </TableHead>
                    <TableHead className="pr-8 text-right font-bold text-[11px] uppercase text-[#6c6e63]">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myWork.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-12 italic text-sm text-[#6c6e63]"
                      >
                        No history found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    myWork.map((work) => (
                      <TableRow
                        key={`${work.appId}-${work.id}`}
                        className="hover:bg-[#e5e7e0]/30 border-b border-[#bfc1b7] cursor-pointer group"
                        onClick={() => setSelectedWork(work)}
                      >
                        <TableCell className="pl-8 py-4 tabular-nums font-bold text-[13px]">
                          <div className="flex flex-col">
                            <span>{format(new Date(work.date), 'MMM dd, yyyy')}</span>
                            <span className="text-[10px] text-[#6c6e63] font-medium uppercase">
                              {formatTime12h(work.start_time)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[14px] font-medium">
                          {work.customerName}
                        </TableCell>
                        <TableCell className="text-[13px] text-[#6c6e63]">
                          {work.service.name}
                        </TableCell>
                        <TableCell className="pr-8 text-right">
                          <Badge
                            variant="outline"
                            className={`rounded-md text-[9px] uppercase tracking-tight font-bold ${
                              work.status === 'completed'
                                ? 'bg-[#d9eddf] text-[#2c8c66] border-none'
                                : 'bg-gray-100 text-[#6c6e63] border-none'
                            }`}
                          >
                            {work.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="rounded-md border border-[#bfc1b7] shadow-none overflow-hidden bg-white">
            <CardHeader className="bg-[#fcfcfa] border-b border-[#bfc1b7] p-8">
              <div className="flex items-center gap-3">
                <Camera className="h-5 w-5 text-[#B8794E]" />
                <CardTitle className="text-xl font-bold text-[#23251d]">My Portfolio</CardTitle>
              </div>
              <CardDescription className="text-[13px] text-[#4d4f46]">
                Visual record of your craftsmanship
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 gap-4">
                {completedWork.filter((w) => w.photo).length === 0 ? (
                  <div className="col-span-2 py-12 text-center border-2 border-dashed border-[#bfc1b7] rounded-md">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#bfc1b7]">
                      No Portfolio Items
                    </p>
                  </div>
                ) : (
                  completedWork
                    .filter((w) => w.photo)
                    .map((work) => (
                      <div
                        key={work.appId}
                        className="aspect-square relative group overflow-hidden rounded-md border border-[#bfc1b7] cursor-pointer"
                        onClick={() => setSelectedWork(work)}
                      >
                        <img
                          src={work.photo!}
                          alt="Work"
                          className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                          <p className="text-white text-[8px] uppercase font-bold tracking-widest">
                            {work.service.name}
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedWork} onOpenChange={(open) => !open && setSelectedWork(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-md border border-[#bfc1b7] p-0 overflow-hidden bg-white shadow-xl">
          {selectedWork && (
            <div className="flex flex-col">
              <div className="relative h-56 bg-[#23251d] overflow-hidden">
                {selectedWork.photo ? (
                  <img
                    src={selectedWork.photo}
                    alt="Ritual Proof"
                    className="w-full h-full object-cover opacity-90"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#bfc1b7]/20">
                    <Camera className="h-12 w-12 mb-2" />
                    <p className="text-[9px] uppercase font-bold tracking-widest">
                      No photo record
                    </p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#23251d] to-transparent flex flex-col justify-end p-6">
                  <Badge className="w-fit mb-2 rounded-md bg-[#B8794E] text-white border-none text-[8px] uppercase tracking-widest">
                    Record #{selectedWork.appId}
                  </Badge>
                  <h2 className="text-xl font-bold text-white">{selectedWork.service.name}</h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] uppercase font-bold tracking-widest text-[#6c6e63]">
                        Client
                      </p>
                      <p className="text-sm font-bold text-[#23251d]">
                        {selectedWork.customerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold tracking-widest text-[#6c6e63]">
                        Date
                      </p>
                      <p className="text-sm font-bold text-[#23251d]">
                        {format(new Date(selectedWork.date), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] uppercase font-bold tracking-widest text-[#6c6e63]">
                        Time
                      </p>
                      <p className="text-sm font-bold text-[#23251d] uppercase">
                        {formatTime12h(selectedWork.start_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold tracking-widest text-[#6c6e63]">
                        Price
                      </p>
                      <p className="text-sm font-bold text-[#23251d]">
                        ₱{Number(selectedWork.service.price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#bfc1b7] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`rounded-md text-[9px] uppercase tracking-tight font-bold ${
                        selectedWork.status === 'completed'
                          ? 'bg-[#d9eddf] text-[#2c8c66] border-none'
                          : 'bg-gray-100 text-[#6c6e63] border-none'
                      }`}
                    >
                      {selectedWork.status}
                    </Badge>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-[#6c6e63]">
                      {selectedWork.is_walk_in ? 'Walk-in' : 'Online'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-md h-9 px-4 text-[10px] uppercase font-bold tracking-widest border-[#bfc1b7] hover:bg-[#e5e7e0]"
                    onClick={() => setSelectedWork(null)}
                  >
                    Close Record
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
