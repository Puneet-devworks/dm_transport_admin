import { useQuery } from "@tanstack/react-query";
import { fetchDrivers } from "./driverAPI";

export function useDriversQuery({ page = 1, limit = 20, search = "" } = {}) {
  return useQuery({
    queryKey: ["drivers", page, limit, search],
    queryFn: () => fetchDrivers({ page, limit, search }),
  });
}
