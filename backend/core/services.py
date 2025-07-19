from supabase import create_client, Client
import uuid
from django.conf import settings
from django.core.files.uploadedfile import InMemoryUploadedFile
import os
from typing import Optional, List


class SupabaseStorageService:
    def __init__(self):
        self._client = None
        self.bucket = getattr(settings, 'SUPABASE_BUCKET', 'ecommerce-images')
        
        # Configuraciones de validación
        self.max_file_size = getattr(settings, 'MAX_UPLOAD_SIZE', 5 * 1024 * 1024)
        self.allowed_image_types = getattr(settings, 'ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/webp'])
    
    @property
    def client(self) -> Client:
        if self._client is None:
            supabase_url = getattr(settings, 'SUPABASE_URL', None)
            supabase_key = getattr(settings, 'SUPABASE_KEY', None)
            
            if not supabase_url or not supabase_key:
                raise ValueError("SUPABASE_URL y SUPABASE_KEY deben estar configurados")
            
            self._client = create_client(supabase_url, supabase_key)
        return self._client
    
    def upload_image(self, file, folder='products'):
        """
        Sube una imagen a Supabase Storage
        
        Args:
            file: Archivo de imagen
            folder: Carpeta donde guardar (products, categories, etc.)
        
        Returns:
            str: URL pública de la imagen subida
        """
        try:
            # Generar nombre único para el archivo
            file_extension = os.path.splitext(file.name)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = f"{folder}/{unique_filename}"
            
            # Obtener content_type de manera segura
            content_type = self._get_content_type(file)
            
            # Leer el contenido del archivo
            if isinstance(file, InMemoryUploadedFile):
                file_content = file.read()
            else:
                # Para ImageFieldFile y otros tipos
                if hasattr(file, 'read'):
                    file_content = file.read()
                else:
                    with open(file.path, 'rb') as f:
                        file_content = f.read()
            
            # Subir archivo a Supabase Storage
            response = self.client.storage.from_(self.bucket).upload(
                file_path, 
                file_content,
                file_options={"content-type": content_type}
            )
            
            # Verificar si la respuesta contiene error
            if hasattr(response, 'error') and response.error:
                raise Exception(f"Error al subir archivo: {response.error}")
            
            # Si no hay error, obtener URL pública
            public_url = self.get_public_url(file_path)
            return public_url
                
        except Exception as e:
            raise Exception(f"Error en upload_image: {str(e)}")
    
    def get_public_url(self, file_path):
        """
        Obtiene la URL pública de un archivo
        
        Args:
            file_path: Ruta del archivo en el bucket
        
        Returns:
            str: URL pública del archivo
        """
        try:
            response = self.client.storage.from_(self.bucket).get_public_url(file_path)
            return response
        except Exception as e:
            raise Exception(f"Error al obtener URL pública: {str(e)}")
    
    def delete_image(self, file_path):
        """
        Elimina una imagen de Supabase Storage
        
        Args:
            file_path: Ruta del archivo a eliminar
        
        Returns:
            bool: True si se eliminó correctamente
        """
        try:
            response = self.client.storage.from_(self.bucket).remove([file_path])
            # Verificar si hay error en la respuesta
            if hasattr(response, 'error') and response.error:
                raise Exception(f"Error al eliminar archivo: {response.error}")
            return True
        except Exception as e:
            raise Exception(f"Error al eliminar archivo: {str(e)}")
    
    def list_files(self, folder=''):
        """
        Lista archivos en una carpeta
        
        Args:
            folder: Carpeta a listar
        
        Returns:
            list: Lista de archivos
        """
        try:
            response = self.client.storage.from_(self.bucket).list(folder)
            return response
        except Exception as e:
            raise Exception(f"Error al listar archivos: {str(e)}")
    
    def _get_content_type(self, file):
        """
        Obtiene el content_type de manera segura para diferentes tipos de archivos
        
        Args:
            file: Archivo de imagen
        
        Returns:
            str: Content type del archivo
        """
        # Intentar obtener content_type de diferentes maneras
        if hasattr(file, 'content_type') and file.content_type:
            return file.content_type
        
        # Si no tiene content_type, inferir del nombre del archivo
        import mimetypes
        content_type, _ = mimetypes.guess_type(file.name)
        
        if content_type:
            return content_type
        
        # Fallback para extensiones comunes
        file_extension = os.path.splitext(file.name)[1].lower()
        extension_map = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.gif': 'image/gif'
        }
        
        return extension_map.get(file_extension, 'image/jpeg')
    
    def validate_image(self, file):
        """
        Valida que el archivo sea una imagen válida
        
        Args:
            file: Archivo a validar
        
        Returns:
            bool: True si es válido
        
        Raises:
            Exception: Si el archivo no es válido
        """
        # Obtener content_type de manera segura
        content_type = self._get_content_type(file)
        
        # Validar tipo de archivo
        if content_type not in self.allowed_image_types:
            raise Exception(f"Tipo de archivo no permitido. Tipos permitidos: {', '.join(self.allowed_image_types)}")
        
        # Validar tamaño de archivo
        if hasattr(file, 'size') and file.size > self.max_file_size:
            raise Exception(f"Archivo muy grande. Tamaño máximo: {self.max_file_size / 1024 / 1024}MB")
        
        return True


# Instancia global del servicio
storage_service = SupabaseStorageService()