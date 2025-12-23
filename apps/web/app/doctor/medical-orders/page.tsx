import { OrdersList } from "@/components/doctor/medical-orders/orders-list";

export default function DoctorOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">ÓRDENES MÉDICAS</h1>
      </div>

      <OrdersList />
    </div>
  );
}
