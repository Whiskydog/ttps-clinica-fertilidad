-- ========================================
-- SEED DE USUARIOS DE PRUEBA
-- ========================================
-- Este script crea usuarios de prueba para todos los roles del sistema
-- Password para todos: "Test123456"
-- Hash generado con argon2: $argon2id$v=19$m=65536,t=3,p=4$randomsalt$hashedpassword
-- ========================================

-- ============================================================
-- PASO 1: VERIFICAR Y CREAR ROLES (SI NO EXISTEN)
-- ============================================================

-- Verificar roles existentes
SELECT * FROM roles ORDER BY code;

-- Insertar roles si no existen (ejecutar solo si la tabla está vacía)
INSERT INTO roles (code, name, description) VALUES
  ('admin', 'Administrador', 'admin'),
  ('doctor', 'Médico', 'doctor'),
  ('director', 'Director Médico', 'director'),
  ('lab_technician', 'Técnico de Laboratorio', 'lab_technician'),
  ('patient', 'Paciente', 'patient')
ON CONFLICT (code) DO NOTHING;


-- ============================================================
-- PASO 2: CREAR OBRAS SOCIALES (SI NO EXISTEN)
-- ============================================================

INSERT INTO medical_insurances (name) VALUES
  ('Swiss Medical'),
  ('OSDE'),
  ('Galeno'),
  ('Medicus'),
  ('Omint'),
  ('Particular')
ON CONFLICT (name) DO NOTHING;

-- Obtener IDs de obras sociales para usar después
SELECT id, name FROM medical_insurances;


-- ============================================================
-- PASO 3: CREAR MÉDICOS (ROLE: DOCTOR)
-- ============================================================
-- Login con email | Password: Test123456

INSERT INTO users (
  first_name, last_name, email, phone, password_hash,
  is_active, role, specialty, license_number
) VALUES
  (
    'Juan Carlos', 'Pérez Gómez', 'jperez@clinica.com', '+541155551001',
    '$argon2id$v=19$m=65536,t=3,p=4$kQwzT4U50XUQwG8wIw0gjQ$sZ70cF0LEw2T/KS+Nj7NGTRVb2gNT/6B+x3C/MRmZDc',
    true, 'doctor', 'Medicina Reproductiva', 'MN 45678'
  ),
  (
    'María Laura', 'Fernández', 'mfernandez@clinica.com', '+541155551002',
    '$argon2id$v=19$m=65536,t=3,p=4$kQwzT4U50XUQwG8wIw0gjQ$sZ70cF0LEw2T/KS+Nj7NGTRVb2gNT/6B+x3C/MRmZDc',
    true, 'doctor', 'Ginecología', 'MN 56789'
  ),
  (
    'Roberto', 'Sánchez', 'rsanchez@clinica.com', '+541155551003',
    '$argon2id$v=19$m=65536,t=3,p=4$kQwzT4U50XUQwG8wIw0gjQ$sZ70cF0LEw2T/KS+Nj7NGTRVb2gNT/6B+x3C/MRmZDc',
    true, 'doctor', 'Endocrinología Reproductiva', 'MN 67890'
  ),
  (
    'Carolina', 'Rodríguez', 'crodriguez@clinica.com', '+541155551004',
    '$argon2id$v=19$m=65536,t=3,p=4$kQwzT4U50XUQwG8wIw0gjQ$sZ70cF0LEw2T/KS+Nj7NGTRVb2gNT/6B+x3C/MRmZDc',
    true, 'doctor', 'Medicina Reproductiva', 'MN 78901'
  );


-- ============================================================
-- PASO 4: CREAR DIRECTORES MÉDICOS (ROLE: DIRECTOR)
-- ============================================================
-- Login con email | Password: Test123456

INSERT INTO users (
  first_name, last_name, email, phone, password_hash,
  is_active, role, license_number
) VALUES
  (
    'Alberto', 'Martínez', 'amartinez@clinica.com', '+541155552001',
    '$argon2id$v=19$m=65536,t=3,p=4$kQwzT4U50XUQwG8wIw0gjQ$sZ70cF0LEw2T/KS+Nj7NGTRVb2gNT/6B+x3C/MRmZDc',
    true, 'director', 'MN 34567'
  ),
  (
    'Silvia', 'López', 'slopez@clinica.com', '+541155552002',
    '$argon2id$v=19$m=65536,t=3,p=4$kQwzT4U50XUQwG8wIw0gjQ$sZ70cF0LEw2T/KS+Nj7NGTRVb2gNT/6B+x3C/MRmZDc',
    true, 'director', 'MN 23456'
  );


-- ============================================================
-- PASO 5: CREAR TÉCNICOS DE LABORATORIO (ROLE: LAB_TECHNICIAN)
-- ============================================================
-- Login con email | Password: Test123456

