import React from "react";
import { CycleRegularity, GynecologicalFormData } from "@repo/contracts";

export type GynecologicalHistoryFormProps<T> = {
  title: string;
  state: T;
  setState: React.Dispatch<React.SetStateAction<T>>;
  disabled?: boolean;
  required?: boolean;
};

export function GynecologicalHistoryForm<T extends GynecologicalFormData>({
  title,
  state,
  setState,
  disabled = false,
  required = false,
}: GynecologicalHistoryFormProps<T>) {
  // Generic handler
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setState((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? null : Number(value)) : value,
    }));
  };

  return (
    <div className="card">
      <h3 className="section-title">{title}</h3>
      <div className="grid-form">
        <div className="form-group">
          <label className="label">Menarquia (edad)</label>
          <input
            type="number"
            name="menarcheAge"
            value={state.menarcheAge ?? ""}
            onChange={handleChange}
            className="input"
            min={8}
            max={20}
            disabled={disabled}
            required={required}
          />
        </div>
        <div className="form-group">
          <label className="label">Regularidad del ciclo</label>
          <select
            name="cycleRegularity"
            value={state.cycleRegularity ?? ""}
            onChange={handleChange}
            className="select"
            disabled={disabled}
            required={required}
          >
            <option value="">Seleccionar</option>
            <option value={CycleRegularity.REGULAR}>Regular</option>
            <option value={CycleRegularity.IRREGULAR}>Irregular</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Duración del ciclo (días)</label>
          <input
            type="number"
            name="cycleDurationDays"
            value={state.cycleDurationDays ?? ""}
            onChange={handleChange}
            className="input"
            min={15}
            max={40}
            disabled={disabled}
            required={required}
          />
        </div>
        <div className="form-group">
          <label className="label">Características del sangrado</label>
          <input
            type="text"
            name="bleedingCharacteristics"
            value={state.bleedingCharacteristics ?? ""}
            onChange={handleChange}
            className="input"
            maxLength={100}
            disabled={disabled}
            required={required}
          />
        </div>
        <div className="form-group">
          <label className="label">Gestaciones</label>
          <input
            type="number"
            name="gestations"
            value={state.gestations ?? ""}
            onChange={handleChange}
            className="input"
            min={0}
            max={20}
            disabled={disabled}
            required={required}
          />
        </div>
        <div className="form-group">
          <label className="label">Partos</label>
          <input
            type="number"
            name="births"
            value={state.births ?? ""}
            onChange={handleChange}
            className="input"
            min={0}
            max={20}
            disabled={disabled}
            required={required}
          />
        </div>
        <div className="form-group">
          <label className="label">Abortos</label>
          <input
            type="number"
            name="abortions"
            value={state.abortions ?? ""}
            onChange={handleChange}
            className="input"
            min={0}
            max={20}
            disabled={disabled}
            required={required}
          />
        </div>
        <div className="form-group">
          <label className="label">Embarazos ectópicos</label>
          <input
            type="number"
            name="ectopicPregnancies"
            value={state.ectopicPregnancies ?? ""}
            onChange={handleChange}
            className="input"
            min={0}
            max={20}
            disabled={disabled}
            required={required}
          />
        </div>
      </div>
    </div>
  );
}
