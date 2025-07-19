from django.test import TestCase
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from products.models import Category, Product
from core.validators import (
    validate_positive_price, validate_non_negative_stock,
    validate_phone_number, validate_url_format
)
from core.permissions import IsAdminOrReadOnly, IsOwnerOrReadOnly
from core.exceptions import InsufficientStockException

User = get_user_model()


class ValidatorsTestCase(TestCase):
    """Tests para validadores personalizados"""
    
    def test_validate_positive_price(self):
        """Test validación de precio positivo"""
        # Precio válido
        validate_positive_price(10.50)
        
        # Precio inválido
        with self.assertRaises(ValidationError):
            validate_positive_price(0)
        
        with self.assertRaises(ValidationError):
            validate_positive_price(-5.50)
    
    def test_validate_non_negative_stock(self):
        """Test validación de stock no negativo"""
        # Stock válido
        validate_non_negative_stock(0)
        validate_non_negative_stock(10)
        
        # Stock inválido
        with self.assertRaises(ValidationError):
            validate_non_negative_stock(-1)
    
    def test_validate_phone_number(self):
        """Test validación de número de teléfono"""
        # Números válidos
        validate_phone_number("+1234567890")
        validate_phone_number("123-456-7890")
        validate_phone_number("(123) 456-7890")
        
        # Números inválidos
        with self.assertRaises(ValidationError):
            validate_phone_number("abc123")
        
        with self.assertRaises(ValidationError):
            validate_phone_number("123")
    
    def test_validate_url_format(self):
        """Test validación de formato de URL"""
        # URLs válidas
        validate_url_format("https://example.com/image.jpg")
        validate_url_format("http://test.com/photo.png")
        
        # URLs inválidas
        with self.assertRaises(ValidationError):
            validate_url_format("not-a-url")
        
        with self.assertRaises(ValidationError):
            validate_url_format("ftp://example.com")


class PermissionsTestCase(APITestCase):
    """Tests para permisos personalizados"""
    
    def setUp(self):
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='testpass123',
            first_name='Admin',
            last_name='User',
            is_staff=True
        )
        
        self.regular_user = User.objects.create_user(
            email='user@test.com',
            password='testpass123',
            first_name='Regular',
            last_name='User'
        )
        
        self.category = Category.objects.create(
            name='Test Category',
            description='Test description'
        )
    
    def test_admin_or_read_only_permission(self):
        """Test permiso IsAdminOrReadOnly"""
        # Test como usuario anónimo (solo lectura)
        response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Test creación como usuario anónimo (prohibido)
        response = self.client.post('/api/categories/', {
            'name': 'New Category',
            'description': 'New description'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Test creación como usuario regular (prohibido)
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.post('/api/categories/', {
            'name': 'New Category',
            'description': 'New description'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Test creación como admin (permitido)
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post('/api/categories/', {
            'name': 'New Category',
            'description': 'New description'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class ExceptionsTestCase(TestCase):
    """Tests para excepciones personalizadas"""
    
    def test_insufficient_stock_exception(self):
        """Test excepción de stock insuficiente"""
        exception = InsufficientStockException(available_stock=5, requested_quantity=10)
        
        self.assertIn('Stock insuficiente', str(exception))
        self.assertIn('5', str(exception))
        self.assertIn('10', str(exception))


class ModelValidationTestCase(TestCase):
    """Tests para validaciones en modelos"""
    
    def setUp(self):
        self.category = Category.objects.create(
            name='Test Category',
            description='Test description'
        )
    
    def test_product_price_validation(self):
        """Test validación de precio en modelo Product"""
        # Producto con precio válido
        product = Product(
            name='Test Product',
            description='Test description',
            price=10.50,
            stock=5,
            category=self.category
        )
        product.full_clean()  # No debe lanzar excepción
        
        # Producto con precio inválido
        product_invalid = Product(
            name='Test Product Invalid',
            description='Test description',
            price=-5.50,
            stock=5,
            category=self.category
        )
        
        with self.assertRaises(ValidationError):
            product_invalid.full_clean()
    
    def test_product_stock_validation(self):
        """Test validación de stock en modelo Product"""
        # Producto con stock inválido
        product = Product(
            name='Test Product',
            description='Test description',
            price=10.50,
            stock=-1,
            category=self.category
        )
        
        with self.assertRaises(ValidationError):
            product.full_clean()
