export interface User {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  role: string;
  fullName: string;
  staffProfileId?: number;
}
