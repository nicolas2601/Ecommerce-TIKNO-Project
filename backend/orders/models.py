from django.db import models
from django.conf import settings
from products.models import Product
from decimal import Decimal


class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart', verbose_name='Usuario')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Creado')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Actualizado')
    
    class Meta:
        verbose_name = 'Carrito'
        verbose_name_plural = 'Carritos'
    
    def __str__(self):
        return f'Carrito de {self.user.email}'
    
    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())
    
    @property
    def total_price(self):
        return sum(item.get_total_price() for item in self.items.all())
    
    def clear(self):
        self.items.all().delete()


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items', verbose_name='Carrito')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name='Producto')
    quantity = models.PositiveIntegerField(default=1, verbose_name='Cantidad')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Precio')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Creado')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Actualizado')
    
    class Meta:
        verbose_name = 'Item del carrito'
        verbose_name_plural = 'Items del carrito'
        unique_together = ['cart', 'product']
    
    def __str__(self):
        return f'{self.quantity} x {self.product.name}'
    
    def get_total_price(self):
        return self.quantity * self.price
    
    def save(self, *args, **kwargs):
        if not self.price:
            self.price = self.product.price
        super().save(*args, **kwargs)


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('processing', 'Procesando'),
        ('shipped', 'Enviado'),
        ('delivered', 'Entregado'),
        ('cancelled', 'Cancelado'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders', verbose_name='Usuario')
    order_number = models.CharField(max_length=20, unique=True, verbose_name='Número de orden')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='Estado')
    total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Total')
    
    # Información de envío
    shipping_address = models.TextField(verbose_name='Dirección de envío')
    shipping_city = models.CharField(max_length=100, verbose_name='Ciudad')
    shipping_postal_code = models.CharField(max_length=20, verbose_name='Código postal')
    shipping_phone = models.CharField(max_length=15, verbose_name='Teléfono')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Creado')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Actualizado')
    
    class Meta:
        verbose_name = 'Orden'
        verbose_name_plural = 'Órdenes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'Orden {self.order_number}'
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            import uuid
            self.order_number = f'ORD-{uuid.uuid4().hex[:8].upper()}'
        super().save(*args, **kwargs)
    
    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', verbose_name='Orden')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name='Producto')
    quantity = models.PositiveIntegerField(verbose_name='Cantidad')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Precio')
    
    class Meta:
        verbose_name = 'Item de orden'
        verbose_name_plural = 'Items de orden'
    
    def __str__(self):
        return f'{self.quantity} x {self.product.name}'
    
    def get_total_price(self):
        return self.quantity * self.price