INSERT INTO users (
  first_name, last_name, email, phone, password_hash,
  is_active, role, lab_area
) VALUES
  (
    'Patricia', 'González', 'pgonzalez@clinica.com', '+541155553001',
    '$argon2id$v=19$m=65536,t=3,p=4$kQwzT4U50XUQwG8wIw0gjQ$sZ70cF0LEw2T/KS+Nj7NGTRVb2gNT/6B+x3C/MRmZDc',
    true, 'lab_technician', 'Embriología'
  ),
  (
    'Diego', 'Torres', 'dtorres@clinica.com', '+541155553002',
    '$argon2id$v=19$m=65536,t=3,p=4$kQwzT4U50XUQwG8wIw0gjQ$sZ70cF0LEw2T/KS+Nj7NGTRVb2gNT/6B+x3C/MRmZDc',
    true, 'lab_technician', 'Andrología'
  ),
  (
    'Lucía', 'Ramírez', 'lramirez@clinica.com', '+541155553003',
    '$argon2id$v=19$m=65536,t=3,p=4$kQwzT4U50XUQwG8wIw0gjQ$sZ70cF0LEw2T/KS+Nj7NGTRVb2gNT/6B+x3C/MRmZDc',
    true, 'lab_technician', 'Criopreservación'
  );


-- ============================================================
-- PASO 6: CREAR PACIENTES (ROLE: PATIENT)
-- ============================================================
-- Login con DNI | Password: Test123456
-- IMPORTANTE: Primero obtener IDs de obras sociales

-- Ver IDs de obras sociales disponibles
SELECT id, name FROM medical_insurances;

-- REEMPLAZAR <INSURANCE_ID_X> con los IDs correspondientes

-- Paciente 1: María González 
INSERT INTO users (
  first_name, last_name, dni, email, phone, password_hash,
  date_of_birth, biological_sex, address, occupation,
  is_active, role, coverage_member_id, medical_insurance_id
) VALUES
  (
    'María', 'González', '35123456', 'maria.gonzalez@email.com', '+541155551001',
    '$argon2id$v=19$m=65536,t=3,p=4$kQwzT4U50XUQwG8wIw0gjQ$sZ70cF0LEw2T/KS+Nj7NGTRVb2gNT/6B+x3C/MRmZDc',
    '1985-08-25', 'female', 'Av. Córdoba 1234, CABA', 'Contadora',
    true, 'patient', '1234-5678-90', 1 -- OSDE
  );

-- Paciente 2: Laura Martínez
INSERT INTO users (
  first_name, last_name, dni, email, phone, password_hash,
  date_of_birth, biological_sex, address, occupation,
  is_active, role, coverage_member_id, medical_insurance_id
) VALUES
  (
    'Laura', 'Martínez', '34567890', 'laura.martinez@email.com', '+541155554001',
    '$argon2id$v=19$m=65536,t=3,p=4$kQwzT4U50XUQwG8wIw0gjQ$sZ70cF0LEw2T/KS+Nj7NGTRVb2gNT/6B+x3C/MRmZDc',
    '1989-05-15', 'female', 'Av. Córdoba 2500, CABA', 'Contadora',
    true, 'patient', '1234-5678-90', 2 -- OSDE
  );

-- Paciente 3: Ana García
INSERT INTO users (
  first_name, last_name, dni, email, phone, password_hash,
  date_of_birth, biological_sex, address, occupation,
  is_active, role, coverage_member_id, medical_insurance_id
) VALUES
  (
    'Ana', 'García', '33456789', 'ana.garcia@email.com', '+541155554002',
    '$argon2id$v=19$m=65536,t=3,p=4$kQwzT4U50XUQwG8wIw0gjQ$sZ70cF0LEw2T/KS+Nj7NGTRVb2gNT/6B+x3C/MRmZDc',
    '1987-08-22', 'female', 'Calle 50 N° 1234, La Plata', 'Docente',
    true, 'patient', '9876-5432-10', 1 -- Swiss Medical
  );

-- Paciente 4: Sofía Rodríguez
INSERT INTO users (
  first_name, last_name, dni, email, phone, password_hash,
  date_of_birth, biological_sex, address, occupation,
  is_active, role, coverage_member_id, medical_insurance_id
) VALUES
  (
    'Sofía', 'Rodríguez', '36789012', 'sofia.rodriguez@email.com', '+541155554003',
    '$argon2id$v=19$m=65536,t=3,p=4$kQwzT4U50XUQwG8wIw0gjQ$sZ70cF0LEw2T/KS+Nj7NGTRVb2gNT/6B+x3C/MRmZDc',
    '1991-03-10', 'female', 'Av. Santa Fe 3500, CABA', 'Diseñadora',
    true, 'patient', '5555-6666-77', 3 -- Galeno
  );

