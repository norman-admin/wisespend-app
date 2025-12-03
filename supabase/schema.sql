-- ============================================
-- WISESPEND - ESQUEMA DE BASE DE DATOS
-- Sistema de Control de Gastos Familiares
-- Con soporte multi-usuario y períodos mensuales
-- ============================================

-- ============================================
-- 1. TABLA: users_profile
-- Perfil extendido del usuario
-- ============================================
CREATE TABLE users_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Índice para búsquedas rápidas por user_id
CREATE INDEX idx_users_profile_user_id ON users_profile(user_id);

-- ============================================
-- 2. TABLA: income_sources
-- Fuentes de ingreso mensuales
-- ============================================
CREATE TABLE income_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fuente TEXT NOT NULL,
    monto DECIMAL(12,2) NOT NULL DEFAULT 0,
    porcentaje DECIMAL(5,2) DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    periodo_mes INTEGER NOT NULL CHECK (periodo_mes >= 1 AND periodo_mes <= 12),
    periodo_anio INTEGER NOT NULL CHECK (periodo_anio >= 2020),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas por usuario y período
CREATE INDEX idx_income_user_id ON income_sources(user_id);
CREATE INDEX idx_income_periodo ON income_sources(user_id, periodo_anio, periodo_mes);

-- ============================================
-- 3. TABLA: fixed_expenses
-- Gastos fijos mensuales
-- ============================================
CREATE TABLE fixed_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    categoria TEXT NOT NULL,
    monto DECIMAL(12,2) NOT NULL DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    pagado BOOLEAN DEFAULT false,
    periodo_mes INTEGER NOT NULL CHECK (periodo_mes >= 1 AND periodo_mes <= 12),
    periodo_anio INTEGER NOT NULL CHECK (periodo_anio >= 2020),
    fecha_pago DATE,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas por usuario y período
CREATE INDEX idx_fixed_expenses_user_id ON fixed_expenses(user_id);
CREATE INDEX idx_fixed_expenses_periodo ON fixed_expenses(user_id, periodo_anio, periodo_mes);
CREATE INDEX idx_fixed_expenses_pagado ON fixed_expenses(user_id, pagado);

-- ============================================
-- 4. TABLA: variable_expenses
-- Gastos variables mensuales
-- ============================================
CREATE TABLE variable_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    categoria TEXT NOT NULL,
    monto DECIMAL(12,2) NOT NULL DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    pagado BOOLEAN DEFAULT false,
    periodo_mes INTEGER NOT NULL CHECK (periodo_mes >= 1 AND periodo_mes <= 12),
    periodo_anio INTEGER NOT NULL CHECK (periodo_anio >= 2020),
    fecha_pago DATE,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas por usuario y período
CREATE INDEX idx_variable_expenses_user_id ON variable_expenses(user_id);
CREATE INDEX idx_variable_expenses_periodo ON variable_expenses(user_id, periodo_anio, periodo_mes);
CREATE INDEX idx_variable_expenses_pagado ON variable_expenses(user_id, pagado);

-- ============================================
-- 5. TABLA: extra_expenses
-- Gastos extras mensuales
-- ============================================
CREATE TABLE extra_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    categoria TEXT NOT NULL,
    monto DECIMAL(12,2) NOT NULL DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    pagado BOOLEAN DEFAULT false,
    periodo_mes INTEGER NOT NULL CHECK (periodo_mes >= 1 AND periodo_mes <= 12),
    periodo_anio INTEGER NOT NULL CHECK (periodo_anio >= 2020),
    fecha_pago DATE,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas por usuario y período
CREATE INDEX idx_extra_expenses_user_id ON extra_expenses(user_id);
CREATE INDEX idx_extra_expenses_periodo ON extra_expenses(user_id, periodo_anio, periodo_mes);
CREATE INDEX idx_extra_expenses_pagado ON extra_expenses(user_id, pagado);

-- ============================================
-- 6. TABLA: budget_config
-- Configuración de presupuesto por usuario y período
-- ============================================
CREATE TABLE budget_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    porcentaje_extras DECIMAL(5,2) DEFAULT 10.00,
    moneda TEXT DEFAULT 'CLP',
    auto_guardado BOOLEAN DEFAULT true,
    intervalo_guardado INTEGER DEFAULT 300000,
    mostrar_notificaciones BOOLEAN DEFAULT true,
    tema TEXT DEFAULT 'claro',
    periodo_mes INTEGER NOT NULL CHECK (periodo_mes >= 1 AND periodo_mes <= 12),
    periodo_anio INTEGER NOT NULL CHECK (periodo_anio >= 2020),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, periodo_anio, periodo_mes)
);

-- Índices para búsquedas por usuario y período
CREATE INDEX idx_budget_config_user_id ON budget_config(user_id);
CREATE INDEX idx_budget_config_periodo ON budget_config(user_id, periodo_anio, periodo_mes);

-- ============================================
-- 7. TABLA: payment_reminders
-- Recordatorios de pago
-- ============================================
CREATE TABLE payment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha_recordatorio DATE NOT NULL,
    categoria TEXT,
    monto DECIMAL(12,2),
    completado BOOLEAN DEFAULT false,
    periodo_mes INTEGER NOT NULL CHECK (periodo_mes >= 1 AND periodo_mes <= 12),
    periodo_anio INTEGER NOT NULL CHECK (periodo_anio >= 2020),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas por usuario, fecha y período
