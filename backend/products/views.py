from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Category, Product, ProductImage
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductDetailSerializer,
    ProductCreateSerializer,
    ProductImageSerializer,
    ImageUploadSerializer,
    ProductImageCreateSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['get'])
    def products(self, request, slug=None):
        """Obtener productos de una categoría"""
        category = self.get_object()
        products = Product.objects.filter(
            category=category,
            is_active=True
        ).order_by('-created_at')
        
        # Aplicar filtros
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        search = request.query_params.get('search')
        
        if min_price:
            products = products.filter(price__gte=min_price)
        if max_price:
            products = products.filter(price__lte=max_price)
        if search:
            products = products.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProductCreateSerializer
        return ProductSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros personalizados
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        in_stock = self.request.query_params.get('in_stock')
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if in_stock == 'true':
            queryset = queryset.filter(stock__gt=0)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Obtener productos destacados"""
        featured_products = self.get_queryset().filter(is_featured=True)[:8]
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Obtener productos más recientes"""
        latest_products = self.get_queryset().order_by('-created_at')[:8]
        serializer = self.get_serializer(latest_products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def upload_image(self, request):
        """Subir imagen a Supabase Storage"""
        serializer = ImageUploadSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            return Response(result, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductImageCreateSerializer
        return ProductImageSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset.order_by('order', 'created_at')
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reordenar imágenes de un producto"""
        image_orders = request.data.get('image_orders', [])
        
        for item in image_orders:
            try:
                image = ProductImage.objects.get(id=item['id'])
                image.order = item['order']
                image.save()
            except ProductImage.DoesNotExist:
                continue
        
        return Response({'message': 'Imágenes reordenadas correctamente'})
    
    @action(detail=True, methods=['post'])
    def set_main(self, request, pk=None):
        """Establecer imagen como principal"""
        image = self.get_object()
        
        # Desmarcar otras imágenes como principales
        ProductImage.objects.filter(
            product=image.product,
            is_main=True
        ).update(is_main=False)
        
        # Marcar esta imagen como principal
        image.is_main = True
        image.save()
        
        return Response({'message': 'Imagen establecida como principal'})
