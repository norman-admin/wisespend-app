#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎤 WiseSpend - Servidor de Dictado por Voz
Flask + WebSocket + PyAudio para procesamiento de comandos de voz
Versión: 1.0.0
Autor: Norman - WiseSpend Team
"""

import os
import sys
import json
import logging
import asyncio
from datetime import datetime
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, disconnect
from flask_cors import CORS
import threading
import time

# Importar procesador de voz (lo crearemos en el siguiente paso)
try:
    from voice_processor import VoiceProcessor
    VOICE_PROCESSOR_AVAILABLE = True
except ImportError:
    print("⚠️  voice_processor.py no encontrado - funcionará en modo simulación")
    VOICE_PROCESSOR_AVAILABLE = False

# 🔧 Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('voice_server.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# 🚀 Configuración de Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = 'wisespend_voice_secret_2025'

# 🌐 Configurar CORS para desarrollo local
CORS(app, origins=["http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:3000"])

# 🔌 Configurar SocketIO
socketio = SocketIO(
    app, 
    cors_allowed_origins=["http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:3000"],
    logger=True,
    engineio_logger=True
)

# 📊 Variables globales
connected_clients = set()
voice_processor = None

def initialize_voice_processor():
    """Inicializar procesador de voz"""
    global voice_processor
    try:
        if VOICE_PROCESSOR_AVAILABLE:
            voice_processor = VoiceProcessor()
            logger.info("✅ VoiceProcessor inicializado correctamente")
            return True
        else:
            logger.warning("⚠️  VoiceProcessor no disponible - modo simulación")
            return False
    except Exception as e:
        logger.error(f"❌ Error inicializando VoiceProcessor: {e}")
        return False

# 🔗 RUTAS DE LA API

@app.route('/')
def index():
    """Página de estado del servidor"""
    return jsonify({
        'status': 'running',
        'service': 'WiseSpend Voice Server',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
        'connected_clients': len(connected_clients),
        'voice_processor_available': VOICE_PROCESSOR_AVAILABLE,
        'endpoints': {
            'websocket': '/socket.io/',
            'health': '/health',
            'test': '/test'
        }
    })

@app.route('/health')
def health_check():
    """Endpoint de salud"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'components': {
            'flask': 'ok',
            'socketio': 'ok',
            'voice_processor': 'ok' if voice_processor else 'not_available',
            'pyaudio': 'ok' if VOICE_PROCESSOR_AVAILABLE else 'not_tested'
        }
    })

@app.route('/test')
def test_endpoint():
    """Endpoint de prueba"""
    return jsonify({
        'message': 'Servidor funcionando correctamente',
        'test_commands': [
            'agregar gasto variable 50000 en comida',
            'nueva tarea hacer compras mañana',
            'recordatorio pagar luz el viernes'
        ]
    })

# 🔌 EVENTOS DE WEBSOCKET

@socketio.on('connect')
def handle_connect(auth):
    """Cliente conectado"""
    client_id = request.sid
    connected_clients.add(client_id)
    
    logger.info(f"🔗 Cliente conectado: {client_id}")
    logger.info(f"📊 Clientes activos: {len(connected_clients)}")
    
    # Enviar estado inicial
    emit('connection_status', {
        'status': 'connected',
        'client_id': client_id,
        'server_time': datetime.now().isoformat(),
        'voice_available': VOICE_PROCESSOR_AVAILABLE
    })

@socketio.on('disconnect')
def handle_disconnect():
    """Cliente desconectado"""
    client_id = request.sid
    connected_clients.discard(client_id)
    
    logger.info(f"🔌 Cliente desconectado: {client_id}")
    logger.info(f"📊 Clientes activos: {len(connected_clients)}")

