from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado que permite a los usuarios solo editar sus propios datos.
    Los usuarios anónimos pueden leer, pero solo el propietario puede escribir.
    """
    
    def has_object_permission(self, request, view, obj):
        # Permisos de lectura para cualquier request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Permisos de escritura solo para el propietario del objeto
        return obj.user == request.user


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado que permite operaciones de lectura a cualquier usuario,
    pero solo permite operaciones de escritura a los administradores.
    """
    
    def has_permission(self, request, view):
        # Permisos de lectura para cualquier request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Permisos de escritura solo para administradores
        return request.user and request.user.is_staff


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permiso personalizado que permite acceso al propietario del objeto o a los administradores.
    """
    
    def has_object_permission(self, request, view, obj):
        # Permitir acceso si es el propietario o es admin
        return obj.user == request.user or request.user.is_staff


class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado que permite lectura a cualquier usuario,
    pero requiere autenticación para operaciones de escritura.
    """
    
    def has_permission(self, request, view):
        # Permisos de lectura para cualquier request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Permisos de escritura solo para usuarios autenticados
        return request.user and request.user.is_authenticated