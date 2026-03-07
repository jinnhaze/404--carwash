from django.urls import path
from .views import RegisterView, CustomTokenObtainPairView, AdminTokenObtainPairView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', CustomTokenObtainPairView.as_view()),
    path('admin-login/', AdminTokenObtainPairView.as_view()),
]