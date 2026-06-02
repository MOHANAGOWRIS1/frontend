export interface BloodRequest {
  _id?: string;
  patientName: string;
  age: number;
  gender: string;
  bloodGroup: string;
  units: number;
  hospitalName: string;
  hospitalAddress: string;
  location: {
    lat: number | null;
    lng: number | null;
  };
  status?: string;
  createdAt?: Date;
}
