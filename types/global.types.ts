// Global data context types
interface UserType {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  department: string;
  avatar: string | null;
}


interface GlobalContextType {
    users: UserType[];
}

interface ReservationData {
    user_id: string | undefined;
    user_name: string | undefined;
    date: Date | undefined;
    startTime: string | undefined;
    endTime: string | undefined;
    recurring: boolean;
    recurringDays: string[];
    endDate: Date | undefined;
    location: string;
    parkingLot: string;
    row: number;
    col: number;
  }
  
export type { UserType, GlobalContextType, ReservationData };