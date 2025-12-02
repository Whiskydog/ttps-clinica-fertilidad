"use client";

import { useQuery } from "@tanstack/react-query";
import { getDoctors } from "@/lib/services/doctor";

export function useDoctors() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
    staleTime: 1000 * 60, // 1 min
  });

  return { doctors: data, isLoading, isError, error };
}
