-- ========================================
-- SEED DE DATOS MÉDICOS PARA PACIENTE
-- ========================================
-- Este script crea datos médicos de prueba para María González (DNI 35123456)
-- Incluye: historia clínica completa con nuevas entidades, tratamiento,
-- órdenes médicas con resultados, monitoreos y productos criopreservados
--
-- PREREQUISITO: Ejecutar primero seed-users-data.sql
-- ========================================

-- ============================================================
-- PASO 1: CREAR HISTORIA CLÍNICA COMPLETA Y TRATAMIENTO
-- ============================================================

-- Variables para almacenar IDs (usar DO block)
DO $$
DECLARE
  v_patient_id INTEGER;
  v_doctor_id INTEGER;
  v_lab_tech_id INTEGER;
  v_medical_history_id INTEGER;
  v_treatment_id INTEGER;
  v_partner_data_id INTEGER;
  v_medical_order_gineco_id INTEGER;
  v_medical_insurance_id INTEGER;
  v_puncture_record_id INTEGER;
  v_oocyte_1_id INTEGER;
  v_oocyte_2_id INTEGER;
  v_oocyte_3_id INTEGER;
  v_oocyte_4_id INTEGER;
  v_oocyte_5_id INTEGER;
  v_embryo_1_id INTEGER;
  v_embryo_2_id INTEGER;
