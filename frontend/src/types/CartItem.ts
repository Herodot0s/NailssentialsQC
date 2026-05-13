export interface CartChildService {
  serviceId: number;
  serviceName: string;
  price: number;
  duration: number;
  staffId?: number;
  staffName?: string;
  startTime?: string;
}

export interface CartItem {
  serviceId: number;
  serviceName: string;
  price: number;
  duration: number;
  staffId?: number;
  staffName?: string;
  startTime?: string;
  type?: 'service' | 'package';
  packageId?: number;
  packageName?: string;
  packagePrice?: number;
  childServices?: CartChildService[];
  imageUrl?: string;
}
