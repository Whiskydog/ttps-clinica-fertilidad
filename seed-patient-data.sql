-- ========================================
-- SEED DE DATOS MÉDICOS PARA PACIENTE
-- ========================================
-- Este script crea datos médicos de prueba para María González (DNI 35123456)
-- Incluye: historia clínica, tratamiento, órdenes médicas, monitoreos y productos criopreservados
--
-- PREREQUISITO: Ejecutar primero seed-users-data.sql
-- ========================================

-- ============================================================
-- PASO 1: CREAR HISTORIA CLÍNICA Y TRATAMIENTO
-- ============================================================

-- Variables para almacenar IDs (usar DO block)
DO $$
DECLARE
  v_patient_id INTEGER;
  v_doctor_id INTEGER;
  v_medical_history_id INTEGER;
  v_treatment_id INTEGER;
BEGIN
  -- Obtener ID del paciente María González
  SELECT id INTO v_patient_id FROM users WHERE dni = '35123456' AND role = 'patient';

  -- Obtener ID del primer doctor (Juan Carlos Pérez)
  SELECT id INTO v_doctor_id FROM users WHERE email = 'jperez@clinica.com' AND role = 'doctor';

  -- Crear historia clínica
  INSERT INTO medical_histories (patient_id, creation_date, physical_exam_notes, family_backgrounds)
  VALUES (
    v_patient_id,
    '2025-09-01',
    'Peso: 65kg, Altura: 165cm. Presión arterial: 120/80. Examen físico normal.',
    'Madre: hipertensión. Padre: diabetes tipo 2.'
  )
  RETURNING id INTO v_medical_history_id;

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

  -- Datos de la pareja
  INSERT INTO partner_data (
    medical_history_id,
    first_name,
    last_name,
    dni,
    birth_date,
    biological_sex
  )
  VALUES (
    v_medical_history_id,
    'Pedro',
    'González',
    '33456789',
    '1988-03-20',
    'male'
  );

  -- Datos ginecológicos
  INSERT INTO gynecological_history (
    medical_history_id,
    menarche_age,
    cycle_regularity,
    cycle_duration_days,
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
    1,  -- Gestaciones
    0,  -- Partos
    1,  -- Abortos
    0  -- Ectópicos
  );

  -- ============================================================
  -- PASO 2: ÓRDENES MÉDICAS
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

  -- Orden 3: Estudios ginecológicos (COMPLETADA)
  INSERT INTO medical_orders (
    code, issue_date, status, category, description,
    studies, diagnosis, justification,
    completed_date, results,
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
    'Útero y ovarios sin alteraciones. PAP negativo. Reserva ovárica adecuada. Conteo de folículos antrales: 12.',
    v_patient_id,
    v_doctor_id,
    v_treatment_id
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
    (v_treatment_id, v_doctor_id, '2025-09-16', 'Paciente con buena reserva ovárica según ecografía basal. Iniciamos protocolo antagonista estándar con Gonal-F 150 UI/día. Consentimientos firmados.'),
    (v_treatment_id, v_doctor_id, '2025-09-20', 'Primer monitoreo día 4: Excelente respuesta inicial con 8 folículos en crecimiento. Niveles de estradiol adecuados. Mantener dosis actual.'),
    (v_treatment_id, v_doctor_id, '2025-09-23', 'Segundo monitoreo día 7: Continúa buena respuesta. Agregamos Cetrotide 0.25mg según protocolo para evitar pico de LH prematuro.'),
    (v_treatment_id, v_doctor_id, '2025-09-26', 'Tercer monitoreo día 10: Folículos dominantes con tamaño óptimo (17-19mm). Trigger programado para 28/09 a las 22:00hs. Punción el 30/09 a las 08:00hs.');

  -- ============================================================
  -- PASO 6: PRODUCTOS CRIOPRESERVADOS
  -- ============================================================

  -- Óvulos de ciclo anterior
  INSERT INTO cryopreserved_products (
    product_id, product_type, status, cryopreservation_date,
    location_tank, location_rack, location_tube, location_position,
    maturation_state, extraction_date,
    patient_id, treatment_id
  )
  VALUES
    ('OVO_20240315_GON_MAR_01', 'ovule', 'Criopreservado', '2024-03-15',
     'T-23', 'A', '23', '1',
     'MII (Maduro)', '2024-03-15',
     v_patient_id, v_treatment_id),
    ('OVO_20240315_GON_MAR_02', 'ovule', 'Criopreservado', '2024-03-15',
     'T-23', 'A', '23', '2',
     'MII (Maduro)', '2024-03-15',
     v_patient_id, v_treatment_id);

  -- Embriones del ciclo actual
  INSERT INTO cryopreserved_products (
    product_id, product_type, status, cryopreservation_date,
    location_tank, location_rack, location_tube, location_position,
    quality, fertilization_date, pgt_result,
    journey,
    patient_id, treatment_id
  )
  VALUES
    ('EMB_20250930_GON_MAR_01', 'embryo', 'Criopreservado', '2025-10-05',
     'T-23', 'B', '12', '3',
     '4AA', '2025-09-30', 'Euploide (46,XX)',
     '[
       {"date": "2025-09-30", "time": "08:30", "phase": "Óvulo extraído", "status": "completed"},
       {"date": "2025-09-30", "time": "11:00", "phase": "Estado: MII (Maduro)", "status": "completed"},
       {"date": "2025-09-30", "time": "14:00", "phase": "Fertilización ICSI", "status": "completed"},
       {"date": "2025-10-01", "time": "09:00", "phase": "Día 1: 2 pronúcleos", "status": "completed"},
       {"date": "2025-10-02", "time": "09:00", "phase": "Día 2: 4 células", "status": "completed"},
       {"date": "2025-10-03", "time": "09:00", "phase": "Día 3: 8 células", "status": "completed"},
       {"date": "2025-10-05", "time": "09:00", "phase": "Día 5: Blastocisto 4AA", "status": "completed"},
       {"date": "2025-10-05", "time": "14:00", "phase": "Biopsia para PGT-A", "status": "completed"},
       {"date": "2025-10-05", "time": "16:00", "phase": "Vitrificado", "status": "completed"}
     ]'::jsonb,
     v_patient_id, v_treatment_id),
    ('EMB_20250930_GON_MAR_02', 'embryo', 'Criopreservado', '2025-10-05',
     'T-23', 'B', '12', '4',
     '5AA', '2025-09-30', 'Euploide (46,XX)',
     '[
       {"date": "2025-09-30", "time": "08:30", "phase": "Óvulo extraído", "status": "completed"},
       {"date": "2025-09-30", "time": "11:00", "phase": "Estado: MII (Maduro)", "status": "completed"},
       {"date": "2025-09-30", "time": "14:00", "phase": "Fertilización ICSI", "status": "completed"},
       {"date": "2025-10-01", "time": "09:00", "phase": "Día 1: 2 pronúcleos", "status": "completed"},
       {"date": "2025-10-02", "time": "09:00", "phase": "Día 2: 4 células", "status": "completed"},
       {"date": "2025-10-03", "time": "09:00", "phase": "Día 3: 8 células", "status": "completed"},
       {"date": "2025-10-05", "time": "09:00", "phase": "Día 5: Blastocisto expandido 5AA", "status": "completed"},
       {"date": "2025-10-05", "time": "14:00", "phase": "Biopsia para PGT-A", "status": "completed"},
       {"date": "2025-10-05", "time": "16:00", "phase": "Vitrificado", "status": "completed"}
     ]'::jsonb,
     v_patient_id, v_treatment_id);

  RAISE NOTICE 'Datos médicos creados exitosamente para María González';
  RAISE NOTICE 'Patient ID: %, Medical History ID: %, Treatment ID: %', v_patient_id, v_medical_history_id, v_treatment_id;
