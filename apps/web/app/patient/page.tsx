"use client";

import { getCurrentTreatment } from "@/app/actions/patients/treatments/get-current";
import { getTreatmentHistory } from "@/app/actions/patients/treatments/get-history";
import { OwnDebtCard } from "@/components/patient/dashboard/own-debt-card";
import { QuickActions } from "@/components/patient/dashboard/quick-actions";
import { TreatmentCard } from "@/components/patient/dashboard/treatment-card";
import { TreatmentHistory } from "@/components/patient/dashboard/treatment-history";
import { usePayments } from "@/hooks/payments/usePayments";
import type { Treatment } from "@repo/contracts";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";

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

  const { ownDebtQuery } = usePayments();
  const { data: ownDebt, isLoading: isLoadingOwnDebt } = ownDebtQuery;

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
        <motion.div
          layout
          className="lg:col-span-2 space-y-6 order-2 lg:order-1"
        >
          <AnimatePresence initial={false}>
            {!isLoadingOwnDebt && ownDebt && ownDebt.debt > 0 && (
              <OwnDebtCard key="own-debt" debt={ownDebt.debt} />
            )}
            <TreatmentCard
              key="current-treatment"
              treatment={currentTreatment}
            />
            <TreatmentHistory
              key="treatment-history"
              treatments={treatmentHistory}
            />
          </AnimatePresence>
        </motion.div>

        <div className="lg:col-span-1 order-1 lg:order-2">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