CREATE INDEX idx_reminders_user_id ON payment_reminders(user_id);
CREATE INDEX idx_reminders_fecha ON payment_reminders(user_id, fecha_recordatorio);
CREATE INDEX idx_reminders_periodo ON payment_reminders(user_id, periodo_anio, periodo_mes);
CREATE INDEX idx_reminders_completado ON payment_reminders(user_id, completado);

-- ============================================
-- 8. TABLA: tasks_notes
-- Tareas y notas personales
-- ============================================
CREATE TABLE tasks_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('tarea', 'nota')),
    titulo TEXT,
    contenido TEXT NOT NULL,
    categoria TEXT,
    completada BOOLEAN DEFAULT false,
    fecha_limite DATE,
    prioridad TEXT CHECK (prioridad IN ('baja', 'media', 'alta')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas por usuario y tipo
CREATE INDEX idx_tasks_notes_user_id ON tasks_notes(user_id);
CREATE INDEX idx_tasks_notes_tipo ON tasks_notes(user_id, tipo);
CREATE INDEX idx_tasks_notes_completada ON tasks_notes(user_id, completada);

-- ============================================
-- 9. TABLA: documents
-- Gestión de documentos
-- ============================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    tipo_archivo TEXT,
    url TEXT,
    tamano_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas por usuario y categoría
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_categoria ON documents(user_id, categoria);

-- ============================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE variable_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE extra_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Políticas para users_profile
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON users_profile
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar su propio perfil" ON users_profile
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON users_profile
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para income_sources
CREATE POLICY "Los usuarios pueden ver sus propios ingresos" ON income_sources
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios ingresos" ON income_sources
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios ingresos" ON income_sources
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios ingresos" ON income_sources
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para fixed_expenses
CREATE POLICY "Los usuarios pueden ver sus propios gastos fijos" ON fixed_expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios gastos fijos" ON fixed_expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios gastos fijos" ON fixed_expenses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios gastos fijos" ON fixed_expenses
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para variable_expenses
CREATE POLICY "Los usuarios pueden ver sus propios gastos variables" ON variable_expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios gastos variables" ON variable_expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios gastos variables" ON variable_expenses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios gastos variables" ON variable_expenses
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para extra_expenses
CREATE POLICY "Los usuarios pueden ver sus propios gastos extras" ON extra_expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios gastos extras" ON extra_expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios gastos extras" ON extra_expenses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios gastos extras" ON extra_expenses
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para budget_config
CREATE POLICY "Los usuarios pueden ver su propia configuración" ON budget_config
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar su propia configuración" ON budget_config
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar su propia configuración" ON budget_config
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar su propia configuración" ON budget_config
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para payment_reminders
CREATE POLICY "Los usuarios pueden ver sus propios recordatorios" ON payment_reminders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios recordatorios" ON payment_reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios recordatorios" ON payment_reminders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios recordatorios" ON payment_reminders
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para tasks_notes
CREATE POLICY "Los usuarios pueden ver sus propias tareas y notas" ON tasks_notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propias tareas y notas" ON tasks_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias tareas y notas" ON tasks_notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias tareas y notas" ON tasks_notes
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para documents
CREATE POLICY "Los usuarios pueden ver sus propios documentos" ON documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios documentos" ON documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios documentos" ON documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios documentos" ON documents
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at en todas las tablas
CREATE TRIGGER update_users_profile_updated_at BEFORE UPDATE ON users_profile
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_sources_updated_at BEFORE UPDATE ON income_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fixed_expenses_updated_at BEFORE UPDATE ON fixed_expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variable_expenses_updated_at BEFORE UPDATE ON variable_expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_extra_expenses_updated_at BEFORE UPDATE ON extra_expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_config_updated_at BEFORE UPDATE ON budget_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_reminders_updated_at BEFORE UPDATE ON payment_reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_notes_updated_at BEFORE UPDATE ON tasks_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTARIOS EN TABLAS
-- ============================================

COMMENT ON TABLE users_profile IS 'Perfil extendido de usuarios del sistema';
COMMENT ON TABLE income_sources IS 'Fuentes de ingreso mensuales por usuario';
COMMENT ON TABLE fixed_expenses IS 'Gastos fijos mensuales (arriendos, servicios, créditos)';
COMMENT ON TABLE variable_expenses IS 'Gastos variables mensuales (comida, transporte, entretenimiento)';
COMMENT ON TABLE extra_expenses IS 'Gastos extras o imprevistos';
COMMENT ON TABLE budget_config IS 'Configuración de presupuesto por usuario y período';
COMMENT ON TABLE payment_reminders IS 'Recordatorios de pagos y fechas importantes';
COMMENT ON TABLE tasks_notes IS 'Tareas y notas personales del usuario';
COMMENT ON TABLE documents IS 'Documentos asociados al usuario (facturas, recibos, etc.)';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
