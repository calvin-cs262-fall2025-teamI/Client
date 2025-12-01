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
    name: string | undefined;
    date: Date | undefined;
    startTime: string;
    endTime: string;
    recurring: boolean;
    repeatPattern: string;
    endDate: Date | undefined;
    location: string;
    parkingLot: string;
    spot: string;
  }
  
export type { UserType, GlobalContextType, ReservationData };