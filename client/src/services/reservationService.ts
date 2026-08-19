import api from "../api/api";

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export interface Reservation {
  _id: string;
  restaurantId: string;
  customerId: any;
  tableId: any;
  reservationDate: string;
  time: string;
  guests: number;
  notes?: string;
  status: ReservationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReservationData {
  customerId: string;
  tableId: string;
  reservationDate: string;
  time: string;
  guests: number;
  notes?: string;
}

// Get owner's reservations
export const getReservations = async () => {
  const response = await api.get("/reservations");

  return response.data;
};

// Create reservation
export const createReservation = async (
  data: CreateReservationData
) => {
  const response = await api.post("/reservations", data);

  return response.data;
};

// Update reservation status
export const updateReservationStatus = async (
  id: string,
  status: ReservationStatus
) => {
  const response = await api.patch(
    `/reservations/${id}/status`,
    { status }
  );

  return response.data;
};

// Delete reservation
export const deleteReservation = async (id: string) => {
  const response = await api.delete(
    `/reservations/${id}`
  );

  return response.data;
};