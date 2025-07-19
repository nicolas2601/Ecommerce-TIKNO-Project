from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from decimal import Decimal
from .models import Category, Product, ProductImage
from .serializers import CategorySerializer, ProductSerializer

User = get_user_model()


class CategoryModelTest(TestCase):
    """Tests para el modelo Category"""
    
    def setUp(self):
        self.category = Category.objects.create(
            name='Electrónicos',
            description='Productos electrónicos y tecnología',
            image_url='https://example.com/electronics.jpg'
        )
    
    def test_category_creation(self):
        """Test creación de categoría"""
        self.assertEqual(self.category.name, 'Electrónicos')
        self.assertEqual(self.category.slug, 'electronicos')
        self.assertTrue(self.category.is_active)
        self.assertIsNotNone(self.category.created_at)
    
    def test_category_string_representation(self):
        """Test representación string de categoría"""
        self.assertEqual(str(self.category), 'Electrónicos')
    
    def test_category_slug_generation(self):
        """Test generación automática de slug"""
        category = Category.objects.create(name='Ropa y Accesorios')
        self.assertEqual(category.slug, 'ropa-y-accesorios')


class ProductModelTest(TestCase):
    """Tests para el modelo Product"""
    
    def setUp(self):
        self.category = Category.objects.create(
            name='Electrónicos',
            description='Productos electrónicos'
        )
        self.product = Product.objects.create(
            name='iPhone 15',
            description='Último modelo de iPhone',
            price=Decimal('999.99'),
            stock=10,
            category=self.category,
            main_image_url='https://example.com/iphone15.jpg'
        )
    
    def test_product_creation(self):
        """Test creación de producto"""
        self.assertEqual(self.product.name, 'iPhone 15')
        self.assertEqual(self.product.price, Decimal('999.99'))
        self.assertEqual(self.product.stock, 10)
        self.assertEqual(self.product.category, self.category)
        self.assertTrue(self.product.is_active)
        self.assertFalse(self.product.is_featured)
    
    def test_product_string_representation(self):
        """Test representación string de producto"""
        self.assertEqual(str(self.product), 'iPhone 15')
    
    def test_product_slug_generation(self):
        """Test generación automática de slug"""
        product = Product.objects.create(
            name='Samsung Galaxy S24',
            description='Smartphone Samsung',
            price=Decimal('899.99'),
            stock=5,
            category=self.category
        )
        self.assertEqual(product.slug, 'samsung-galaxy-s24')
    
    def test_product_is_in_stock(self):
        """Test propiedad is_in_stock"""
        self.assertTrue(self.product.is_in_stock)
        
        # Producto sin stock
        product_no_stock = Product.objects.create(
            name='Producto sin stock',
            description='Test',
            price=Decimal('100.00'),
            stock=0,
            category=self.category
        )
        self.assertFalse(product_no_stock.is_in_stock)


class ProductImageModelTest(TestCase):
    """Tests para el modelo ProductImage"""
    
    def setUp(self):
        self.category = Category.objects.create(name='Test Category')
        self.product = Product.objects.create(
            name='Test Product',
            description='Test description',
            price=Decimal('100.00'),
            stock=5,
            category=self.category
        )
        self.product_image = ProductImage.objects.create(
            product=self.product,
            image_url='https://example.com/image1.jpg',
            alt_text='Imagen principal',
            is_main=True,
            order=1
        )
    
    def test_product_image_creation(self):
        """Test creación de imagen de producto"""
        self.assertEqual(self.product_image.product, self.product)
        self.assertTrue(self.product_image.is_main)
        self.assertEqual(self.product_image.order, 1)
    
    def test_product_image_string_representation(self):
        """Test representación string de imagen de producto"""
        expected = f'{self.product.name} - Imagen {self.product_image.order}'
        self.assertEqual(str(self.product_image), expected)


class CategoryAPITest(APITestCase):
    """Tests para la API de categorías"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.admin_user = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpass123',
            first_name='Admin',
            last_name='User'
        )
        
        self.category = Category.objects.create(
            name='Electrónicos',
            description='Productos electrónicos'
        )
    
    def get_jwt_token(self, user):
        """Helper para obtener token JWT"""
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)
    
    def test_get_categories_list(self):
        """Test obtener lista de categorías (público)"""
        url = reverse('products:category-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Electrónicos')
    
    def test_get_category_detail(self):
        """Test obtener detalle de categoría (público)"""
        url = reverse('products:category-detail', kwargs={'slug': self.category.slug})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Electrónicos')
    
    def test_create_category_requires_admin(self):
        """Test crear categoría requiere permisos de admin"""
        url = reverse('products:category-list')
        data = {
            'name': 'Nueva Categoría',
            'description': 'Descripción de prueba'
        }
        
        # Sin autenticación
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Con usuario normal
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Con admin
        admin_token = self.get_jwt_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Nueva Categoría')


class ProductAPITest(APITestCase):
    """Tests para la API de productos"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.admin_user = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpass123',
            first_name='Admin',
            last_name='User'
        )
        
        self.category = Category.objects.create(
            name='Electrónicos',
            description='Productos electrónicos'
        )
        
        self.product = Product.objects.create(
            name='iPhone 15',
            description='Último modelo de iPhone',
            price=Decimal('999.99'),
            stock=10,
            category=self.category,
            is_featured=True
        )
    
    def get_jwt_token(self, user):
        """Helper para obtener token JWT"""
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)
    
    def test_get_products_list(self):
        """Test obtener lista de productos (público)"""
        url = reverse('products:product-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'iPhone 15')
    
    def test_get_product_detail(self):
        """Test obtener detalle de producto (público)"""
        url = reverse('products:product-detail', kwargs={'slug': self.product.slug})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'iPhone 15')
        self.assertEqual(float(response.data['price']), 999.99)
    
    def test_filter_products_by_category(self):
        """Test filtrar productos por categoría"""
        url = reverse('products:product-list')
        response = self.client.get(url, {'category': self.category.pk})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_filter_featured_products(self):
        """Test filtrar productos destacados"""
        url = reverse('products:product-list')
        response = self.client.get(url, {'featured': 'true'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertTrue(response.data['results'][0]['is_featured'])
    
    def test_search_products(self):
        """Test búsqueda de productos"""
        url = reverse('products:product-list')
        response = self.client.get(url, {'search': 'iPhone'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_create_product_requires_admin(self):
        """Test crear producto requiere permisos de admin"""
        url = reverse('products:product-list')
        data = {
            'name': 'Nuevo Producto',
            'description': 'Descripción de prueba',
            'price': '199.99',
            'stock': 5,
            'category': self.category.pk
        }
        
        # Sin autenticación
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Con usuario normal
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Con admin
        admin_token = self.get_jwt_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Nuevo Producto')
