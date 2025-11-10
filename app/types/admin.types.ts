export interface VehicleType {
  id: string;
  make: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
}

export interface UserType {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  department: string;
  avatar: string | null;
  vehicles: VehicleType[];
}
