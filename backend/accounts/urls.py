from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    UserProfileView,
    logout_view,
    PasswordResetView,
    PasswordResetConfirmView,
    ChangePasswordView,
    supabase_webhook,
    sync_supabase_user
)

app_name = 'accounts'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', logout_view, name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('password/reset/', PasswordResetView.as_view(), name='password_reset'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('password/change/', ChangePasswordView.as_view(), name='change_password'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Endpoints de sincronización con Supabase
    path('supabase/webhook/', supabase_webhook, name='supabase_webhook'),
    path('supabase/sync/', sync_supabase_user, name='sync_supabase_user'),
]