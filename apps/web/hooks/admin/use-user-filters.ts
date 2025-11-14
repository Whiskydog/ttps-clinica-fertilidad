"use client";

import { useState } from "react";

export interface UserFilters {
  search: string;
  role: string;
  status: string;
}

export function useUserFilters() {
  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    role: "all",
    status: "all",
  });

  const updateFilter = (key: keyof UserFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      role: "all",
      status: "all",
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}
