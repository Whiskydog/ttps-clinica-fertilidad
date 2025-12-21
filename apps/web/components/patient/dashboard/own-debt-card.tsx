import { Button } from "@repo/ui/button";
import { motion } from "motion/react";

interface Props {
  debt: number;
}

export function OwnDebtCard({ debt }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      className="flex items-center justify-between p-6 bg-white rounded-lg shadow"
    >
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Su deuda</h2>
        <p className="text-2xl font-semibold text-red-600">
          {debt.toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
          })}
        </p>
      </div>
      <div>
        <Button variant="destructive" disabled={debt === 0}>
          Pagar
        </Button>
      </div>
    </motion.div>
  );
}
