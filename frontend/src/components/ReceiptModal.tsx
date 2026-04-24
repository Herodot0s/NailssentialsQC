import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer, Scissors } from 'lucide-react';

interface ReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ open, onOpenChange, appointment }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const transaction = appointment.transactions?.[0];

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;

    const canvas = await html2canvas(receiptRef.current, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 150], // Small receipt format
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`receipt-${transaction?.receipt_number || 'appointment'}.pdf`);
  };

  if (!appointment || !transaction) return null;

  const totalAmount = appointment.services.reduce(
    (acc: number, s: any) => acc + Number(s.price_at_booking || s.service.price),
    0,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] p-0 overflow-hidden border-none bg-zinc-100">
        <DialogHeader className="p-6 bg-white border-b">
          <DialogTitle className="font-serif text-2xl text-center text-primary">
            Digital Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 flex justify-center">
          {/* Physical Receipt Look */}
          <div
            ref={receiptRef}
            className="bg-white w-full max-w-[300px] p-6 shadow-sm border-t-4 border-primary relative"
            style={{ fontFamily: 'monospace' }}
          >
            {/* Cut line decoration */}
            <div className="absolute -top-5 left-0 w-full flex justify-center text-zinc-300">
              <Scissors className="h-4 w-4" />
            </div>

            <div className="text-center mb-6">
              <h2 className="font-bold text-lg uppercase tracking-widest">NailssentialsQC</h2>
              <p className="text-[10px] text-zinc-500">Premium Nail & Waxing Spa</p>
              <p className="text-[10px] text-zinc-500 italic mt-1">Quezon City, Philippines</p>
            </div>

            <div className="border-b border-dashed border-zinc-200 pb-4 mb-4 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span>Receipt #:</span>
                <span className="font-bold">{transaction.receipt_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(transaction.transaction_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="capitalize">{appointment.customer?.full_name || 'Guest'}</span>
              </div>
              <div className="flex justify-between">
                <span>Technician:</span>
                <span className="capitalize">{appointment.technician.full_name}</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase mb-2 text-zinc-400">Services</p>
              <div className="space-y-2 text-[11px]">
                {appointment.services.map((s: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start gap-4">
                    <span className="flex-grow">{s.service.name}</span>
                    <span className="font-bold">
                      ₱{Number(s.price_at_booking || s.service.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-900 pt-4 space-y-1">
              <div className="flex justify-between text-base font-bold">
                <span>TOTAL:</span>
                <span>₱{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500 uppercase font-bold mt-2">
                <span>Payment:</span>
                <span>{transaction.payment_method}</span>
              </div>
            </div>

            <div className="mt-8 text-center text-[10px] text-zinc-400 space-y-1 border-t border-dashed border-zinc-200 pt-4">
              <p>Thank you for choosing NailssentialsQC!</p>
              <p>Experience Beauty, Experience Quality.</p>
              <div className="flex justify-center gap-1 mt-4 opacity-20">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="h-4 w-[2px] bg-black" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-white border-t flex flex-row gap-2 sm:justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="flex-grow"
          >
            Close
          </Button>
          <Button size="sm" onClick={handleDownloadPDF} className="flex-grow gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            className="w-10 p-0 hidden sm:flex items-center justify-center"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
