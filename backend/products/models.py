from django.db import models
from django.utils.text import slugify
from django.urls import reverse
from django.conf import settings
from django.core.exceptions import ValidationError
from core.validators import (
    validate_positive_price,
    validate_non_negative_stock,
    validate_unique_slug,
    validate_url_format
)


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name='Nombre')
    slug = models.SlugField(max_length=100, unique=True, blank=True, verbose_name='Slug')
    description = models.TextField(blank=True, verbose_name='Descripción')
    image_url = models.URLField(
        blank=True, 
        null=True, 
        verbose_name='URL de imagen',
        validators=[validate_url_format]
    )
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Creado')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Actualizado')
    
    class Meta:
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def clean(self):
        super().clean()
        # Validar slug único
        if self.slug:
            validate_unique_slug(self.slug, Product, self)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        # Ejecutar validaciones
        self.full_clean()
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return reverse('products:category_detail', kwargs={'slug': self.slug})


class Product(models.Model):
    name = models.CharField(max_length=200, verbose_name='Nombre')
    slug = models.SlugField(max_length=200, unique=True, blank=True, verbose_name='Slug')
    description = models.TextField(verbose_name='Descripción')
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name='Precio',
        validators=[validate_positive_price]
    )
    stock = models.PositiveIntegerField(
        default=0, 
        verbose_name='Stock',
        validators=[validate_non_negative_stock]
    )
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products', verbose_name='Categoría')
    main_image_url = models.URLField(
        blank=True, 
        null=True, 
        verbose_name='URL de imagen principal',
        validators=[validate_url_format]
    )
    main_image = models.ImageField(upload_to='temp/', blank=True, null=True, verbose_name='Imagen principal (subir archivo)')
    is_active = models.BooleanField(default=True, verbose_name='Activo')
    is_featured = models.BooleanField(default=False, verbose_name='Destacado')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Creado')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Actualizado')
    
    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    def clean(self):
        super().clean()
        # Validar slug único
        if self.slug:
            validate_unique_slug(self.slug, Category, self)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        # Ejecutar validaciones
        self.full_clean()
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return reverse('products:product_detail', kwargs={'slug': self.slug})
    
    @property
    def is_in_stock(self):
        return self.stock > 0
    
    def get_main_image_url(self):
        if self.main_image_url:
            return self.main_image_url
        # Si no hay imagen principal, usar la primera imagen disponible
        first_image = self.images.filter(is_main=True).first()
        if first_image:
            return first_image.image_url
        return None


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images', verbose_name='Producto')
    image_url = models.URLField(
        verbose_name='URL de imagen',
        validators=[validate_url_format]
    )
    alt_text = models.CharField(max_length=200, blank=True, verbose_name='Texto alternativo')
    is_main = models.BooleanField(default=False, verbose_name='Imagen principal')
    order = models.PositiveIntegerField(default=0, verbose_name='Orden')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Creado')
    
    class Meta:
        verbose_name = 'Imagen de producto'
        verbose_name_plural = 'Imágenes de productos'
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f'{self.product.name} - Imagen {self.order}'
    
    def save(self, *args, **kwargs):
        # Si esta imagen se marca como principal, desmarcar las demás
        if self.is_main:
            ProductImage.objects.filter(product=self.product, is_main=True).update(is_main=False)
        super().save(*args, **kwargs)
