import { TreatmentCard } from '@/components/patient/dashboard/treatment-card';
import { QuickActions } from '@/components/patient/dashboard/quick-actions';
import { TreatmentHistory } from '@/components/patient/dashboard/treatment-history';
import { mockCurrentTreatment, mockPatient, mockTreatmentHistory } from './lib/mock-data';

export default function PatientDashboard() {
  return (
    <div className="space-y-6">
      {/* <div>
        <h1 className="text-3xl font-bold text-white">
          Bienvenida, {mockPatient.firstName} {mockPatient.lastName}
        </h1>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          <TreatmentCard treatment={mockCurrentTreatment} />
          <TreatmentHistory treatments={mockTreatmentHistory} />
        </div>

        <div className="lg:col-span-1 order-1 lg:order-2">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
