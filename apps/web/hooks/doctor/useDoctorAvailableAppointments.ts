"use client";

import { getDoctorAvailableSlots } from "@/lib/services/doctor";
import { useQuery } from "@tanstack/react-query";

export function useDoctorAvailableAppointments(doctorId: number) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["doctors", doctorId],
    queryFn: () => getDoctorAvailableSlots(doctorId),
    staleTime: 1000 * 60, // 1 min
  });

  return { appointments: data, isLoading, isError, error };
}
