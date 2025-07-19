from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from decimal import Decimal
from .models import Cart, CartItem, Order, OrderItem
from products.models import Category, Product
from .serializers import CartSerializer, OrderSerializer

User = get_user_model()


class CartModelTest(TestCase):
    """Tests para el modelo Cart"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.cart = Cart.objects.create(user=self.user)
        
        self.category = Category.objects.create(
            name='Electrónicos',
            description='Productos electrónicos'
        )
        self.product = Product.objects.create(
            name='iPhone 15',
            description='Último modelo de iPhone',
            price=Decimal('999.99'),
            stock=10,
            category=self.category
        )
        self.product2 = Product.objects.create(
            name='Samsung Galaxy S24',
            description='Teléfono Samsung',
            price=Decimal('799.99'),
            stock=5,
            category=self.category
        )
        self.product2 = Product.objects.create(
            name='Samsung Galaxy Note',
            description='Teléfono Samsung',
            price=Decimal('799.99'),
            stock=5,
            category=self.category
        )
    
    def test_cart_creation(self):
        """Test creación de carrito"""
        self.assertEqual(self.cart.user, self.user)
        self.assertIsNotNone(self.cart.created_at)
        self.assertEqual(self.cart.total_items, 0)
        self.assertEqual(self.cart.total_price, 0)
    
    def test_cart_string_representation(self):
        """Test representación string de carrito"""
        expected = f'Carrito de {self.user.email}'
        self.assertEqual(str(self.cart), expected)
    
    def test_cart_total_items(self):
        """Test cálculo de total de items"""
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
            price=self.product.price
        )
        self.assertEqual(self.cart.total_items, 2)
    
    def test_cart_total_price(self):
        """Test cálculo de precio total"""
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
            price=self.product.price
        )
        expected_total = 2 * self.product.price
        self.assertEqual(self.cart.total_price, expected_total)
    
    def test_cart_clear(self):
        """Test limpiar carrito"""
        CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
            price=self.product.price
        )
        self.assertEqual(self.cart.total_items, 2)
        
        self.cart.clear()
        self.assertEqual(self.cart.total_items, 0)


class CartItemModelTest(TestCase):
    """Tests para el modelo CartItem"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.cart = Cart.objects.create(user=self.user)
        
        self.category = Category.objects.create(
            name='Electrónicos',
            description='Productos electrónicos'
        )
        self.product = Product.objects.create(
            name='iPhone 15',
            description='Último modelo de iPhone',
            price=Decimal('999.99'),
            stock=10,
            category=self.category
        )
        self.product2 = Product.objects.create(
            name='Samsung Galaxy S24',
            description='Teléfono Samsung',
            price=Decimal('799.99'),
            stock=5,
            category=self.category
        )
        
        self.cart_item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2
        )
    
    def test_cart_item_creation(self):
        """Test creación de item de carrito"""
        self.assertEqual(self.cart_item.cart, self.cart)
        self.assertEqual(self.cart_item.product, self.product)
        self.assertEqual(self.cart_item.quantity, 2)
        self.assertEqual(self.cart_item.price, self.product.price)
    
    def test_cart_item_string_representation(self):
        """Test representación string de item de carrito"""
        expected = f'{self.cart_item.quantity} x {self.product.name}'
        self.assertEqual(str(self.cart_item), expected)
    
    def test_cart_item_total_price(self):
        """Test cálculo de precio total del item"""
        expected_total = self.cart_item.quantity * self.cart_item.price
        self.assertEqual(self.cart_item.get_total_price(), expected_total)
    
    def test_cart_item_auto_price_assignment(self):
        """Test asignación automática de precio"""
        # Crear item sin precio específico
        new_item = CartItem.objects.create(
            cart=self.cart,
            product=self.product2,
            quantity=1
        )
        self.assertEqual(new_item.price, self.product2.price)