-- Paciente 5: Valeria López
INSERT INTO users (
  first_name, last_name, dni, email, phone, password_hash,
  date_of_birth, biological_sex, address, occupation,
  is_active, role, coverage_member_id, medical_insurance_id
) VALUES
  (
    'Valeria', 'López', '37890123', 'valeria.lopez@email.com', '+541155554004',
    '$argon2id$v=19$m=65536,t=3,p=4$kQwzT4U50XUQwG8wIw0gjQ$sZ70cF0LEw2T/KS+Nj7NGTRVb2gNT/6B+x3C/MRmZDc',
    '1992-11-30', 'female', 'Av. Rivadavia 5000, CABA', 'Abogada',
    true, 'patient', '2222-3333-44', 4 -- Medicus
  );

-- Paciente 6: Carolina Fernández
INSERT INTO users (
  first_name, last_name, dni, email, phone, password_hash,
  date_of_birth, biological_sex, address, occupation,
  is_active, role, coverage_member_id, medical_insurance_id
) VALUES
  (
    'Carolina', 'Fernández', '38901234', 'carolina.fernandez@email.com', '+541155554005',
    '$argon2id$v=19$m=65536,t=3,p=4$kQwzT4U50XUQwG8wIw0gjQ$sZ70cF0LEw2T/KS+Nj7NGTRVb2gNT/6B+x3C/MRmZDc',
    '1993-07-18', 'female', 'Calle 7 N° 890, La Plata', 'Ingeniera',
    true, 'patient', '8888-9999-00', 5 -- Omint
  );

-- Paciente 7: Gabriela Sánchez (sin obra social)
INSERT INTO users (
  first_name, last_name, dni, email, phone, password_hash,
  date_of_birth, biological_sex, address, occupation,
  is_active, role, coverage_member_id, medical_insurance_id
) VALUES
  (
    'Gabriela', 'Sánchez', '39012345', 'gabriela.sanchez@email.com', '+541155554006',
    '$argon2id$v=19$m=65536,t=3,p=4$kQwzT4U50XUQwG8wIw0gjQ$sZ70cF0LEw2T/KS+Nj7NGTRVb2gNT/6B+x3C/MRmZDc',
    '1994-02-25', 'female', 'Av. Callao 1500, CABA', 'Arquitecta',
    true, 'patient', NULL, 6 -- Particular
  );


-- ============================================================
-- QUERIES DE VERIFICACIÓN
-- ============================================================

-- Ver todos los médicos creados
SELECT id, first_name, last_name, email, specialty, license_number
FROM users
WHERE role = 'doctor'
ORDER BY last_name;

-- Ver todos los directores creados
SELECT id, first_name, last_name, email, license_number
FROM users
WHERE role = 'director'
ORDER BY last_name;

-- Ver todos los técnicos creados
SELECT id, first_name, last_name, email, lab_area
FROM users
WHERE role = 'lab_technician'
ORDER BY last_name;

-- Ver todos los pacientes creados
SELECT id, first_name, last_name, dni, email, date_of_birth
FROM users
WHERE role = 'patient'
ORDER BY last_name;

-- Ver resumen de usuarios por rol
SELECT role, COUNT(*) as cantidad
FROM users
GROUP BY role
ORDER BY role;

-- Ver pacientes con sus obras sociales
SELECT
  u.id,
  u.first_name || ' ' || u.last_name as nombre_completo,
  u.dni,
  u.email,
  mi.name as obra_social,
  u.coverage_member_id as nro_afiliado
FROM users u
LEFT JOIN medical_insurances mi ON u.medical_insurance_id = mi.id
WHERE u.role = 'patient'
ORDER BY u.last_name;


-- ============================================================
-- INFORMACIÓN DE LOGIN
-- ============================================================
/*
MÉDICOS (Login con email):
- jperez@clinica.com        | Test123456 | Dr. Juan Carlos Pérez Gómez
- mfernandez@clinica.com    | Test123456 | Dra. María Laura Fernández
- rsanchez@clinica.com      | Test123456 | Dr. Roberto Sánchez
- crodriguez@clinica.com    | Test123456 | Dra. Carolina Rodríguez

DIRECTORES (Login con email):
- amartinez@clinica.com     | Test123456 | Dr. Alberto Martínez
- slopez@clinica.com        | Test123456 | Dra. Silvia López

TÉCNICOS (Login con email):
- pgonzalez@clinica.com     | Test123456 | Patricia González (Embriología)
- dtorres@clinica.com       | Test123456 | Diego Torres (Andrología)
- lramirez@clinica.com      | Test123456 | Lucía Ramírez (Criopreservación)

PACIENTES (Login con DNI):
- 35123456 | Test123456 | María González (del script anterior)
- 34567890 | Test123456 | Laura Martínez
- 33456789 | Test123456 | Ana García
- 36789012 | Test123456 | Sofía Rodríguez
- 37890123 | Test123456 | Valeria López
- 38901234 | Test123456 | Carolina Fernández
- 39012345 | Test123456 | Gabriela Sánchez

NOTA: El password "Test123456" está hasheado con argon2.
Para generar un hash real, usar en el backend:
await argon2.hash("Test123456")
*/
