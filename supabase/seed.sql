-- ============================================
-- WISESPEND - DATOS INICIALES NOVIEMBRE 2025
-- Usuario: Norman (norman@wisespend.app)
-- ============================================

-- IMPORTANTE: Reemplaza 'USER_ID_AQUI' con el UUID del usuario Norman
-- UUID de Norman: d62321fa-5564-4168-ab0f-785f56af7e28

-- ============================================
-- 1. PERFIL DE USUARIO
-- ============================================
INSERT INTO users_profile (user_id, nombre_completo, email)
VALUES 
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Norman Osses', 'norman@wisespend.app');

-- ============================================
-- 2. FUENTES DE INGRESO - NOVIEMBRE 2025
-- ============================================
INSERT INTO income_sources (user_id, fuente, monto, porcentaje, activo, periodo_mes, periodo_anio)
VALUES 
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Norman', 1270000.00, 50.2, true, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Claudia', 1250000.00, 49.4, true, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Celular Sra Edith', 12000.00, 0.5, true, 11, 2025);

-- ============================================
-- 3. GASTOS FIJOS - NOVIEMBRE 2025
-- ============================================
INSERT INTO fixed_expenses (user_id, categoria, monto, activo, pagado, periodo_mes, periodo_anio)
VALUES 
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Crédito 46/48', 277495.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Internet Casa', 16418.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Remedios Claudia', 18154.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Agua', 33300.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Luz', 71300.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Teléfono Norman', 8792.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Teléfono Sra Edith (Wom)', 12578.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Teléfono Claudia', 34574.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Internet Traiguén', 14990.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Ballet', 7000.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Bencina Sta Fe', 80000.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Bencina R Clio', 50000.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Gas', 37894.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Cañones y Para fina', 17500.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Semana Casa', 120000.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Baño', 60000.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Remedios Norman', 17500.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Badmintón Tania', 35000.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Cuota Badmintón', 5000.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Leche Camilo', 22926.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Leche Violeta', 19980.00, true, false, 11, 2025);

-- ============================================
-- 4. GASTOS VARIABLES - NOVIEMBRE 2025
-- ============================================
INSERT INTO variable_expenses (user_id, categoria, monto, activo, pagado, periodo_mes, periodo_anio)
VALUES 
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Ripley', 450000.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Falabella', 60931.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Visa BCI', 366570.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Pensionistas', 35500.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Cuotas', 14000.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Gasto Reservado', 400000.00, true, false, 11, 2025),
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 'Gastos Extras', 220000.00, true, false, 11, 2025);

-- ============================================
-- 5. GASTOS EXTRAS - NOVIEMBRE 2025
-- Por ahora sin gastos extras registrados
-- ============================================
-- (Vacío porque en la imagen dice "No hay gastos extras registrados")

-- ============================================
-- 6. CONFIGURACIÓN DE PRESUPUESTO - NOVIEMBRE 2025
-- ============================================
INSERT INTO budget_config (user_id, porcentaje_extras, moneda, auto_guardado, intervalo_guardado, mostrar_notificaciones, tema, periodo_mes, periodo_anio)
VALUES 
    ('d62321fa-5564-4168-ab0f-785f56af7e28', 18.1, 'CLP', true, 300000, true, 'claro', 11, 2025);

-- ============================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ============================================

-- Ver ingresos de Noviembre 2025
SELECT fuente, monto, porcentaje 
FROM income_sources 
WHERE user_id = 'd62321fa-5564-4168-ab0f-785f56af7e28' 
  AND periodo_mes = 11 
  AND periodo_anio = 2025
ORDER BY monto DESC;

-- Ver gastos fijos de Noviembre 2025
SELECT categoria, monto, pagado 
FROM fixed_expenses 
WHERE user_id = 'd62321fa-5564-4168-ab0f-785f56af7e28' 
  AND periodo_mes = 11 
  AND periodo_anio = 2025
ORDER BY monto DESC;

-- Ver gastos variables de Noviembre 2025
SELECT categoria, monto, pagado 
FROM variable_expenses 
WHERE user_id = 'd62321fa-5564-4168-ab0f-785f56af7e28' 
  AND periodo_mes = 11 
  AND periodo_anio = 2025
ORDER BY monto DESC;

-- Totales del mes
SELECT 
    'Ingresos' as tipo,
    SUM(monto) as total
FROM income_sources 
WHERE user_id = 'd62321fa-5564-4168-ab0f-785f56af7e28' 
  AND periodo_mes = 11 
  AND periodo_anio = 2025

UNION ALL

SELECT 
    'Gastos Fijos' as tipo,
    SUM(monto) as total
FROM fixed_expenses 
WHERE user_id = 'd62321fa-5564-4168-ab0f-785f56af7e28' 
  AND periodo_mes = 11 
  AND periodo_anio = 2025

UNION ALL

SELECT 
    'Gastos Variables' as tipo,
    SUM(monto) as total
FROM variable_expenses 
WHERE user_id = 'd62321fa-5564-4168-ab0f-785f56af7e28' 
  AND periodo_mes = 11 
  AND periodo_anio = 2025;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
