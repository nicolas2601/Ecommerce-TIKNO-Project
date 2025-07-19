from rest_framework import serializers
from .models import Category, Product, ProductImage
from core.services import storage_service
from core.validators import validate_positive_price, validate_non_negative_stock, validate_image_file


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image_url', 'is_active', 'products_count', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']
    
    def get_products_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'alt_text', 'is_main', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    main_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'stock', 
            'category', 'category_name', 'main_image_url', 'main_image',
            'is_active', 'is_featured', 'is_in_stock', 'images',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'is_in_stock']
    
    def get_main_image(self, obj):
        return obj.get_main_image_url()


class ProductDetailSerializer(ProductSerializer):
    """Serializer más completo para el detalle del producto"""
    category = CategorySerializer(read_only=True)
    related_products = serializers.SerializerMethodField()
    
    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ['related_products']
    
    def get_related_products(self, obj):
        related = Product.objects.filter(
            category=obj.category,
            is_active=True
        ).exclude(id=obj.id)[:4]
        return ProductSerializer(related, many=True, context=self.context).data


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear productos con validaciones"""
    
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'price', 'stock', 'category',
            'main_image_url', 'is_active', 'is_featured'
        ]
    
    def validate_price(self, value):
        validate_positive_price(value)
        return value
    
    def validate_stock(self, value):
        validate_non_negative_stock(value)
        return value


class ImageUploadSerializer(serializers.Serializer):
    """Serializer para subir imágenes"""
    image = serializers.ImageField()
    folder = serializers.CharField(max_length=50, default='products')
    
    def validate_image(self, value):
        validate_image_file(value)
        return value
    
    def create(self, validated_data):
        image = validated_data['image']
        folder = validated_data.get('folder', 'products')
        
        try:
            image_url = storage_service.upload_image(image, folder)
            return {'image_url': image_url}
        except Exception as e:
            raise serializers.ValidationError(f"Error al subir imagen: {str(e)}")


class ProductImageCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear imágenes de productos"""
    
    class Meta:
        model = ProductImage
        fields = ['product', 'image_url', 'alt_text', 'is_main', 'order']
    
    def validate(self, attrs):
        # Si no se especifica alt_text, usar el nombre del producto
        if not attrs.get('alt_text') and attrs.get('product'):
            attrs['alt_text'] = attrs['product'].name
        return attrs