END $$;


-- ============================================================
-- QUERIES DE VERIFICACIÓN
-- ============================================================

-- Ver paciente con historia clínica
SELECT
  u.id,
  u.first_name || ' ' || u.last_name as nombre_paciente,
  u.dni,
  mh.id as historia_id,
  mh.creation_date
FROM users u
LEFT JOIN medical_histories mh ON mh.patient_id = u.id
WHERE u.dni = '35123456';

-- Ver tratamiento
SELECT
  t.id as tratamiento_id,
  t.initial_objective,
  t.start_date,
  t.status,
  d.first_name || ' ' || d.last_name as doctor
FROM treatments t
LEFT JOIN users d ON t.initial_doctor_id = d.id
WHERE t.medical_history_id IN (
  SELECT id FROM medical_histories WHERE patient_id = (
    SELECT id FROM users WHERE dni = '35123456'
  )
);

-- Ver órdenes médicas
SELECT
  code,
  issue_date,
  status,
  category,
  description
FROM medical_orders
WHERE patient_id = (SELECT id FROM users WHERE dni = '35123456')
ORDER BY issue_date DESC;

-- Ver monitoreos
SELECT
  monitoring_date,
  day_number,
  follicle_count,
  follicle_size,
  estradiol_level,
  observations
FROM treatment_monitorings
WHERE treatment_id IN (
  SELECT id FROM treatments WHERE medical_history_id IN (
    SELECT id FROM medical_histories WHERE patient_id = (
      SELECT id FROM users WHERE dni = '35123456'
    )
  )
)
ORDER BY monitoring_date;

