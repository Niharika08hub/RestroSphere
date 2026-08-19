import api from "../api/api";

export const getTables = () =>
  api.get("/tables");

export const createTable = (data: {
  tableNumber: number;
  capacity: number;
}) =>
  api.post("/tables", data);

export const updateTableStatus = (
  id: string,
  status: "available" | "occupied" | "reserved"
) =>
  api.patch(`/tables/${id}/status`, { status });

export const deleteTable = (id: string) =>
  api.delete(`/tables/${id}`);