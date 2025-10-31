import { MedicalDataState } from "@repo/contracts";

interface PhysicalExamSectionProps {
  medicalData: MedicalDataState;
  setMedicalData: React.Dispatch<React.SetStateAction<MedicalDataState>>;
  onSubmit: () => void;
  isPending: boolean;
}

export const PhysicalExamSection = ({
  medicalData,
  setMedicalData,
  onSubmit,
  isPending,
}: PhysicalExamSectionProps) => (
  <section className="card">
    <h3 className="section-title">Examen físico y antecedentes</h3>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div className="form-group">
        <label className="label">Examen físico</label>
        <textarea
          value={medicalData.physicalExamNotes}
          onChange={(e) =>
            setMedicalData((prev) => ({
              ...prev,
              physicalExamNotes: e.target.value,
            }))
          }
          rows={6}
          className="textarea"
          placeholder="Notas del examen físico"
        />
      </div>
      <div className="form-group">
        <label className="label">Antecedentes familiares</label>
        <textarea
          value={medicalData.familyBackgrounds}
          onChange={(e) =>
            setMedicalData((prev) => ({
              ...prev,
              familyBackgrounds: e.target.value,
            }))
          }
          rows={4}
          className="textarea"
          placeholder="Antecedentes familiares relevantes"
        />
      </div>
      <button type="submit" className="btn-primary">
        {isPending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  </section>
);
