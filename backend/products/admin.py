from django.contrib import admin
from .models import Category, Product, ProductImage


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


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock', 'is_active', 'is_featured', 'created_at')
    list_filter = ('category', 'is_active', 'is_featured', 'created_at')
    search_fields = ('name', 'description', 'sku')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('-created_at',)
    inlines = [ProductImageInline]
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'slug', 'category', 'description')
        }),
        ('Precio y Stock', {
            'fields': ('price', 'stock', 'sku')
        }),
        ('Configuración', {
            'fields': ('is_active', 'is_featured')
        }),
        ('Imágenes', {
            'fields': ('main_image_url', 'thumbnail_url')
        }),
    )


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'alt_text', 'order', 'is_main', 'created_at')
    list_filter = ('is_main', 'created_at')
    search_fields = ('product__name', 'alt_text')
    ordering = ('product', 'order')