class OrderModelTest(TestCase):
    """Tests para el modelo Order"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
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
            category=self.category
        )
        
        self.order = Order.objects.create(
            user=self.user,
            total=Decimal('1999.98'),
            shipping_address='Calle 123',
            shipping_city='Ciudad',
            shipping_postal_code='12345',
            shipping_phone='+1234567890'
        )
    
    def test_order_creation(self):
        """Test creación de orden"""
        self.assertEqual(self.order.user, self.user)
        self.assertEqual(self.order.total, Decimal('1999.98'))
        self.assertEqual(self.order.status, 'pending')
        self.assertIsNotNone(self.order.order_number)
        self.assertTrue(self.order.order_number.startswith('ORD-'))
    
    def test_order_string_representation(self):
        """Test representación string de orden"""
        expected = f'Orden {self.order.order_number}'
        self.assertEqual(str(self.order), expected)
    
    def test_order_number_generation(self):
        """Test generación automática de número de orden"""
        new_order = Order.objects.create(
            user=self.user,
            total=Decimal('500.00'),
            shipping_address='Otra dirección',
            shipping_city='Otra ciudad',
            shipping_postal_code='54321',
            shipping_phone='+0987654321'
        )
        self.assertIsNotNone(new_order.order_number)
        self.assertTrue(new_order.order_number.startswith('ORD-'))
        self.assertNotEqual(new_order.order_number, self.order.order_number)
    
    def test_order_total_items(self):
        """Test cálculo de total de items en orden"""
        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=2,
            price=self.product.price
        )
        self.assertEqual(self.order.total_items, 2)


class OrderItemModelTest(TestCase):
    """Tests para el modelo OrderItem"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
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
            category=self.category
        )
        
        self.order = Order.objects.create(
            user=self.user,
            total=Decimal('1999.98'),
            shipping_address='Calle 123',
            shipping_city='Ciudad',
            shipping_postal_code='12345',
            shipping_phone='+1234567890'
        )
        
        self.order_item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=2,
            price=self.product.price
        )
    
    def test_order_item_creation(self):
        """Test creación de item de orden"""
        self.assertEqual(self.order_item.order, self.order)
        self.assertEqual(self.order_item.product, self.product)
        self.assertEqual(self.order_item.quantity, 2)
        self.assertEqual(self.order_item.price, self.product.price)
    
    def test_order_item_string_representation(self):
        """Test representación string de item de orden"""
        expected = f'{self.order_item.quantity} x {self.product.name}'
        self.assertEqual(str(self.order_item), expected)
    
    def test_order_item_total_price(self):
        """Test cálculo de precio total del item"""
        expected_total = self.order_item.quantity * self.order_item.price
        self.assertEqual(self.order_item.get_total_price(), expected_total)


class CartAPITest(APITestCase):
    """Tests para la API de carrito"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
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
            category=self.category
        )
    
    def get_jwt_token(self, user):
        """Helper para obtener token JWT"""
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)
    
    def test_get_cart_requires_authentication(self):
        """Test obtener carrito requiere autenticación"""
        url = reverse('orders:cart-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_get_user_cart(self):
        """Test obtener carrito del usuario autenticado"""
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = reverse('orders:cart-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('id', response.data)  # Debe devolver un objeto carrito
        self.assertIn('items', response.data)  # Con lista de items
    
    def test_add_item_to_cart(self):
        """Test agregar item al carrito"""
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Agregar item usando la acción add_item
        add_item_url = reverse('orders:cart-add-item')
        data = {
            'product_id': self.product.id,
            'quantity': 2
        }
        response = self.client.post(add_item_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['quantity'], 2)


class OrderAPITest(APITestCase):
    """Tests para la API de órdenes"""
    
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
            category=self.category
        )
        self.product2 = Product.objects.create(
            name='Samsung Galaxy Ultra',
            description='Teléfono Samsung',
            price=Decimal('799.99'),
            stock=5,
            category=self.category
        )
        
        # Crear carrito con items
        self.cart = Cart.objects.create(user=self.user)
        self.cart_item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=1,
            price=self.product.price
        )
    
    def get_jwt_token(self, user):
        """Helper para obtener token JWT"""
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)
    
    def test_get_orders_requires_authentication(self):
        """Test obtener órdenes requiere autenticación"""
        url = reverse('orders:order-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_get_user_orders(self):
        """Test obtener órdenes del usuario autenticado"""
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Crear una orden
        Order.objects.create(
            user=self.user,
            total=Decimal('999.99'),
            shipping_address='Calle 123',
            shipping_city='Ciudad',
            shipping_postal_code='12345',
            shipping_phone='+1234567890'
        )
        
        url = reverse('orders:order-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_create_order_from_cart(self):
        """Test crear orden desde carrito"""
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = reverse('orders:order-list')
        data = {
            'shipping_address': 'Calle 123',
            'shipping_city': 'Ciudad',
            'shipping_postal_code': '12345',
            'shipping_phone': '+1234567890'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(response.data['order_number'])
        self.assertEqual(len(response.data['items']), 1)
    
    def test_update_order_status_requires_admin(self):
        """Test actualizar estado de orden requiere permisos de admin"""
        # Crear orden
        order = Order.objects.create(
            user=self.user,
            total=Decimal('999.99'),
            shipping_address='Calle 123',
            shipping_city='Ciudad',
            shipping_postal_code='12345',
            shipping_phone='+1234567890'
        )
        
        url = reverse('orders:order-update-status', kwargs={'pk': order.pk})
        data = {'status': 'processing'}
        
        # Sin autenticación
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Con usuario normal
        token = self.get_jwt_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Con admin
        admin_token = self.get_jwt_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'processing')
