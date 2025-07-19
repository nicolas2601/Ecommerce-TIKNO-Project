from django.contrib import admin
from django.forms import ModelForm
from django.core.exceptions import ValidationError
from .models import Category, Product, ProductImage
from core.services import SupabaseStorageService


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image_url', 'alt_text', 'order', 'is_main')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('name',)


class ProductAdminForm(ModelForm):
    class Meta:
        model = Product
        fields = '__all__'
    
    def clean(self):
        cleaned_data = super().clean()
        main_image = cleaned_data.get('main_image')
        main_image_url = cleaned_data.get('main_image_url')
        
        # Si se sube una imagen, validarla
        if main_image:
            try:
                storage_service = SupabaseStorageService()
                # Usar el método de validación mejorado
                storage_service.validate_image(main_image)
                    
            except Exception as e:
                raise ValidationError(f'Error al validar la imagen: {str(e)}')
        
        return cleaned_data


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    list_display = ('name', 'category', 'price', 'stock', 'is_active', 'is_featured', 'created_at')
    list_filter = ('category', 'is_active', 'is_featured', 'created_at')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('-created_at',)
    inlines = [ProductImageInline]
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'slug', 'category', 'description')
        }),
        ('Precio y Stock', {
            'fields': ('price', 'stock')
        }),
        ('Configuración', {
            'fields': ('is_active', 'is_featured')
        }),
        ('Imágenes', {
            'fields': ('main_image', 'main_image_url'),
            'description': 'Puedes subir una imagen directamente o proporcionar una URL. Si subes una imagen, se guardará automáticamente en Supabase Storage.'
        }),
    )
    
    def save_model(self, request, obj, form, change):
        # Si se subió una nueva imagen, procesarla
        if obj.main_image and hasattr(obj.main_image, 'file'):
            try:
                storage_service = SupabaseStorageService()
                # Subir imagen a Supabase Storage
                image_url = storage_service.upload_image(obj.main_image, 'products')
                # Actualizar la URL de la imagen
                obj.main_image_url = image_url
                # Limpiar el campo de imagen temporal
                obj.main_image = None
                
                self.message_user(request, f'Imagen subida exitosamente a Supabase Storage: {image_url}')
                
            except Exception as e:
                self.message_user(request, f'Error al subir imagen: {str(e)}', level='ERROR')
                return
        
        super().save_model(request, obj, form, change)


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'alt_text', 'order', 'is_main', 'created_at')
    list_filter = ('is_main', 'created_at')
    search_fields = ('product__name', 'alt_text')
    ordering = ('product', 'order')
