#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🧠 WiseSpend - Procesador Inteligente de Comandos de Voz
Procesamiento de comandos en español chileno para gestión financiera
Versión: 1.0.0
Autor: Norman - WiseSpend Team
"""

import re
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Any
import unicodedata

# Configurar logging
logger = logging.getLogger(__name__)

class VoiceProcessor:
    """Procesador inteligente de comandos de voz para WiseSpend"""
    
    def __init__(self):
        """Inicializar procesador"""
        logger.info("🧠 Inicializando VoiceProcessor...")
        
        # Configuración de patrones
        self.setup_patterns()
        self.setup_categories()
        self.setup_priorities()
        self.setup_time_expressions()
        
        logger.info("✅ VoiceProcessor inicializado correctamente")
    
    def setup_patterns(self):
        """Configurar patrones de reconocimiento"""
        self.patterns = {
            # Gastos
            'expense_patterns': [
                r'(?:agregar|añadir|nuevo)\s+gasto\s+(fijo|variable|extra)?\s*(\d+(?:\.\d+)?[km]?)\s*(?:en|de|para)?\s*(.*)?',
                r'gasto\s+(fijo|variable|extra)?\s*(?:de|por)?\s*(\d+(?:\.\d+)?[km]?)\s*(?:en|de|para)?\s*(.*)?',
                r'(?:pagué|gasté|compré)\s*(\d+(?:\.\d+)?[km]?)\s*(?:en|de|para)?\s*(.*)?',
                r'(?:compra|gasto)\s*(?:de|por)?\s*(\d+(?:\.\d+)?[km]?)\s*(?:en|de|para)?\s*(.*)?'
            ],
            
            # Ingresos
            'income_patterns': [
                r'(?:agregar|añadir|nuevo)\s+ingreso\s*(?:de|por)?\s*(\d+(?:\.\d+)?[km]?)\s*(?:de|por|desde)?\s*(.*)?',
                r'ingreso\s*(?:de|por)?\s*(\d+(?:\.\d+)?[km]?)\s*(?:de|por|desde)?\s*(.*)?',
                r'(?:recibí|me\s+pagaron|cobramos)\s*(\d+(?:\.\d+)?[km]?)\s*(?:de|por|desde)?\s*(.*)?',
                r'(?:sueldo|salario|pago)\s*(?:de|por)?\s*(\d+(?:\.\d+)?[km]?)\s*(?:de|por|desde)?\s*(.*)?'
            ],
            
            # Tareas
            'task_patterns': [
                r'(?:agregar|nueva|crear)\s+tarea\s+(.*?)(?:\s+(?:para|el|mañana|hoy).*)?',
                r'tarea\s+(.*?)(?:\s+(?:para|el|mañana|hoy).*)?',
                r'(?:tengo\s+que|debo|necesito)\s+(.*?)(?:\s+(?:para|el|mañana|hoy).*)?',
                r'(?:hacer|completar)\s+(.*?)(?:\s+(?:para|el|mañana|hoy).*)?'
            ],
            
            # Recordatorios
            'reminder_patterns': [
                r'(?:recordatorio|recordar)\s+(.*?)(?:\s+(?:para|el|mañana|hoy).*)?',
                r'(?:recordarme|avísame)\s+(?:que|de)?\s+(.*?)(?:\s+(?:para|el|mañana|hoy).*)?',
                r'(?:no\s+olvides?|no\s+olvidar)\s+(.*?)(?:\s+(?:para|el|mañana|hoy).*)?'
            ]
        }
    
    def setup_categories(self):
        """Configurar categorías y sinónimos"""
        self.categories = {
            'alimentación': [
                'comida', 'almuerzo', 'desayuno', 'cena', 'supermercado', 'mercado',
                'restaurant', 'restaurante', 'delivery', 'pedidosya', 'uber eats',
                'verduras', 'carne', 'pan', 'leche', 'bebidas', 'coca cola'
            ],
            'transporte': [
                'metro', 'micro', 'uber', 'taxi', 'colectivo', 'bencina', 'gasolina',
                'estacionamiento', 'peaje', 'mecánico', 'revisión técnica',
                'permiso de circulación', 'bus', 'locomoción'
            ],
            'servicios': [
                'luz', 'agua', 'gas', 'internet', 'teléfono', 'cable', 'netflix',
                'spotify', 'electricidad', 'conta', 'arriendo', 'alquiler'
            ],
            'salud': [
                'médico', 'doctor', 'farmacia', 'medicamentos', 'clínica',
                'hospital', 'dentista', 'oftalmólogo', 'examen', 'isapre', 'fonasa'
            ],
            'entretenimiento': [
                'cine', 'teatro', 'concierto', 'bar', 'disco', 'fiesta',
                'juegos', 'netflix', 'amazon prime', 'youtube premium'
            ],
            'ropa': [
                'ropa', 'zapatos', 'zapatillas', 'camisa', 'pantalón',
                'vestido', 'chaqueta', 'abrigo', 'polera'
            ],
            'hogar': [
                'supermercado', 'limpieza', 'detergente', 'shampoo',
                'muebles', 'decoración', 'plantas', 'herramientas'
            ],
            'educación': [
                'colegio', 'universidad', 'curso', 'libro', 'cuaderno',
                'material escolar', 'mensualidad', 'matrícula'
            ]
        }
    
    def setup_priorities(self):
        """Configurar niveles de prioridad"""
        self.priorities = {
            'alta': ['urgente', 'importante', 'crítico', 'prioridad', 'ya', 'ahora'],
            'media': ['normal', 'regular', 'común'],
            'baja': ['después', 'más tarde', 'cuando pueda', 'opcional']
        }
    
    def setup_time_expressions(self):
        """Configurar expresiones temporales"""
        self.time_expressions = {
            'hoy': ['hoy', 'hoy día'],
            'mañana': ['mañana'],
            'this_week': ['esta semana', 'en la semana'],
            'next_week': ['próxima semana', 'semana que viene'],
            'days': {
                'lunes': 'monday',
                'martes': 'tuesday', 
                'miércoles': 'wednesday',
                'jueves': 'thursday',
                'viernes': 'friday',
                'sábado': 'saturday',
                'domingo': 'sunday'
            }
        }
    
    def process_text(self, text: str) -> Dict[str, Any]:
        """Procesar comando de texto"""
        logger.info(f"📝 Procesando comando: {text}")
        
        try:
            # Normalizar texto
            normalized_text = self.normalize_text(text)
            logger.debug(f"Texto normalizado: {normalized_text}")
            
            # Detectar tipo de comando
            command_type = self.detect_command_type(normalized_text)
            logger.debug(f"Tipo detectado: {command_type}")
            
            # Procesar según el tipo
            if command_type == 'expense':
                result = self.process_expense_command(normalized_text)
            elif command_type == 'income':
                result = self.process_income_command(normalized_text)
            elif command_type == 'task':
                result = self.process_task_command(normalized_text)
            elif command_type == 'reminder':
                result = self.process_reminder_command(normalized_text)
            else:
                result = self.create_unknown_result(normalized_text)
            
            # Agregar metadatos
            result.update({
                'original_text': text,
                'normalized_text': normalized_text,
                'processed_at': datetime.now().isoformat(),
                'processor_version': '1.0.0'
            })
            
            logger.info(f"✅ Comando procesado exitosamente: {result['action']}")
            return result
            
        except Exception as e:
            logger.error(f"❌ Error procesando comando: {e}")
            return self.create_error_result(text, str(e))
    
    def process_audio(self, audio_data) -> Dict[str, Any]:
        """Procesar comando de audio"""
        logger.info("🔊 Procesando comando de audio")
        
        try:
            # Por ahora simular reconocimiento de voz
            # En una implementación real aquí iría Google Speech API o similar
            recognized_text = self.simulate_speech_recognition(audio_data)
            
            # Procesar el texto reconocido
            result = self.process_text(recognized_text)
            result['source'] = 'audio'
            result['confidence'] = 0.85  # Simular confianza
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error procesando audio: {e}")
            return self.create_error_result("audio_command", str(e))
    
    def normalize_text(self, text: str) -> str:
        """Normalizar texto para procesamiento"""
        # Convertir a minúsculas
        text = text.lower().strip()
        
        # Remover acentos
        text = unicodedata.normalize('NFD', text)
        text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
        
        # Reemplazar abreviaciones comunes
        replacements = {
            'k': '000',
            'mil': '000',
            'lucas': '000',
            'luca': '1000',
            'gamba': '100',
            'quina': '500'
        }
        
        for old, new in replacements.items():
            text = re.sub(r'\b' + old + r'\b', new, text)
        
        # Limpiar espacios múltiples
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()
    
    def detect_command_type(self, text: str) -> str:
        """Detectar tipo de comando"""
        # Verificar gastos
        for pattern in self.patterns['expense_patterns']:
            if re.search(pattern, text, re.IGNORECASE):
                return 'expense'
        
        # Verificar ingresos
        for pattern in self.patterns['income_patterns']:
            if re.search(pattern, text, re.IGNORECASE):
                return 'income'
        
        # Verificar tareas
        for pattern in self.patterns['task_patterns']:
            if re.search(pattern, text, re.IGNORECASE):
                return 'task'
        
        # Verificar recordatorios
        for pattern in self.patterns['reminder_patterns']:
            if re.search(pattern, text, re.IGNORECASE):
                return 'reminder'
        
        return 'unknown'
    
    def process_expense_command(self, text: str) -> Dict[str, Any]:
        """Procesar comando de gasto"""
        for pattern in self.patterns['expense_patterns']:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                groups = match.groups()
                
                # Extraer información
                expense_type = groups[0] if len(groups) > 0 and groups[0] else 'variable'
                amount = self.extract_amount(groups[1] if len(groups) > 1 else '0')
                description = groups[2] if len(groups) > 2 and groups[2] else 'Gasto por voz'
                
                # Detectar categoría
                category = self.detect_category(description)
                
                return {
                    'recognized_text': text,
                    'confidence': 0.95,
                    'action': 'add_expense',
                    'details': {
                        'type': expense_type,
                        'amount': amount,
                        'category': category,
                        'description': description.strip(),
                        'date': datetime.now().strftime('%Y-%m-%d'),
                        'currency': 'CLP'
                    }
                }
        
        # Si no coincide con ningún patrón específico
        return self.create_generic_expense_result(text)
    
    def process_income_command(self, text: str) -> Dict[str, Any]:
        """Procesar comando de ingreso"""
        for pattern in self.patterns['income_patterns']:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                groups = match.groups()
                
                amount = self.extract_amount(groups[0] if len(groups) > 0 else '0')
                source = groups[1] if len(groups) > 1 and groups[1] else 'Ingreso por voz'
                
                return {
                    'recognized_text': text,
                    'confidence': 0.95,
                    'action': 'add_income',
                    'details': {
                        'amount': amount,
                        'source': source.strip(),
                        'date': datetime.now().strftime('%Y-%m-%d'),
                        'currency': 'CLP'
                    }
                }
        
        return self.create_generic_income_result(text)
    
    def process_task_command(self, text: str) -> Dict[str, Any]:
        """Procesar comando de tarea"""
        for pattern in self.patterns['task_patterns']:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                task_description = match.group(1).strip()
                
                # Detectar prioridad
                priority = self.detect_priority(text)
                
                # Detectar fecha
                due_date = self.detect_date(text)
                
                return {
                    'recognized_text': text,
                    'confidence': 0.92,
                    'action': 'add_task',
                    'details': {
                        'title': task_description,
                        'description': f'Tarea creada por voz: {task_description}',
                        'priority': priority,
                        'due_date': due_date,
                        'completed': False,
                        'created_at': datetime.now().isoformat()
                    }
                }
        
        return self.create_generic_task_result(text)
    
    def process_reminder_command(self, text: str) -> Dict[str, Any]:
        """Procesar comando de recordatorio"""
        for pattern in self.patterns['reminder_patterns']:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                reminder_text = match.group(1).strip()
                
                # Detectar fecha
                due_date = self.detect_date(text)
                
                return {
                    'recognized_text': text,
                    'confidence': 0.90,
                    'action': 'add_reminder',
                    'details': {
                        'title': reminder_text,
                        'description': f'Recordatorio: {reminder_text}',
                        'due_date': due_date,
                        'priority': 'media',
                        'completed': False,
                        'created_at': datetime.now().isoformat()
                    }
                }
        
        return self.create_generic_reminder_result(text)
    
    def extract_amount(self, amount_str: str) -> int:
        """Extraer cantidad numérica"""
        if not amount_str:
            return 0
        
        # Buscar números en el string
        numbers = re.findall(r'\d+(?:\.\d+)?', amount_str)
        if numbers:
            amount = float(numbers[0])
            
            # Aplicar multiplicadores
            if 'k' in amount_str or '000' in amount_str:
                if amount < 1000:  # Si es algo como "50k"
                    amount *= 1000
            
            return int(amount)
        
        return 0
    
    def detect_category(self, description: str) -> str:
        """Detectar categoría basada en la descripción"""
        description_lower = description.lower()
        
        for category, keywords in self.categories.items():
            for keyword in keywords:
                if keyword in description_lower:
                    return category
        
        return 'otros'
    
    def detect_priority(self, text: str) -> str:
        """Detectar prioridad en el texto"""
        text_lower = text.lower()
        
        for priority, keywords in self.priorities.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return priority
        
        return 'media'
    
    def detect_date(self, text: str) -> str:
        """Detectar fecha en el texto"""
        text_lower = text.lower()
        today = datetime.now()
        
        # Detectar expresiones temporales
        if any(expr in text_lower for expr in self.time_expressions['hoy']):
            return today.strftime('%Y-%m-%d')
        
        if any(expr in text_lower for expr in self.time_expressions['mañana']):
            tomorrow = today + timedelta(days=1)
            return tomorrow.strftime('%Y-%m-%d')
        
        # Por defecto, mañana
        tomorrow = today + timedelta(days=1)
        return tomorrow.strftime('%Y-%m-%d')
    
    def simulate_speech_recognition(self, audio_data) -> str:
        """Simular reconocimiento de voz"""
        # En una implementación real, aquí procesarías el audio
        # Por ahora devolver un comando simulado
        sample_commands = [
            "agregar gasto variable 25000 en supermercado",
            "nueva tarea comprar pan mañana",
            "recordatorio pagar luz el viernes",
            "ingreso 500000 de sueldo",
            "gasto fijo 150000 en arriendo"
        ]
        
        import random
        return random.choice(sample_commands)
    
    def create_unknown_result(self, text: str) -> Dict[str, Any]:
        """Crear resultado para comando desconocido"""
        return {
            'recognized_text': text,
            'confidence': 0.60,
            'action': 'unknown',
            'details': {
                'message': 'Comando no reconocido, pero texto recibido correctamente',
                'suggestions': [
                    'Intenta: "agregar gasto variable 50000 en comida"',
                    'O: "nueva tarea hacer compras mañana"',
                    'O: "recordatorio pagar luz el viernes"'
                ]
            }
        }
    
    def create_error_result(self, text: str, error: str) -> Dict[str, Any]:
        """Crear resultado de error"""
        return {
            'recognized_text': text,
            'confidence': 0.0,
            'action': 'error',
            'details': {
                'error': error,
                'message': 'Error procesando el comando'
            }
        }
    
    def create_generic_expense_result(self, text: str) -> Dict[str, Any]:
        """Crear resultado genérico de gasto"""
        return {
            'recognized_text': text,
            'confidence': 0.75,
            'action': 'add_expense',
            'details': {
                'type': 'variable',
                'amount': 10000,
                'category': 'otros',
                'description': 'Gasto detectado por voz',
                'date': datetime.now().strftime('%Y-%m-%d'),
                'currency': 'CLP'
            }
        }
    
    def create_generic_income_result(self, text: str) -> Dict[str, Any]:
        """Crear resultado genérico de ingreso"""
        return {
            'recognized_text': text,
            'confidence': 0.75,
            'action': 'add_income',
            'details': {
                'amount': 50000,
                'source': 'Ingreso detectado por voz',
                'date': datetime.now().strftime('%Y-%m-%d'),
                'currency': 'CLP'
            }
        }
    
    def create_generic_task_result(self, text: str) -> Dict[str, Any]:
        """Crear resultado genérico de tarea"""
        return {
            'recognized_text': text,
            'confidence': 0.75,
            'action': 'add_task',
            'details': {
                'title': 'Tarea por voz',
                'description': f'Tarea detectada: {text}',
                'priority': 'media',
                'due_date': (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d'),
                'completed': False,
                'created_at': datetime.now().isoformat()
            }
        }
    
    def create_generic_reminder_result(self, text: str) -> Dict[str, Any]:
        """Crear resultado genérico de recordatorio"""
        return {
            'recognized_text': text,
            'confidence': 0.75,
            'action': 'add_reminder',
            'details': {
                'title': 'Recordatorio por voz',
                'description': f'Recordatorio: {text}',
                'due_date': (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d'),
                'priority': 'media',
                'completed': False,
                'created_at': datetime.now().isoformat()
            }
        }

# Función de prueba
def test_voice_processor():
    """Función de prueba del procesador"""
    processor = VoiceProcessor()
    
    test_commands = [
        "agregar gasto variable 50000 en supermercado",
        "nueva tarea comprar pan mañana",
        "recordatorio pagar luz el viernes urgente",
        "ingreso 500000 de sueldo",
        "gasté 25 lucas en almuerzo",
        "compré 15000 en farmacia"
    ]
    
    print("🧪 Probando VoiceProcessor...")
    for cmd in test_commands:
        result = processor.process_text(cmd)
        print(f"Comando: {cmd}")
        print(f"Resultado: {result['action']} - {result['details']}")
        print("-" * 50)

if __name__ == "__main__":
    test_voice_processor()
    
    