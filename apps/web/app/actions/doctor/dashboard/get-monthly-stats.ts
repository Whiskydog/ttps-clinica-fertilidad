"use server";

export type MonthlyStats = {
  treatmentsStarted: number;
  proceduresPerformed: number;
  transfers: number;
  positiveBetas: number;
  positiveRate: number;
  cryoEmbryos: number;
  fecundationRate: number;
};

export async function getMonthlyStats(): Promise<{ data: MonthlyStats }> {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 300));

  const data: MonthlyStats = {
    treatmentsStarted: 15,
    proceduresPerformed: 8,
    transfers: 12,
    positiveBetas: 6,
    positiveRate: 50, // percentage
    cryoEmbryos: 45,
    fecundationRate: 78, // percentage
  };

  console.log("[DOCTOR] GET Monthly Stats:", data);

  return { data };
}
