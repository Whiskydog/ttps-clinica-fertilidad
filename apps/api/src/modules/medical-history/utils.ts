// Utilidades para medical-history

export function parseBirthDate(input: unknown): Date | null {
  if (input == null) return null;
  if (typeof input === 'string') {
    // Expect YYYY-MM-DD format (ISO)
    // Use Date constructor with year, month, day to avoid timezone issues
    const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, year, month, day] = match;
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      return isNaN(d.getTime()) ? null : d;
    }
    // Fallback to normal parsing
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