BEGIN
  -- Obtener ID del paciente María González
  SELECT id INTO v_patient_id FROM users WHERE dni = '35123456' AND role = 'patient';

  -- Obtener ID del primer doctor (Juan Carlos Pérez)
  SELECT id INTO v_doctor_id FROM users WHERE email = 'jperez@clinica.com' AND role = 'doctor';

  -- Obtener ID de un técnico de laboratorio
  SELECT id INTO v_lab_tech_id FROM users WHERE email = 'lmartinez@clinica.com' AND role = 'lab_technician';

  -- Obtener ID de una obra social (OSDE)
  SELECT id INTO v_medical_insurance_id FROM medical_insurances WHERE name = 'OSDE' LIMIT 1;

  -- Crear historia clínica
  INSERT INTO medical_histories (patient_id, creation_date, physical_exam_notes, family_backgrounds)
  VALUES (
    v_patient_id,
    '2025-09-01',
    'Peso: 65kg, Altura: 165cm. Presión arterial: 120/80. Examen físico normal.',
    'Madre: hipertensión. Padre: diabetes tipo 2.'
  )
  RETURNING id INTO v_medical_history_id;

  -- ============================================================
  -- NUEVAS ENTIDADES: HABITS, FENOTYPES, BACKGROUNDS
  -- ============================================================

  -- Hábitos de la paciente
  INSERT INTO habits (
    medical_history_id,
    cigarettes_per_day,
    years_smoking,
    pack_days_value,
    alcohol_consumption,
    recreational_drugs
  )
  VALUES (
    v_medical_history_id,
    0,  -- No fumadora
    NULL,
    0.0,
    'Ocasional (social)',
    'No'
  );

  -- Datos de la pareja
  INSERT INTO partner_data (
    medical_history_id,
    first_name,
    last_name,
    dni,
    birth_date,
    biological_sex,
    occupation,
    email,
    phone
  )
  VALUES (
    v_medical_history_id,
    'Pedro',
    'González',
    '33456789',
    '1988-03-20',
    'male',
    'Ingeniero en Sistemas',
    'pedro.gonzalez@email.com',
    '+54 11 4567-8901'
  )
  RETURNING id INTO v_partner_data_id;

  -- Fenotipo de la paciente
  INSERT INTO fenotypes (
    medical_history_id,
    partner_data_id,
    eye_color,
    hair_color,
    hair_type,
    height,
    complexion,
    ethnicity
  )
  VALUES (
    v_medical_history_id,
    NULL,  -- Paciente
    'Marrón',
    'Castaño oscuro',
    'Lacio',
    165,
    'Media',
    'Caucásica'
  );

  -- Fenotipo de la pareja
  INSERT INTO fenotypes (
    medical_history_id,
    partner_data_id,
    eye_color,
    hair_color,
    hair_type,
    height,
    complexion,
    ethnicity
  )
  VALUES (
    v_medical_history_id,
    v_partner_data_id,
    'Verde',
    'Castaño claro',
    'Ondulado',
    178,
    'Atlética',
    'Caucásica'
  );

  -- Antecedentes médicos
  INSERT INTO backgrounds (
    medical_history_id,
    term_code,
    background_type
  )
  VALUES
    (v_medical_history_id, 'Asma leve controlada', 'clinical'),
    (v_medical_history_id, 'Apendicectomía (2015)', 'surgical');

  -- Antecedentes médicos
  INSERT INTO backgrounds (
    medical_history_id,
    term_code,
    background_type
  )
  VALUES
    (v_medical_history_id, 'Hipertensión arterial (madre)', 'clinical'),
    (v_medical_history_id, 'Diabetes tipo 2 (padre)', 'clinical'),
    (v_medical_history_id, 'Hipotiroidismo (hermana)', 'clinical');

  -- Datos ginecológicos
  INSERT INTO gynecological_history (
    medical_history_id,
    menarche_age,
    cycle_regularity,
    cycle_duration_days,
    bleeding_characteristics,
    gestations,
    births,
    abortions,
    ectopic_pregnancies
  )
  VALUES (
    v_medical_history_id,
    13,
    'regular',
    28,
    'Moderado, sin dolor significativo',
    1,  -- Gestaciones
    0,  -- Partos
    1,  -- Abortos
    0   -- Ectópicos
  );

  -- ============================================================
  -- CREAR TRATAMIENTO CON NUEVAS RELACIONES
  -- ============================================================

  -- Crear tratamiento vigente
  INSERT INTO treatments (
    medical_history_id,
    initial_doctor_id,
    initial_objective,
    start_date,
    status
  )
  VALUES (
    v_medical_history_id,
    v_doctor_id,
    'gametos_propios',
    '2025-09-01',
    'vigente'
  )
  RETURNING id INTO v_treatment_id;

  -- Consentimiento informado (NUEVO)
  INSERT INTO informed_consent (
    treatment_id,
    pdf_uri,
    signature_date,
    uploaded_by_user_id
  )
  VALUES (
    v_treatment_id,
    '/documents/consents/IC-2025-0012-GONZALEZ-MARIA.pdf',
    '2025-09-16 10:30:00',
    v_doctor_id
  );

  -- Cobertura médica (NUEVO)
  INSERT INTO medical_coverage (
    treatment_id,
    medical_insurance_id,
    coverage_percentage,
    insurance_due
  )
  VALUES (
    v_treatment_id,
    v_medical_insurance_id,
    50.00,
    150000.00
  );

  -- ============================================================
  -- PASO 2: ÓRDENES MÉDICAS CON STUDY RESULTS
  -- ============================================================

  -- Orden 1: Estudios hormonales (PENDIENTE)
  INSERT INTO medical_orders (
    code, issue_date, status, category, description,
    studies, diagnosis, justification,
    patient_id, doctor_id, treatment_id
  )
  VALUES (
    'OM-2025-0145',
    '2025-09-16',
    'pending',
    'Estudios Hormonales',
    'Perfil hormonal completo para evaluación de fertilidad',
    '[
      {"name": "FSH (Hormona Folículo Estimulante)", "checked": true},
      {"name": "LH (Hormona Luteinizante)", "checked": true},
      {"name": "Estradiol (E2)", "checked": true},
      {"name": "Progesterona", "checked": true},
      {"name": "AMH (Hormona Anti-Mülleriana)", "checked": true},
      {"name": "TSH", "checked": true},
      {"name": "Prolactina", "checked": true}
    ]'::jsonb,
    'CIE-10: N97.9 - Infertilidad femenina, no especificada',
    'Evaluación hormonal basal para tratamiento de fertilización asistida.',
    v_patient_id,
    v_doctor_id,
    v_treatment_id
  );

  -- Orden 2: Estudios prequirúrgicos (PENDIENTE)
  INSERT INTO medical_orders (
    code, issue_date, status, category, description,
    studies, diagnosis, justification,
    patient_id, doctor_id, treatment_id
  )
  VALUES (
    'OM-2025-0146',
    '2025-09-16',
    'pending',
    'Estudios Prequirúrgicos',
    'Laboratorio completo prequirúrgico',
    '[
      {"name": "Hemograma completo", "checked": true},
      {"name": "Coagulograma", "checked": true},
      {"name": "HIV (ELISA)", "checked": true},
      {"name": "Hepatitis B y C", "checked": true}
    ]'::jsonb,
    'CIE-10: N97.9',
    'Estudios prequirúrgicos requeridos para procedimiento de punción ovárica.',
    v_patient_id,
    v_doctor_id,
    v_treatment_id
  );

  -- Orden 3: Estudios ginecológicos (COMPLETADA CON RESULTADOS ESTRUCTURADOS)
  INSERT INTO medical_orders (
    code, issue_date, status, category, description,
    studies, diagnosis, justification,
    completed_date,
    patient_id, doctor_id, treatment_id
  )
  VALUES (
    'OM-2025-0143',
    '2025-09-10',
    'completed',
    'Estudios Ginecológicos',
    'Evaluación ginecológica de base',
    '[
      {"name": "Ecografía transvaginal", "checked": true},
      {"name": "PAP (Papanicolaou)", "checked": true}
    ]'::jsonb,
    'CIE-10: N97.9',
    'Evaluación ginecológica de rutina para inicio de tratamiento.',
    '2025-09-12',
    v_patient_id,
    v_doctor_id,
    v_treatment_id
  )
  RETURNING id INTO v_medical_order_gineco_id;

  -- RESULTADOS ESTRUCTURADOS PARA ORDEN GINECOLÓGICA (NUEVO)
  INSERT INTO study_results (
    medical_order_id,
    study_name,
    determination_name,
    transcription,
    original_pdf_uri,
    transcribed_by_lab_technician_id,
    transcription_date
  )
  VALUES
    (
      v_medical_order_gineco_id,
      'Ecografía transvaginal',
      'Evaluación ovárica y uterina',
      'ECOGRAFÍA TRANSVAGINAL

Técnica: Se realiza exploración transvaginal con transductor de alta frecuencia.

ÚTERO:
- Posición: Anteversoflexión
- Dimensiones: 78 x 45 x 52 mm
- Endometrio: 8 mm, trilaminar
- Miometrio: Homogéneo, sin lesiones focales

OVARIO DERECHO:
- Dimensiones: 32 x 28 x 22 mm
- Volumen: 10.2 ml
- Folículos antrales: 6
- Sin lesiones quísticas

OVARIO IZQUIERDO:
- Dimensiones: 30 x 26 x 21 mm
- Volumen: 8.9 ml
- Folículos antrales: 6
- Sin lesiones quísticas

FONDO DE SACO DE DOUGLAS: Libre

CONCLUSIÓN:
- Útero de dimensiones normales, sin alteraciones estructurales
- Endometrio en fase proliferativa
- Ambos ovarios con morfología normal
- Conteo de folículos antrales: 12 (reserva ovárica adecuada)
- No se observan imágenes sugestivas de patología anexial',
      '/results/ecografia-tv-20250912-GONZALEZ.pdf',
      v_lab_tech_id,
      '2025-09-12 16:45:00'
    ),
    (
      v_medical_order_gineco_id,
      'PAP (Papanicolaou)',
      'Citología cervical',
      'CITOLOGÍA CERVICAL (PAP)

MUESTRA: Adecuada para evaluación
TOMA: Exocérvix y endocérvix

RESULTADO: NEGATIVO PARA LESIÓN INTRAEPITELIAL O MALIGNIDAD

CÉLULAS EPITELIALES:
- Células escamosas maduras: Presentes
- Células endocervicales: Presentes
- Cambios celulares benignos: Ausentes

MICROORGANISMOS:
- Flora bacilar normal (Lactobacillus)
- Sin evidencia de Trichomonas, Candida u otros microorganismos

OTROS:
- Células endometriales: No observadas
- Células inflamatorias: Escasas

CATEGORÍA BETHESDA: NILM (Negativo para lesión intraepitelial o malignidad)

RECOMENDACIÓN: Control según normas habituales de screening',
      '/results/pap-20250912-GONZALEZ.pdf',
      v_lab_tech_id,
      '2025-09-12 17:15:00'
    );

  -- ============================================================
  -- PASO 3: PROTOCOLO DE MEDICACIÓN
  -- ============================================================

  INSERT INTO medication_protocols (
    treatment_id, protocol_type, drug_name, dose,
    administration_route, duration, start_date,
    additional_medication, consent_signed, consent_date
  )
  VALUES (
    v_treatment_id,
    'Antagonista',
    'Gonal-F (Folitropina alfa)',
    '150 UI/día',
    'Subcutánea',
    '12-14 días',
    '2025-09-16',
    '["Cetrotide 0.25mg (desde día 6)", "Ovidrel 250mcg (trigger)"]'::jsonb,
    true,
    '2025-09-16'
  );

  -- ============================================================
  -- PASO 4: MONITOREOS
  -- ============================================================

  INSERT INTO treatment_monitorings (
    treatment_id, monitoring_date, day_number,
    follicle_count, follicle_size, estradiol_level,
    observations
  )
  VALUES
    (v_treatment_id, '2025-09-20', 4, 8, '10-12mm', 425.50, 'Buena respuesta inicial al estímulo'),
    (v_treatment_id, '2025-09-23', 7, 10, '14-16mm', 890.20, 'Respuesta adecuada. Continuar protocolo'),
    (v_treatment_id, '2025-09-26', 10, 12, '17-19mm', 1450.80, 'Folículos maduros. Programar trigger');

  -- ============================================================
  -- PASO 5: NOTAS DEL MÉDICO
  -- ============================================================

  INSERT INTO doctor_notes (treatment_id, doctor_id, note_date, note)
  VALUES
    (v_treatment_id, v_doctor_id, '2025-09-16', 'Paciente con buena reserva ovárica según ecografía basal (CFA: 12). Iniciamos protocolo antagonista estándar con Gonal-F 150 UI/día. Consentimientos firmados. Cobertura OSDE 50%.'),
    (v_treatment_id, v_doctor_id, '2025-09-20', 'Primer monitoreo día 4: Excelente respuesta inicial con 8 folículos en crecimiento. Niveles de estradiol adecuados (425 pg/ml). Endometrio 7.5mm. Mantener dosis actual.'),
    (v_treatment_id, v_doctor_id, '2025-09-23', 'Segundo monitoreo día 7: Continúa buena respuesta con 10 folículos. E2: 890 pg/ml. Endometrio 9.2mm. Agregamos Cetrotide 0.25mg según protocolo para evitar pico de LH prematuro.'),
    (v_treatment_id, v_doctor_id, '2025-09-26', 'Tercer monitoreo día 10: 12 folículos dominantes con tamaño óptimo (17-19mm). E2: 1450 pg/ml. Endometrio trilaminar 10.5mm. Trigger programado para 28/09 a las 22:00hs. Punción el 30/09 a las 08:00hs.');

  -- ============================================================
  -- PASO 6: HITOS POST-TRANSFERENCIA (NUEVO)
  -- ============================================================
  -- Simulando que hubo transferencia el 05/10/2025

  INSERT INTO post_transfer_milestones (
    treatment_id,
    milestone_type,
    result,
    milestone_date,
    registered_by_doctor_id
  )
  VALUES
    (
      v_treatment_id,
      'beta_test',
      'Positivo',
      '2025-10-15',
      v_doctor_id
    ),
    (
      v_treatment_id,
      'beta_test',
      'Duplic. adecuada',
      '2025-10-17',
      v_doctor_id
    ),
    (
      v_treatment_id,
      'sac_present',
      'Saco único',
      '2025-11-16',
      v_doctor_id
    );

  -- ============================================================
  -- PASO 7: LABORATORIO - PUNCIÓN, OOCITOS Y EMBRIONES
  -- ============================================================

  -- Registro de Punción Ovárica
  INSERT INTO puncture_records (
    treatment_id,
    puncture_date_time,
    operating_room_number,
    observations,
    lab_technician_id
  )
  VALUES (
    v_treatment_id,
    '2025-09-30 08:00:00',
    2,
    'Punción folicular realizada bajo sedación. Procedimiento sin complicaciones. Total de oocitos recuperados: 12.',
    v_lab_tech_id
  )
  RETURNING id INTO v_puncture_record_id;

  -- ============================================
  -- OOCITOS RECUPERADOS
  -- ============================================

  -- Oocito 1: MII Maduro → Fertilizado → Embrión 1
  INSERT INTO oocytes (
    unique_identifier,
    puncture_id,
    current_state,
    is_cryopreserved,
    cryo_tank,
    cryo_rack,
    cryo_tube
  )
  VALUES (
    'ovo_20250930_GON_MAR_01',
    v_puncture_record_id,
    'mature',
    false,
    NULL,
    NULL,
    NULL
  )
  RETURNING id INTO v_oocyte_1_id;

  -- Oocito 2: MII Maduro → Fertilizado → Embrión 2
  INSERT INTO oocytes (
    unique_identifier,
    puncture_id,
    current_state,
    is_cryopreserved,
    cryo_tank,
    cryo_rack,
    cryo_tube
  )
  VALUES (
    'ovo_20250930_GON_MAR_02',
    v_puncture_record_id,
    'mature',
    false,
    NULL,
    NULL,
    NULL
  )
  RETURNING id INTO v_oocyte_2_id;

  -- Oocito 3: MII Maduro → Criopreservado (no fertilizado)
  INSERT INTO oocytes (
    unique_identifier,
    puncture_id,
    current_state,
    is_cryopreserved,
    cryo_tank,
    cryo_rack,
    cryo_tube
  )
  VALUES (
    'ovo_20250930_GON_MAR_03',
    v_puncture_record_id,
    'mature',
    true,
    'T-23',
    'A',
    '24'
  )
  RETURNING id INTO v_oocyte_3_id;

  -- Oocito 4: MI Inmaduro → Descartado
  INSERT INTO oocytes (
    unique_identifier,
    puncture_id,
    current_state,
    is_cryopreserved,
    cryo_tank,
    cryo_rack,
    cryo_tube,
    discard_cause,
    discard_date_time
  )
  VALUES (
    'ovo_20250930_GON_MAR_04',
    v_puncture_record_id,
    'immature',
    false,
    NULL,
    NULL,
    NULL,
    'Oocito inmaduro MI - no apto para fertilización',
    '2025-09-30 14:00:00'
  )
  RETURNING id INTO v_oocyte_4_id;

  -- Oocito 5: GV Inmaduro → Descartado
  INSERT INTO oocytes (
    unique_identifier,
    puncture_id,
    current_state,
    is_cryopreserved,
    cryo_tank,
    cryo_rack,
    cryo_tube,
    discard_cause,
    discard_date_time
  )
  VALUES (
    'ovo_20250930_GON_MAR_05',
    v_puncture_record_id,
    'immature',
    false,
    NULL,
    NULL,
    NULL,
    'Oocito inmaduro GV - no apto para fertilización',
    '2025-09-30 14:00:00'
  )
  RETURNING id INTO v_oocyte_5_id;

  -- ============================================
  -- HISTORIAL DE ESTADOS DE OOCITOS
  -- ============================================
	-- MEJORAR ESTA PARTE

  INSERT INTO oocyte_state_history (oocyte_id, previous_state, new_state, transition_date)
  VALUES
    (v_oocyte_1_id, NULL, 'very_immature', '2025-09-30 08:30:00'),
    (v_oocyte_1_id, 'very_immature', 'mature', '2025-09-30 14:00:00');

  INSERT INTO oocyte_state_history (oocyte_id, previous_state, new_state, transition_date)
  VALUES
    (v_oocyte_2_id, NULL, 'immature', '2025-09-30 08:30:00'),
    (v_oocyte_2_id, 'mature', 'mature', '2025-09-30 14:00:00');

  INSERT INTO oocyte_state_history (oocyte_id, previous_state, new_state, transition_date)
  VALUES
    (v_oocyte_3_id, NULL, 'mature', '2025-09-30 08:30:00');

  -- ============================================
  -- EMBRIONES
  -- ============================================

  -- Embrión 1: Calidad 4AA, Euploide, Criopreservado
  INSERT INTO embryos (
    unique_identifier,
    oocyte_origin_id,
    fertilization_date,
    fertilization_technique,
    technician_id,
    quality_score,
    semen_source,
    pgt_result,
    final_disposition,
    cryo_tank,
    cryo_rack,
    cryo_tube
  )
  VALUES (
    'emb_20250930_GON_MAR_01',
    v_oocyte_1_id,
    '2025-09-30',
    'ICSI',
    v_lab_tech_id,
    6,  -- Calidad máxima (4AA = 6)
    'own',
    'ok',
    'cryopreserved',
    'T-23',
    'B',
    '12'
  )
  RETURNING id INTO v_embryo_1_id;

  -- Embrión 2: Calidad 5AA, Euploide, Criopreservado
  INSERT INTO embryos (
    unique_identifier,
    oocyte_origin_id,
    fertilization_date,
    fertilization_technique,
    technician_id,
    quality_score,
    semen_source,
    pgt_result,
    final_disposition,
    cryo_tank,
    cryo_rack,
    cryo_tube
  )
  VALUES (
    'emb_20250930_GON_MAR_02',
    v_oocyte_2_id,
    '2025-09-30',
    'ICSI',
    v_lab_tech_id,
    6,  -- Calidad máxima (5AA = 6)
    'own',
    'ok',
    'cryopreserved',
    'T-23',
    'B',
    '13'
  )
  RETURNING id INTO v_embryo_2_id;

  RAISE NOTICE 'Datos médicos creados exitosamente para María González';
  RAISE NOTICE 'Patient ID: %, Medical History ID: %, Treatment ID: %', v_patient_id, v_medical_history_id, v_treatment_id;
  RAISE NOTICE 'Puncture Record ID: %, Oocytes: 5, Embryos: 2', v_puncture_record_id;
  RAISE NOTICE 'Nuevas entidades agregadas: Habits, Fenotypes, Backgrounds, InformedConsent, MedicalCoverage, PostTransferMilestones, StudyResults, Laboratory (Puncture, Oocytes, Embryos)';
END $$;