-- Ver protocolo de medicación
SELECT
  protocol_type,
  drug_name,
  dose,
  administration_route,
  start_date,
  additional_medication
FROM medication_protocols
WHERE treatment_id IN (
  SELECT id FROM treatments WHERE medical_history_id IN (
    SELECT id FROM medical_histories WHERE patient_id = (
      SELECT id FROM users WHERE dni = '35123456'
    )
  )
);

-- Ver productos criopreservados
SELECT
  product_id,
  product_type,
  status,
  quality,
  cryopreservation_date,
  location_tank || '-' || location_rack || '-' || location_tube || '-' || location_position as ubicacion
FROM cryopreserved_products
WHERE patient_id = (SELECT id FROM users WHERE dni = '35123456')
ORDER BY cryopreservation_date DESC;

-- Ver notas del médico
SELECT
  note_date,
  d.first_name || ' ' || d.last_name as doctor,
  note
FROM doctor_notes dn
LEFT JOIN users d ON dn.doctor_id = d.id
WHERE treatment_id IN (
  SELECT id FROM treatments WHERE medical_history_id IN (
    SELECT id FROM medical_histories WHERE patient_id = (
      SELECT id FROM users WHERE dni = '35123456'
    )
  )
)
ORDER BY note_date;

-- Resumen completo
SELECT
  'Paciente' as tipo,
  u.first_name || ' ' || u.last_name as detalle,
  u.dni as info
FROM users u WHERE u.dni = '35123456'
UNION ALL
SELECT
  'Tratamiento' as tipo,
  t.initial_objective::text as detalle,
  t.status::text as info
FROM treatments t
WHERE t.medical_history_id IN (
  SELECT id FROM medical_histories WHERE patient_id = (SELECT id FROM users WHERE dni = '35123456')
)
UNION ALL
SELECT
  'Órdenes Médicas' as tipo,
  COUNT(*)::text as detalle,
  COUNT(*) FILTER (WHERE status = 'pending')::text || ' pendientes' as info
FROM medical_orders
WHERE patient_id = (SELECT id FROM users WHERE dni = '35123456')
UNION ALL
SELECT
  'Monitoreos' as tipo,
  COUNT(*)::text as detalle,
  'Último: ' || COALESCE(MAX(monitoring_date)::text, 'N/A') as info
FROM treatment_monitorings tm
WHERE tm.treatment_id IN (
  SELECT id FROM treatments WHERE medical_history_id IN (
    SELECT id FROM medical_histories WHERE patient_id = (SELECT id FROM users WHERE dni = '35123456')
  )
)
UNION ALL
SELECT
  'Productos Criopreservados' as tipo,
  COUNT(*)::text || ' total' as detalle,
  COUNT(*) FILTER (WHERE product_type = 'embryo')::text || ' embriones, ' ||
  COUNT(*) FILTER (WHERE product_type = 'ovule')::text || ' óvulos' as info
FROM cryopreserved_products
WHERE patient_id = (SELECT id FROM users WHERE dni = '35123456');
