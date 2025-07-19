from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator
from django.contrib.auth.password_validation import validate_password
import re
from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile


def validate_positive_price(value):
    """
    Valida que el precio sea positivo
    """
    if value <= 0:
        raise ValidationError('El precio debe ser mayor a 0')


def validate_non_negative_stock(value):
    """
    Valida que el stock no sea negativo
    """
    if value < 0:
        raise ValidationError('El stock no puede ser negativo')


def validate_secure_password(password):
    """
    Valida que la contraseña sea segura
    """
    try:
        validate_password(password)
    except ValidationError as e:
        raise ValidationError(e.messages)
    
    # Validaciones adicionales
    if len(password) < 8:
        raise ValidationError('La contraseña debe tener al menos 8 caracteres')
    
    if not re.search(r'[A-Z]', password):
        raise ValidationError('La contraseña debe contener al menos una letra mayúscula')
    
    if not re.search(r'[a-z]', password):
        raise ValidationError('La contraseña debe contener al menos una letra minúscula')
    
    if not re.search(r'\d', password):
        raise ValidationError('La contraseña debe contener al menos un número')


def validate_unique_slug(value, model_class, instance=None):
    """
    Valida que el slug sea único
    """
    queryset = model_class.objects.filter(slug=value)
    if instance:
        queryset = queryset.exclude(pk=instance.pk)
    
    if queryset.exists():
        raise ValidationError(f'Ya existe un registro con el slug "{value}"')


def validate_image_file(file):
    """
    Valida que el archivo sea una imagen válida
    """
    # Validar que sea un archivo
    if not hasattr(file, 'read'):
        raise ValidationError('Archivo inválido')
    
    # Validar tamaño máximo (5MB)
    max_size = 5 * 1024 * 1024  # 5MB
    if hasattr(file, 'size') and file.size > max_size:
        raise ValidationError(f'El archivo es muy grande. Tamaño máximo: {max_size / 1024 / 1024}MB')
    
    # Validar tipo de archivo
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if hasattr(file, 'content_type'):
        if file.content_type not in allowed_types:
            raise ValidationError(f'Tipo de archivo no permitido. Tipos permitidos: {', '.join(allowed_types)}')
    
    # Validar que sea una imagen válida usando PIL
    try:
        if isinstance(file, InMemoryUploadedFile):
            file.seek(0)
        
        image = Image.open(file)
        image.verify()
        
        # Resetear el puntero del archivo
        if hasattr(file, 'seek'):
            file.seek(0)
            
    except Exception as e:
        raise ValidationError('El archivo no es una imagen válida')


def validate_image_dimensions(file, min_width=None, min_height=None, max_width=None, max_height=None):
    """
    Valida las dimensiones de una imagen
    """
    try:
        if isinstance(file, InMemoryUploadedFile):
            file.seek(0)
        
        image = Image.open(file)
        width, height = image.size
        
        if min_width and width < min_width:
            raise ValidationError(f'La imagen debe tener al menos {min_width}px de ancho')
        
        if min_height and height < min_height:
            raise ValidationError(f'La imagen debe tener al menos {min_height}px de alto')
        
        if max_width and width > max_width:
            raise ValidationError(f'La imagen no puede tener más de {max_width}px de ancho')
        
        if max_height and height > max_height:
            raise ValidationError(f'La imagen no puede tener más de {max_height}px de alto')
        
        # Resetear el puntero del archivo
        if hasattr(file, 'seek'):
            file.seek(0)
            
    except Exception as e:
        if 'ValidationError' in str(type(e)):
            raise e
        raise ValidationError('Error al validar las dimensiones de la imagen')


def validate_phone_number(value):
    """
    Valida que el número de teléfono tenga un formato válido
    """
    # Remover espacios y caracteres especiales
    cleaned = re.sub(r'[\s\-\(\)\+]', '', value)
    
    # Validar que solo contenga números
    if not cleaned.isdigit():
        raise ValidationError('El número de teléfono solo puede contener números')
    
    # Validar longitud (entre 7 y 15 dígitos)
    if len(cleaned) < 7 or len(cleaned) > 15:
        raise ValidationError('El número de teléfono debe tener entre 7 y 15 dígitos')


def validate_stock_availability(product, quantity):
    """
    Valida que haya stock suficiente para la cantidad solicitada
    """
    if quantity <= 0:
        raise ValidationError('La cantidad debe ser mayor a 0')
    
    if quantity > product.stock:
        raise ValidationError(f'Stock insuficiente. Stock disponible: {product.stock}')


def validate_url_format(value):
    """
    Valida que la URL tenga un formato válido
    """
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+'  # domain...
        r'(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  # host...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    if not url_pattern.match(value):
        raise ValidationError('URL inválida')