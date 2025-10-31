import { GynecologicalHistoryForm } from "@/components/medical-history/GynecologicalHistoryForm";
import { GynecologicalHistory, MedicalDataState } from "@repo/contracts";

interface PatientGynecologySectionProps {
  medicalData: MedicalDataState;
  setMedicalData: React.Dispatch<React.SetStateAction<MedicalDataState>>;
  onSubmit: () => void;
  isPending: boolean;
  biologicalSex?: string;
}

export const PatientGynecologySection = ({
  medicalData,
  setMedicalData,
  onSubmit,
  isPending,
  biologicalSex,
}: PatientGynecologySectionProps) => {
  if (biologicalSex !== "female") return null;

  return (
    <section className="card">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4"
      >
        <GynecologicalHistoryForm
          title="Historia ginecológica de la paciente"
          state={medicalData.patientGynecology}
          setState={
            ((newGynecology) =>
              setMedicalData((prev) => ({
                ...prev,
                patientGynecology:
                  typeof newGynecology === "function"
                    ? newGynecology(prev.patientGynecology)
                    : newGynecology,
              }))) as React.Dispatch<React.SetStateAction<GynecologicalHistory>>
          }
        />
        <button className="btn-primary">
          {isPending ? "Guardando..." : "Guardar ginecológico"}
        </button>
      </form>
    </section>
  );
};
