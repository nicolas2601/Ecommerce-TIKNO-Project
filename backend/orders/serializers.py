from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from products.models import Product
from products.serializers import ProductSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'price', 'total_price', 'created_at']
        read_only_fields = ['id', 'price', 'created_at']
    
    def get_total_price(self, obj):
        return obj.get_total_price()
    
    def validate_product_id(self, value):
        try:
            product = Product.objects.get(id=value, is_active=True)
            if not product.is_in_stock:
                raise serializers.ValidationError("Producto sin stock disponible")
            return value
        except Product.DoesNotExist:
            raise serializers.ValidationError("Producto no encontrado")
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0")
        return value
    
    def validate(self, attrs):
        if 'product_id' in attrs:
            product = Product.objects.get(id=attrs['product_id'])
            quantity = attrs.get('quantity', 1)
            
            if quantity > product.stock:
                raise serializers.ValidationError(
                    f"Stock insuficiente. Stock disponible: {product.stock}"
                )
        
        return attrs


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_items', 'total_price', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_total_items(self, obj):
        return obj.total_items
    
    def get_total_price(self, obj):
        return obj.total_price


class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    
    def validate_product_id(self, value):
        try:
            product = Product.objects.get(id=value, is_active=True)
            if not product.is_in_stock:
                raise serializers.ValidationError("Producto sin stock disponible")
            return value
        except Product.DoesNotExist:
            raise serializers.ValidationError("Producto no encontrado")
    
    def validate(self, attrs):
        product = Product.objects.get(id=attrs['product_id'])
        quantity = attrs['quantity']
        
        if quantity > product.stock:
            raise serializers.ValidationError(
                f"Stock insuficiente. Stock disponible: {product.stock}"
            )
        
        return attrs


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price', 'total_price']
    
    def get_total_price(self, obj):
        return obj.get_total_price()


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    total_items = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'user_email', 'status', 'status_display',
            'total', 'total_items', 'shipping_address', 'shipping_city',
            'shipping_postal_code', 'shipping_phone', 'items',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'user', 'user_email', 'total', 'total_items',
            'created_at', 'updated_at'
        ]
    
    def get_total_items(self, obj):
        return obj.total_items


class CreateOrderSerializer(serializers.ModelSerializer):
    """Serializer para crear una orden desde el carrito"""
    
    class Meta:
        model = Order
        fields = [
            'shipping_address', 'shipping_city', 'shipping_postal_code', 'shipping_phone'
        ]
    
    def validate(self, attrs):
        user = self.context['request'].user
        
        # Verificar que el usuario tenga un carrito con items
        try:
            cart = user.cart
            if not cart.items.exists():
                raise serializers.ValidationError("El carrito está vacío")
        except Cart.DoesNotExist:
            raise serializers.ValidationError("No tienes un carrito")
        
        # Verificar stock de todos los productos
        for item in cart.items.all():
            if item.quantity > item.product.stock:
                raise serializers.ValidationError(
                    f"Stock insuficiente para {item.product.name}. "
                    f"Stock disponible: {item.product.stock}"
                )
        
        return attrs
    
    def create(self, validated_data):
        user = self.context['request'].user
        cart = user.cart
        
        # Crear la orden
        order = Order.objects.create(
            user=user,
            total=cart.total_price,
            **validated_data
        )
        
        # Crear los items de la orden
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.price
            )
            
            # Reducir stock del producto
            product = cart_item.product
            product.stock -= cart_item.quantity
            product.save()
        
        # Limpiar el carrito
        cart.clear()
        
        return order


class UpdateOrderStatusSerializer(serializers.ModelSerializer):
    """Serializer para actualizar el estado de una orden (solo admin)"""
    
    class Meta:
        model = Order
        fields = ['status']