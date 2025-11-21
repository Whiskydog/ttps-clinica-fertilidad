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
 * Convierte un Date a ISO string, o retorna undefined si no existe
 */
function toISOString(date: any): string | undefined {
  if (!date) return undefined;
  if (date instanceof Date) return date.toISOString();
  return undefined;
}

/**
 * Convierte un string decimal (de PostgreSQL) a number
 */
function parseDecimal(value: any): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Formatea un medical history para respuesta API, convirtiendo fechas a ISO strings
 * y ajustando tipos para que coincidan con los schemas de Zod
 */
export function formatMedicalHistoryForResponse(mh: any) {
  const medicalHistoryId = mh.id;

  return {
    id: mh.id,
    createdAt: toISOString(mh.createdAt) ?? '',
    updatedAt: toISOString(mh.updatedAt) ?? '',
    patient: mh.patient
      ? {
          id: mh.patient.id,
          firstName: mh.patient.firstName,
          lastName: mh.patient.lastName,
          biologicalSex: mh.patient.biologicalSex,
          email: mh.patient.email,
          dni: mh.patient.dni,
          dateOfBirth: toISOString(mh.patient.dateOfBirth) ?? '',
          occupation: mh.patient.occupation,
        }
      : undefined,
    physicalExamNotes: mh.physicalExamNotes ?? null,
    familyBackgrounds: mh.familyBackgrounds ?? null,
    partnerData: mh.partnerData
      ? {
          id: mh.partnerData.id,
          firstName: mh.partnerData.firstName,
          lastName: mh.partnerData.lastName,
          dni: mh.partnerData.dni,
          birthDate: mh.partnerData.birthDate,
          occupation: mh.partnerData.occupation,
          phone: mh.partnerData.phone,
          email: mh.partnerData.email,
          biologicalSex: mh.partnerData.biologicalSex,
          genitalBackgrounds: mh.partnerData.genitalBackgrounds,
        }
      : null,
    gynecologicalHistory: mh.gynecologicalHistory?.map((gyne: any) => ({
      id: gyne.id,
      partnerData: gyne.partnerData
        ? {
            id: gyne.partnerData.id,
            firstName: gyne.partnerData.firstName,
            lastName: gyne.partnerData.lastName,
            dni: gyne.partnerData.dni,
            birthDate: gyne.partnerData.birthDate,
            occupation: gyne.partnerData.occupation,
            phone: gyne.partnerData.phone,
            email: gyne.partnerData.email,
            biologicalSex: gyne.partnerData.biologicalSex,
            genitalBackgrounds: gyne.partnerData.genitalBackgrounds,
          }
        : null,
      menarcheAge: gyne.menarcheAge,
      cycleRegularity: gyne.cycleRegularity,
      cycleDurationDays: gyne.cycleDurationDays,
      bleedingCharacteristics: gyne.bleedingCharacteristics,
      gestations: gyne.gestations,
      births: gyne.births,
      abortions: gyne.abortions,
      ectopicPregnancies: gyne.ectopicPregnancies,
    })),
    habits: mh.habits?.map((habit: any) => ({
      id: habit.id,
      medicalHistoryId: medicalHistoryId,
      cigarettesPerDay: habit.cigarettesPerDay,
      yearsSmoking: habit.yearsSmoking,
      packDaysValue: parseDecimal(habit.packDaysValue),
      alcoholConsumption: habit.alcoholConsumption,
      recreationalDrugs: habit.recreationalDrugs,
      createdAt: toISOString(habit.createdAt),
      updatedAt: toISOString(habit.updatedAt),
    })),
    fenotypes: mh.fenotypes?.map((fenotype: any) => ({
      id: fenotype.id,
      medicalHistoryId: medicalHistoryId,
      partnerDataId: fenotype.partnerData?.id ?? null,
      eyeColor: fenotype.eyeColor,
      hairColor: fenotype.hairColor,
      hairType: fenotype.hairType,
      height: parseDecimal(fenotype.height),
      complexion: fenotype.complexion,
      ethnicity: fenotype.ethnicity,
      createdAt: toISOString(fenotype.createdAt),
      updatedAt: toISOString(fenotype.updatedAt),
    })),
    backgrounds: mh.backgrounds?.map((background: any) => ({
      id: background.id,
      medicalHistoryId: medicalHistoryId,
      termCode: background.termCode,
      backgroundType: background.backgroundType,
      createdAt: toISOString(background.createdAt),
      updatedAt: toISOString(background.updatedAt),
    })),
  };
}
