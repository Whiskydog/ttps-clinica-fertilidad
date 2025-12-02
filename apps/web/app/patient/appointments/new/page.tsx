import BookAppointmentForm from "@/components/patient/appointments/BookAppointmentForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewAppointmentPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-500 mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        <BookAppointmentForm />
      </div>
    </div>
  );
}
