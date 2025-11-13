export const mockPatient = {
  id: 1,
  firstName: 'María',
  lastName: 'González',
  email: 'paciente@test.com',
  dni: '35123456',
  phone: '+541112345678',
  dateOfBirth: '1990-05-15',
  biologicalSex: 'FEMALE',
  occupation: 'Diseñadora Gráfica',
  address: 'Av. Corrientes 1234, CABA',
  medicalInsurance: {
    id: 1,
    name: 'Swiss Medical',
  },
  coverageMemberId: '123456789',
};

export const mockCurrentTreatment = {
  id: 1,
  status: 'vigente',
  initialObjective: 'gametos_propios',
  startDate: '2025-09-01',
  doctor: {
    id: 2,
    firstName: 'Juan',
    lastName: 'Pérez',
    specialty: 'Medicina Reproductiva',
  },
  partner: {
    firstName: 'Pedro',
    lastName: 'González',
    dni: '33456789',
  },
  nextAppointment: {
    date: '2025-09-25',
    time: '10:00',
    type: 'monitoreo',
  },
};

export const mockTreatmentDetail = {
  id: 1,
  code: '#2025-001',
  status: 'vigente',
  type: 'Fertilización asistida con gametos propios',
  initialObjective: 'Embarazo con gametos propios',
  startDate: '2025-09-01',
  doctor: {
    firstName: 'Juan',
    lastName: 'Pérez',
    specialty: 'Medicina Reproductiva',
  },
  partner: {
    firstName: 'Pedro',
    lastName: 'González',
    dni: '33456789',
    semenData: 'Viable',
    donorRequired: false,
  },
  timeline: [
    {
      id: 1,
      date: '2025-09-01',
      phase: 'Primera Consulta',
      status: 'completed',
    },
    {
      id: 2,
      date: '2025-09-10',
      phase: 'Estudios Completados',
      status: 'completed',
    },
    {
      id: 3,
      date: '2025-09-16',
      phase: 'Inicio Estimulación',
      status: 'completed',
    },
    {
      id: 4,
      date: '2025-09-20',
      phase: 'Monitoreos',
      status: 'in_progress',
    },
    {
      id: 5,
      date: '2025-09-30',
      phase: 'Punción (Programada)',
      status: 'pending',
    },
    {
      id: 6,
      phase: 'Fertilización',
      status: 'pending',
    },
    {
      id: 7,
      phase: 'Transferencia',
      status: 'pending',
    },
  ],
  protocol: {
    type: 'Antagonista',
    drug: 'Gonal-F (Folitropina alfa)',
    dose: '150 UI/día',
    via: 'Subcutánea',
    duration: '12-14 días',
    startDate: '2025-09-16',
    additionalMedication: [
      'Cetrotide 0.25mg (desde día 6)',
      'Ovidrel 250mcg (trigger)',
    ],
    consentSigned: true,
    consentDate: '2025-09-16',
  },
  monitorings: [
    {
      id: 1,
      date: '2025-09-20',
      day: 4,
      follicles: '8',
      follicleSize: '>10mm',
      estradiol: 425,
      unit: 'pg/ml',
      observations: 'Buena respuesta inicial',
    },
    {
      id: 2,
      date: '2025-09-23',
      day: 7,
      follicles: '10',
      follicleSize: '>14mm',
      estradiol: 890,
      unit: 'pg/ml',
      observations: 'Respuesta adecuada',
    },
    {
      id: 3,
      date: '2025-09-26',
      day: 10,
      follicles: '12',
      follicleSize: '>17mm',
      estradiol: 1450,
      unit: 'pg/ml',
      observations: 'Programar trigger',
    },
  ],
  puncture: {
    status: 'pending',
    scheduledDate: '2025-09-30',
    scheduledTime: '09:00',
    operatingRoom: 2,
  },
  embryos: [],
  doctorNotes: [
    {
      id: 1,
      date: '2025-09-16',
      note: 'Paciente con buena reserva ovárica. Iniciamos protocolo antagonista estándar.',
    },
    {
      id: 2,
      date: '2025-09-20',
      note: 'Excelente respuesta inicial. Mantener dosis.',
    },
    {
      id: 3,
      date: '2025-09-23',
      note: 'Agregar Cetrotide según protocolo.',
    },
    {
      id: 4,
      date: '2025-09-26',
      note: 'Folículos maduros adecuados. Trigger programado para 28/09 a las 21:00hs.',
    },
  ],
};

export const mockTreatmentHistory = [
  {
    id: 2,
    code: '#2024-005',
    status: 'closed',
    type: 'Fertilización con gametos propios',
    doctor: {
      firstName: 'Juan',
      lastName: 'Pérez',
    },
    period: '01/2024 - 03/2024',
    startDate: '2024-01-15',
    endDate: '2024-03-20',
  },
];

