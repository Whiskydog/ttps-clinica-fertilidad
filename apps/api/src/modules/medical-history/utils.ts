// Utilidades para medical-history

export function parseBirthDate(input: unknown): Date | null {
  if (input == null) return null;
  if (typeof input === 'string') {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  return input instanceof Date ? input : null;
}

export function hasAnyGynecologicalField(
  gyne: Record<string, unknown>,
): boolean {
  return !!(
    gyne?.menarcheAge ||
    gyne?.cycleRegularity ||
    gyne?.cycleDurationDays ||
    gyne?.bleedingCharacteristics ||
    gyne?.gestations ||
    gyne?.births ||
    gyne?.abortions ||
    gyne?.ectopicPregnancies ||
    gyne?.partnerData
  );
}

/**
 * Formatea un medical history para respuesta API, convirtiendo fechas a ISO strings
 */
export function formatMedicalHistoryForResponse(mh: any) {
  return {
    ...mh,
    updatedAt: mh.updatedAt?.toISOString() ?? '',
    createdAt: mh.createdAt?.toISOString() ?? '',
    patient: mh.patient
      ? {
          ...mh.patient,
          dateOfBirth: mh.patient.dateOfBirth?.toISOString() ?? '',
        }
      : undefined,
  };
}
