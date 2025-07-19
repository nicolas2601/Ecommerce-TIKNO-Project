from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    fields = ('product', 'quantity', 'price')
    readonly_fields = ('price',)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_items', 'total_price', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    ordering = ('-updated_at',)
    inlines = [CartItemInline]
    
    def total_items(self, obj):
        return obj.total_items
    total_items.short_description = 'Total Items'
    
    def total_price(self, obj):
        return f"${obj.total_price:.2f}"
    total_price.short_description = 'Total Price'


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product', 'quantity', 'price', 'get_total_price', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('cart__user__email', 'product__name')
    ordering = ('-created_at',)
    
    def get_total_price(self, obj):
        return f"${obj.get_total_price():.2f}"
    get_total_price.short_description = 'Total Price'


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = ('product', 'quantity', 'price')
    readonly_fields = ('product', 'quantity', 'price')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number', 'user', 'status', 'total', 'total_items', 
        'created_at', 'updated_at'
    )
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = (
        'order_number', 'user__email', 'user__first_name', 'user__last_name',
        'shipping_address', 'shipping_city'
    )
    ordering = ('-created_at',)
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Información de la Orden', {
            'fields': ('order_number', 'user', 'status', 'total')
        }),
        ('Información de Envío', {
            'fields': (
                'shipping_address', 'shipping_city', 
                'shipping_postal_code', 'shipping_phone'
            )
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    readonly_fields = ('order_number', 'total', 'created_at', 'updated_at')
    
    def total_items(self, obj):
        return obj.total_items
    total_items.short_description = 'Total Items'


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'price', 'get_total_price')
    list_filter = ('order__status', 'order__created_at')
    search_fields = ('order__order_number', 'product__name')
    ordering = ('-order__created_at',)
    
    def get_total_price(self, obj):
        return f"${obj.get_total_price():.2f}"
    get_total_price.short_description = 'Total Price'
