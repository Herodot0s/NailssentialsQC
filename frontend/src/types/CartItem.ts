export interface CartItem {
  serviceId: number;
  serviceName: string;
  price: number;
  duration: number;
  staffId?: number;
  staffName?: string;
  startTime?: string;
}
