from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from .models import Cart, CartItem, Order, OrderItem
from core.permissions import IsOwnerOrReadOnly, IsOwnerOrAdmin
from core.validators import validate_stock_availability
from core.exceptions import InsufficientStockException
from .serializers import (
    CartSerializer, CartItemSerializer, AddToCartSerializer,
    OrderSerializer, CreateOrderSerializer, UpdateOrderStatusSerializer
)
from products.models import Product


class CartViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar el carrito de compras"""
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    
    def get_object(self):
        """Obtener o crear el carrito del usuario"""
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart
    
    def list(self, request):
        """Obtener el carrito del usuario"""
        cart = self.get_object()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Agregar un producto al carrito"""
        serializer = AddToCartSerializer(data=request.data)
        if serializer.is_valid():
            cart = self.get_object()
            product_id = serializer.validated_data['product_id']
            quantity = serializer.validated_data['quantity']
            
            product = get_object_or_404(Product, id=product_id, is_active=True)
            
            # Verificar si el item ya existe en el carrito
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': quantity, 'price': product.price}
            )
            
            if not created:
                # Si ya existe, actualizar la cantidad
                new_quantity = cart_item.quantity + quantity
                try:
                    validate_stock_availability(product, new_quantity)
                except Exception as e:
                    raise InsufficientStockException(product.stock, new_quantity)
                cart_item.quantity = new_quantity
                cart_item.save()
            else:
                # Validar stock para nuevo item
                try:
                    validate_stock_availability(product, quantity)
                except Exception as e:
                    raise InsufficientStockException(product.stock, quantity)
            
            cart_serializer = CartSerializer(cart)
            return Response(cart_serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['put'])
    def update_item(self, request):
        """Actualizar la cantidad de un item en el carrito"""
        cart = self.get_object()
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity')
        
        if not item_id or not quantity:
            return Response(
                {'error': 'item_id y quantity son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cart_item = cart.items.get(id=item_id)
            
            if quantity <= 0:
                cart_item.delete()
            else:
                try:
                    validate_stock_availability(cart_item.product, quantity)
                except Exception as e:
                    raise InsufficientStockException(cart_item.product.stock, quantity)
                cart_item.quantity = quantity
                cart_item.save()
            
            cart_serializer = CartSerializer(cart)
            return Response(cart_serializer.data)
            
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Item no encontrado en el carrito'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        """Eliminar un item del carrito"""
        cart = self.get_object()
        item_id = request.data.get('item_id')
        
        if not item_id:
            return Response(
                {'error': 'item_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cart_item = cart.items.get(id=item_id)
            cart_item.delete()
            
            cart_serializer = CartSerializer(cart)
            return Response(cart_serializer.data)
            
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Item no encontrado en el carrito'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """Limpiar todo el carrito"""
        cart = self.get_object()
        cart.clear()
        
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data)


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar las órdenes"""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['created_at', 'total']
    ordering = ['-created_at']
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        elif self.action == 'update_status':
            return UpdateOrderStatusSerializer
        return OrderSerializer
    
    def create(self, request):
        """Crear una nueva orden desde el carrito"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            order = serializer.save()
            order_serializer = OrderSerializer(order)
            return Response(order_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAdminUser])
    def update_status(self, request, pk=None):
        """Actualizar el estado de una orden (solo admin)"""
        order = self.get_object()
        serializer = UpdateOrderStatusSerializer(order, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            order_serializer = OrderSerializer(order)
            return Response(order_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """Obtener las órdenes del usuario autenticado"""
        orders = self.get_queryset().filter(user=request.user)
        page = self.paginate_queryset(orders)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def order_detail(self, request, pk=None):
        """Obtener el detalle de una orden específica"""
        order = self.get_object()
        
        # Verificar que el usuario puede ver esta orden
        if not request.user.is_staff and order.user != request.user:
            return Response(
                {'error': 'No tienes permiso para ver esta orden'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def admin_stats(self, request):
        """Estadísticas de órdenes para administradores"""
        from django.db.models import Count, Sum
        
        stats = {
            'total_orders': Order.objects.count(),
            'pending_orders': Order.objects.filter(status='pending').count(),
            'processing_orders': Order.objects.filter(status='processing').count(),
            'shipped_orders': Order.objects.filter(status='shipped').count(),
            'delivered_orders': Order.objects.filter(status='delivered').count(),
            'cancelled_orders': Order.objects.filter(status='cancelled').count(),
            'total_revenue': Order.objects.exclude(status='cancelled').aggregate(
                total=Sum('total')
            )['total'] or 0,
        }
        
        return Response(stats)