@socketio.on('voice_command')
def handle_voice_command(data):
    """Procesar comando de voz"""
    client_id = request.sid
    logger.info(f"🎤 Comando de voz recibido de {client_id}: {data}")
    
    try:
        # Validar datos recibidos
        if not isinstance(data, dict):
            raise ValueError("Datos inválidos")
        
        command_type = data.get('type', 'unknown')
        audio_data = data.get('audio')
        text_command = data.get('text')
        
        # Procesar según el tipo
        if command_type == 'audio' and audio_data:
            result = process_audio_command(audio_data, client_id)
        elif command_type == 'text' and text_command:
            result = process_text_command(text_command, client_id)
        elif command_type == 'simulation':
            result = process_simulation_command(data, client_id)
        else:
            raise ValueError(f"Tipo de comando no soportado: {command_type}")
        
        # Enviar respuesta
        emit('voice_response', {
            'status': 'success',
            'result': result,
            'processed_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Error procesando comando: {e}")
        emit('voice_response', {
            'status': 'error',
            'error': str(e),
            'processed_at': datetime.now().isoformat()
        })

def process_audio_command(audio_data, client_id):
    """Procesar comando de audio"""
    logger.info(f"🔊 Procesando audio de cliente {client_id}")
    
    if voice_processor:
        # Usar procesador real
        result = voice_processor.process_audio(audio_data)
        logger.info(f"✅ Audio procesado: {result}")
        return result
    else:
        # Simulación
        return {
            'recognized_text': 'Comando de audio simulado',
            'confidence': 0.95,
            'action': 'add_expense',
            'details': {
                'type': 'variable',
                'amount': 25000,
                'category': 'alimentación',
                'description': 'Supermercado (comando de audio)'
            }
        }

def process_text_command(text_command, client_id):
    """Procesar comando de texto"""
    logger.info(f"📝 Procesando texto de cliente {client_id}: {text_command}")
    
    if voice_processor:
        # Usar procesador real
        result = voice_processor.process_text(text_command)
        logger.info(f"✅ Texto procesado: {result}")
        return result
    else:
        # Simulación básica
        return simulate_text_processing(text_command)

def process_simulation_command(data, client_id):
    """Procesar comando de simulación"""
    logger.info(f"🎭 Procesando simulación de cliente {client_id}")
    
    simulation_text = data.get('simulationText', 'agregar gasto variable 30000 en comida')
    
    return simulate_text_processing(simulation_text)

def simulate_text_processing(text):
    """Simulación de procesamiento de texto"""
    text_lower = text.lower()
    
    # Simulaciones básicas según palabras clave
    if 'gasto' in text_lower and 'variable' in text_lower:
        return {
            'recognized_text': text,
            'confidence': 0.98,
            'action': 'add_expense',
            'details': {
                'type': 'variable',
                'amount': 30000,
                'category': 'alimentación',
                'description': 'Gasto agregado por voz'
            }
        }
    elif 'tarea' in text_lower or 'recordatorio' in text_lower:
        return {
            'recognized_text': text,
            'confidence': 0.95,
            'action': 'add_task',
            'details': {
                'type': 'tarea' if 'tarea' in text_lower else 'recordatorio',
                'title': 'Nueva tarea por voz',
                'priority': 'media',
                'due_date': 'mañana'
            }
        }
    else:
        return {
            'recognized_text': text,
            'confidence': 0.85,
            'action': 'unknown',
            'details': {
                'message': 'Comando no reconocido, pero recibido correctamente'
            }
        }

@socketio.on('test_connection')
def handle_test_connection():
    """Probar conexión"""
    emit('test_response', {
        'status': 'ok',
        'message': 'Conexión WebSocket funcionando correctamente',
        'timestamp': datetime.now().isoformat()
    })

# 🚀 FUNCIÓN PRINCIPAL
def main():
    """Función principal del servidor"""
    logger.info("🎤 Iniciando WiseSpend Voice Server...")
    
    # Inicializar procesador de voz
    voice_initialized = initialize_voice_processor()
    
    if voice_initialized:
        logger.info("✅ Sistema de voz completamente funcional")
    else:
        logger.warning("⚠️  Sistema funcionando en modo simulación")
    
    # Configuración del servidor
    host = '127.0.0.1'
    port = 5000
    debug = True
    
    logger.info(f"🌐 Servidor iniciando en http://{host}:{port}")
    logger.info("🔌 WebSocket disponible en /socket.io/")
    logger.info("📋 Endpoints disponibles:")
    logger.info("   - GET /         : Estado del servidor")
    logger.info("   - GET /health   : Chequeo de salud")
    logger.info("   - GET /test     : Endpoint de prueba")
    
    try:
        # Iniciar servidor
        socketio.run(
            app,
            host=host,
            port=port,
            debug=debug,
            allow_unsafe_werkzeug=True
        )
    except KeyboardInterrupt:
        logger.info("🛑 Servidor detenido por el usuario")
    except Exception as e:
        logger.error(f"❌ Error crítico del servidor: {e}")
    finally:
        logger.info("👋 Cerrando WiseSpend Voice Server")

if __name__ == '__main__':
    main()