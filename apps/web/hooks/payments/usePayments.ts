import { getOwnDebt, settleOwnDebt } from "@/lib/services/payments";
import { useMutation, useQuery } from "@tanstack/react-query";

export function usePayments() {
  const ownDebtQuery = useQuery({
    queryKey: ["own-debt"],
    queryFn: getOwnDebt,
    refetchOnMount: "always",
  });

  const settleOwnDebtMutation = useMutation({
    mutationFn: settleOwnDebt,
    onSuccess: () => {
      ownDebtQuery.refetch();
    },
  });

  return { ownDebtQuery, settleOwnDebtMutation };
}
