from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
from django.db import IntegrityError
import logging

# Configurar logger
logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Manejador de excepciones personalizado para proporcionar respuestas consistentes
    """
    # Llamar al manejador de excepciones por defecto de DRF
    response = exception_handler(exc, context)
    
    # Si DRF no manejó la excepción, manejarla nosotros
    if response is None:
        return handle_generic_error(exc, context)
    
    # Personalizar la respuesta para errores conocidos
    custom_response_data = {
        'success': False,
        'error': {
            'code': response.status_code,
            'message': get_error_message(exc, response),
            'details': get_error_details(response.data) if hasattr(response, 'data') else None
        }
    }
    
    # Log de errores críticos
    if response.status_code >= 500:
        logger.error(
            f"Error crítico: {exc}",
            extra={
                'request': context.get('request'),
                'view': context.get('view'),
                'exception': exc
            }
        )
    
    response.data = custom_response_data
    return response


def handle_generic_error(exc, context):
    """
    Maneja errores que no fueron capturados por DRF
    """
    if isinstance(exc, DjangoValidationError):
        return Response({
            'success': False,
            'error': {
                'code': status.HTTP_400_BAD_REQUEST,
                'message': 'Error de validación',
                'details': exc.messages if hasattr(exc, 'messages') else [str(exc)]
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    elif isinstance(exc, Http404):
        return Response({
            'success': False,
            'error': {
                'code': status.HTTP_404_NOT_FOUND,
                'message': 'Recurso no encontrado',
                'details': str(exc)
            }
        }, status=status.HTTP_404_NOT_FOUND)
    
    elif isinstance(exc, IntegrityError):
        return Response({
            'success': False,
            'error': {
                'code': status.HTTP_400_BAD_REQUEST,
                'message': 'Error de integridad de datos',
                'details': 'Ya existe un registro con estos datos'
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    elif isinstance(exc, PermissionError):
        return Response({
            'success': False,
            'error': {
                'code': status.HTTP_403_FORBIDDEN,
                'message': 'Sin permisos suficientes',
                'details': str(exc)
            }
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Error genérico del servidor
    logger.error(
        f"Error no manejado: {exc}",
        extra={
            'request': context.get('request'),
            'view': context.get('view'),
            'exception': exc
        }
    )
    
    return Response({
        'success': False,
        'error': {
            'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
            'message': 'Error interno del servidor',
            'details': 'Ha ocurrido un error inesperado'
        }
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def get_error_message(exc, response):
    """
    Obtiene un mensaje de error apropiado basado en el tipo de excepción
    """
    status_code = response.status_code
    
    if status_code == 400:
        return 'Datos inválidos'
    elif status_code == 401:
        return 'No autenticado'
    elif status_code == 403:
        return 'Sin permisos suficientes'
    elif status_code == 404:
        return 'Recurso no encontrado'
    elif status_code == 405:
        return 'Método no permitido'
    elif status_code == 429:
        return 'Demasiadas solicitudes'
    elif status_code >= 500:
        return 'Error interno del servidor'
    else:
        return 'Error en la solicitud'


def get_error_details(data):
    """
    Extrae los detalles del error de la respuesta de DRF
    """
    if isinstance(data, dict):
        # Si es un diccionario, extraer los errores de cada campo
        details = {}
        for field, errors in data.items():
            if isinstance(errors, list):
                details[field] = errors
            else:
                details[field] = [str(errors)]
        return details
    elif isinstance(data, list):
        # Si es una lista, devolverla tal como está
        return data
    else:
        # Si es otro tipo, convertirlo a string
        return [str(data)]


class CustomAPIException(Exception):
    """
    Excepción personalizada para la API
    """
    def __init__(self, message, status_code=status.HTTP_400_BAD_REQUEST, details=None):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)


class InsufficientStockException(CustomAPIException):
    """
    Excepción para cuando no hay stock suficiente
    """
    def __init__(self, available_stock, requested_quantity):
        message = f'Stock insuficiente. Disponible: {available_stock}, solicitado: {requested_quantity}'
        details = {
            'available_stock': available_stock,
            'requested_quantity': requested_quantity
        }
        super().__init__(message, status.HTTP_400_BAD_REQUEST, details)


class InvalidImageException(CustomAPIException):
    """
    Excepción para imágenes inválidas
    """
    def __init__(self, message='Imagen inválida'):
        super().__init__(message, status.HTTP_400_BAD_REQUEST)


class DuplicateSlugException(CustomAPIException):
    """
    Excepción para slugs duplicados
    """
    def __init__(self, slug):
        message = f'Ya existe un registro con el slug "{slug}"'
        super().__init__(message, status.HTTP_400_BAD_REQUEST)