import { GynecologicalHistoryForm } from "@/components/medical-history/GynecologicalHistoryForm";
import { PartnerWithGynecology, MedicalDataState } from "@repo/contracts";

interface PartnerDataSectionProps {
  medicalData: MedicalDataState;
  setMedicalData: React.Dispatch<React.SetStateAction<MedicalDataState>>;
  onSubmit: () => void;
  isPending: boolean;
}

export const PartnerDataSection = ({
  medicalData,
  setMedicalData,
  onSubmit,
  isPending,
}: PartnerDataSectionProps) => (
  <section className="card">
    <h3 className="section-title">Datos de la pareja</h3>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      {/* Inputs generales de pareja */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(medicalData.partner).map(([key, value]) => {
          if (
            [
              "menarcheAge",
              "cycleRegularity",
              "cycleDurationDays",
              "bleedingCharacteristics",
              "gestations",
              "births",
              "abortions",
              "ectopicPregnancies",
            ].includes(key)
          )
            return null;
          if (key === "biologicalSex") {
            return (
              <div key={key} className="form-group">
                <label className="label">Sexo biológico</label>
                <select
                  name={key}
                  value={medicalData.partner.biologicalSex || ""}
                  required
                  onChange={(e) =>
                    setMedicalData((prev) => ({
                      ...prev,
                      partner: {
                        ...prev.partner,
                        [e.target.name]: e.target.value || null,
                      },
                    }))
                  }
                  className="select"
                >
                  <option value="">Seleccionar...</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="intersex">Intersex</option>
                </select>
              </div>
            );
          }
          if (
            key === "genitalBackgrounds" &&
            medicalData.partner.biologicalSex !== "male"
          ) {
            return null;
          }
          const isDate = key === "birthDate";
          const isEmail = key === "email";
          const isPhone = key === "phone";
          const inputValue =
            typeof value === "string" || typeof value === "number" ? value : "";

          // Función para obtener el label legible
          const getFieldLabel = (fieldKey: string) => {
            const labels: Record<string, string> = {
              firstName: "Nombre",
              lastName: "Apellido",
              dni: "DNI",
              birthDate: "Fecha de nacimiento",
              occupation: "Ocupación",
              phone: "Teléfono",
              email: "Email",
              genitalBackgrounds: "Antecedentes genitales",
            };
            return labels[fieldKey] || fieldKey.replace(/([A-Z])/g, " $1");
          };

          const isRequired =
            ["firstName", "lastName", "dni", "birthDate"].includes(key) ||
            (key === "genitalBackgrounds" &&
              medicalData.partner.biologicalSex === "male");

          return (
            <div key={key} className="form-group">
              <label className="label">{getFieldLabel(key)}</label>
              <input
                name={key}
                type={
                  isDate ? "date" : isEmail ? "email" : isPhone ? "tel" : "text"
                }
                value={inputValue}
                required={isRequired}
                onChange={(e) =>
                  setMedicalData((prev) => ({
                    ...prev,
                    partner: {
                      ...prev.partner,
                      [e.target.name]:
                        e.target.type === "number"
                          ? e.target.value === ""
                            ? null
                            : Number(e.target.value)
                          : e.target.value,
                    },
                  }))
                }
                className="input"
              />
            </div>
          );
        })}
      </div>

      {/* Historia ginecológica pareja solo si es femenina, igual al form del paciente, pero NO como form anidado */}
      {medicalData.partner.biologicalSex === "female" && (
        <GynecologicalHistoryForm
          title="Historia ginecológica de la pareja"
          state={medicalData.partner}
          setState={
            ((newPartner) =>
              setMedicalData((prev) => ({
                ...prev,
                partner:
                  typeof newPartner === "function"
                    ? newPartner(prev.partner)
                    : newPartner,
              }))) as React.Dispatch<
              React.SetStateAction<PartnerWithGynecology>
            >
          }
          required={true}
        />
      )}

      <button className="btn-primary">
        {isPending ? "Guardando..." : "Guardar pareja"}
      </button>
    </form>
  </section>
);
