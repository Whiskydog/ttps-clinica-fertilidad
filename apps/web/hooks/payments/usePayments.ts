import { getOwnDebt } from "@/lib/services/payments";
import { useQuery } from "@tanstack/react-query";

export function usePayments() {
  const ownDebtQuery = useQuery({
    queryKey: ["own-debt"],
    queryFn: getOwnDebt,
    refetchOnMount: 'always',
  });

  return { ownDebtQuery };
}