export const mockMedicalOrders = [
  {
    id: 1,
    code: '#2025-0145',
    status: 'pending',
    issueDate: '2025-09-16',
    doctor: {
      firstName: 'Juan',
      lastName: 'Pérez',
    },
    category: 'Estudios Hormonales',
    studies: ['FSH', 'LH', 'Estradiol', 'Progesterona'],
    description: 'Estudios: Hormonales (FSH, LH, Estradiol, Progesterona)',
  },
  {
    id: 2,
    code: '#2025-0146',
    status: 'pending',
    issueDate: '2025-09-16',
    doctor: {
      firstName: 'Juan',
      lastName: 'Pérez',
    },
    category: 'Estudios Prequirúrgicos',
    studies: ['Hemograma', 'Coagulograma', 'HIV', 'Hepatitis'],
    description: 'Estudios: Prequirúrgicos (Hemograma, Coagulograma, HIV, Hepatitis)',
  },
  {
    id: 3,
    code: '#2025-0143',
    status: 'completed',
    issueDate: '2025-09-10',
    completedDate: '2025-09-12',
    doctor: {
      firstName: 'Juan',
      lastName: 'Pérez',
    },
    category: 'Estudios Ginecológicos',
    studies: ['Ecografía transvaginal', 'PAP'],
    description: 'Estudios: Ginecológicos (Ecografía transvaginal, PAP)',
    results: {
      available: true,
      summary: 'Útero y ovarios sin alteraciones. PAP negativo.',
    },
  },
  {
    id: 4,
    code: '#2025-0147',
    status: 'pending',
    issueDate: '2025-09-20',
    doctor: {
      firstName: 'Juan',
      lastName: 'Pérez',
    },
    category: 'Medicación',
    description: 'Medicación: Protocolo de estimulación ovárica',
    medication: true,
  },
];

export const mockOrderDetail = {
  id: 1,
  code: '#2025-0145',
  status: 'pending',
  issueDate: '2025-09-16',
  doctor: {
    firstName: 'Juan',
    lastName: 'Pérez',
  },
  patient: {
    firstName: 'María',
    lastName: 'González',
    dni: '35.123.456',
  },
  medicalInsurance: {
    name: 'Swiss Medical',
    memberId: '123456789',
  },
  treatment: {
    code: '#2025-001',
  },
  category: 'ESTUDIOS HORMONALES',
  studies: [
    {
      name: 'FSH (Hormona Folículo Estimulante)',
      checked: true,
    },
    {
      name: 'LH (Hormona Luteinizante)',
      checked: true,
    },
    {
      name: 'Estradiol (E2)',
      checked: true,
    },
    {
      name: 'Progesterona',
      checked: true,
    },
    {
      name: 'AMH (Hormona Anti-Mülleriana)',
      checked: true,
    },
    {
      name: 'TSH (Hormona Estimulante de Tiroides)',
      checked: true,
    },
    {
      name: 'Prolactina',
      checked: true,
    },
  ],
  specialInstructions: [
    'Realizar en día 2-3 del ciclo menstrual',
    'Ayuno de 8 horas',
    'Suspender biotina 72hs antes',
  ],
  diagnosis: {
    code: 'CIE-10: N97.9',
    description: 'Infertilidad femenina, no especificada',
  },
  justification:
    'Evaluación hormonal basal para tratamiento de fertilización asistida. Paciente de 40 años con antecedentes de 2 abortos espontáneos previos. Se requiere evaluación completa del perfil hormonal para determinar protocolo de estimulación ovárica más adecuado.',
  laboratories: [
    {
      name: 'Laboratorio Rossi',
      address: 'Av. Pueyrredón 1234',
    },
    {
      name: 'Diagnóstico Maipú',
      address: 'Av. Maipú 456',
    },
    {
      name: 'Centro de Análisis Clínicos',
      address: 'Av. Santa Fe 789',
    },
    {
      name: 'Laboratorio Central Swiss Medical',
      address: 'Av. Corrientes 2020',
    },
  ],
  qrCode: 'OM-2025-0145-MG35',
};

