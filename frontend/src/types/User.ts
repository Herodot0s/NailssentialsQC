export interface User {
  id: number;
  email: string | null;
  phone: string | null;
  role: string;
  fullName: string;
  staffProfileId?: number;
}
