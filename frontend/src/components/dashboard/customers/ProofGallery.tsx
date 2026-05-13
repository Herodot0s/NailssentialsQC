import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Camera, ExternalLink, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ProofGalleryProps {
  appointments: Array<{
    id: number;
    customer: { full_name: string };
    appointment_date: string;
    service_photo_url: string | null;
    items: Array<{
      service: { name: string };
      staff: { full_name: string };
    }>;
  }>;
}

export const ProofGallery: React.FC<ProofGalleryProps> = ({ appointments }) => {
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const proofs = safeAppointments.filter((app) => app.service_photo_url);

  return (
    <Card className="rounded-md border border-hairline shadow-none bg-surface-card overflow-hidden">
      <CardHeader className="border-b border-hairline-soft p-6">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="display-lg text-ink font-extrabold">Proof of Service</CardTitle>
            <CardDescription className="utility-xs text-mute mt-1">
              Visual Archive of Completed Rituals
            </CardDescription>
          </div>
          <Camera className="h-6 w-6 text-primary/40" />
        </div>
      </CardHeader>
      <CardContent className="p-8">
        {proofs.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-hairline-soft rounded-md">
            <p className="body-md text-mute italic">No visual records found for this period.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {proofs.map((app) => (
              <div
                key={app.id}
                className="group relative bg-surface-card border border-hairline rounded-md overflow-hidden hover:border-primary/20 transition-all duration-500"
              >
                <div className="aspect-[4/5] relative overflow-hidden bg-surface-soft">
                  <img
                    src={app.service_photo_url!}
                    alt={`Proof for appointment ${app.id}`}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                    <p className="text-white caption-xs uppercase mb-1">
                      {app.items[0]?.service.name || 'Treatment'}
                    </p>
                    <p className="text-white/80 caption-sm uppercase">
                      By {app.items[0]?.staff.full_name || 'Staff'}
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="body-strong text-ink">{app.customer.full_name}</p>
                      <div className="flex items-center gap-2 caption-xs text-mute uppercase">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(app.appointment_date), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="rounded-full caption-xs py-0 px-2 h-5 border-hairline text-mute"
                    >
                      #{app.id}
                    </Badge>
                  </div>

                  <button className="w-full h-10 border border-hairline rounded-sm utility-xs text-mute hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 flex items-center justify-center gap-2">
                    <ExternalLink className="h-3 w-3" /> View Ritual Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