export const mockCryopreservedProducts = {
  summary: {
    ovules: {
      total: 8,
      cryoDate: '2024-03-15',
    },
    embryos: {
      total: 3,
      lastUpdate: '2025-09-20',
    },
  },
  ovules: [
    {
      id: 'OVO_20240315_GON_MAR_01_a3f2',
      status: 'Maduro - Criopreservado',
      location: 'Tubo 23 - Rack A',
      tank: 'T-23',
      rack: 'A',
      tube: '23',
    },
    {
      id: 'OVO_20240315_GON_MAR_02_b5g7',
      status: 'Maduro - Criopreservado',
      location: 'Tubo 23 - Rack A',
      tank: 'T-23',
      rack: 'A',
      tube: '23',
    },
  ],
  embryos: [
    {
      id: 'EMB_20250920_GON_MAR_01_x7k3',
      quality: '4/5',
      fertilizationDate: '2025-09-20',
      location: 'Tubo 23 - Rack A',
      pgt: 'OK',
      pgtStatus: 'Normal (Euploide)',
      tank: 'T-23',
      rack: 'A',
      tube: '23',
    },
    {
      id: 'EMB_20250920_GON_MAR_02_p9m2',
      quality: '5/5',
      fertilizationDate: '2025-09-20',
      location: 'Tubo 23 - Rack A',
      pgt: 'OK',
      pgtStatus: 'Normal (Euploide)',
      tank: 'T-23',
      rack: 'A',
      tube: '23',
    },
  ],
};

export const mockEmbryoDetail = {
  id: 'EMB_20250920_GON_MAR_01_x7k3',
  status: 'CRIOPRESERVADO',
  type: 'Embrión',
  fertilizationDate: '2025-09-20',
  cryopreservationDate: '2025-09-25',
  daysInCulture: 5,
  quality: '4/5',
  qualityGrade: 'Buena',
  location: {
    tank: 'T-23',
    rack: 'B',
    canister: '3',
    position: '12',
  },
  technicalData: {
    originOvule: 'OVO_20250920_GON_MAR_03',
    fertilizationTechnique: 'ICSI',
    developmentDay: 'Día 5 (Blastocisto)',
    cryopreservationTechnique: 'Vitrificación',
    mediumUsed: 'Kitazato',
    pgt: {
      performed: true,
      result: 'Normal (Euploide)',
      chromosomalSex: 'XX',
    },
    responsibleOperator: 'Lic. Ana Martínez',
    observations: 'Sin anomalías detectadas',
  },
  journey: [
    {
      date: '2025-09-20',
      time: '10:00',
      phase: 'Extraído',
      status: 'completed',
    },
    {
      date: '2025-09-20',
      time: '14:00',
      phase: 'Estado: Maduro',
      status: 'completed',
    },
    {
      date: '2025-09-20',
      time: '16:00',
      phase: 'Fertilización ICSI',
      status: 'completed',
    },
    {
      date: '2025-09-21',
      time: '09:00',
      phase: 'Día 1: 2 células',
      status: 'completed',
    },
    {
      date: '2025-09-22',
      time: '09:00',
      phase: 'Día 2: 4 células',
      status: 'completed',
    },
    {
      date: '2025-09-25',
      time: '09:00',
      phase: 'Día 5: Blastocisto',
      status: 'completed',
    },
    {
      date: '2025-09-25',
      time: '14:00',
      phase: 'Criopreservado',
      status: 'completed',
    },
  ],
  actions: [
    {
      id: 'transfer',
      label: 'Solicitar Transferencia',
      variant: 'default',
      disabled: false,
    },
    {
      id: 'extend',
      label: 'Extender Criopreservación',
      variant: 'outline',
      disabled: false,
    },
    {
      id: 'discard',
      label: 'Solicitar Descarte',
      variant: 'destructive',
      disabled: false,
    },
  ],
  note: 'Cualquier acción sobre productos criopreservados requiere autorización médica',
};

export const mockCalendarEvents = [
  {
    id: 1,
    date: '2025-09-01',
    time: '09:00',
    type: 'control',
    title: 'Control',
    status: 'completed',
  },
  {
    id: 2,
    date: '2025-09-04',
    time: '16:30',
    type: 'monitoreo',
    title: 'Monitoreo',
    status: 'scheduled',
  },
  {
    id: 3,
    date: '2025-09-09',
    time: '14:00',
    type: 'monitoreo',
    title: 'Monitoreo',
    status: 'scheduled',
  },
  {
    id: 4,
    date: '2025-09-20',
    time: '14:30',
    type: 'monitoreo',
    title: 'Monitoreo',
    status: 'scheduled',
  },
  {
    id: 5,
    date: '2025-09-24',
    time: '09:00',
    type: 'puncion',
    title: 'Punción',
    doctor: 'Dr. Juan Pérez',
    operatingRoom: 'Quirófano 2',
    status: 'scheduled',
  },
];

export const mockUpcomingAppointments = [
  {
    id: 5,
    date: '2025-09-24',
    time: '09:00',
    type: 'Punción ovárica',
    doctor: 'Dr. Juan Pérez',
    operatingRoom: 'Quirófano 2',
  },
];
