"use client";

import { useQuery } from "@tanstack/react-query";
import { TreatmentCard } from '@/components/patient/dashboard/treatment-card';
import { QuickActions } from '@/components/patient/dashboard/quick-actions';
import { TreatmentHistory } from '@/components/patient/dashboard/treatment-history';
import { getCurrentTreatment } from '@/app/actions/patients/treatments/get-current';
import { getTreatmentHistory } from '@/app/actions/patients/treatments/get-history';
import type { Treatment } from '@repo/contracts';

export default function PatientDashboard() {
  const { data: currentTreatmentResponse, isLoading: isLoadingCurrent } = useQuery({
    queryKey: ["current-treatment"],
    queryFn: () => getCurrentTreatment(),
  });

  const { data: treatmentHistoryResponse, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["treatment-history"],
    queryFn: () => getTreatmentHistory(),
  });

  const currentTreatment = (currentTreatmentResponse?.data as Treatment | null) ?? null;
  const treatmentHistory = (treatmentHistoryResponse?.data as Treatment[]) ?? [];

  if (isLoadingCurrent || isLoadingHistory) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          <TreatmentCard treatment={currentTreatment} />
          <TreatmentHistory treatments={treatmentHistory} />
        </div>

        <div className="lg:col-span-1 order-1 lg:order-2">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
