from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import AuthenticationFailed
from .models import User
from .serializers import RegisterSerializer

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        # Optional: You can explicitly block admins from logging into the mobile app here if you want.
        # But for now, we just let it function normally as the main user endpoint.
        return response

class AdminTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        # After successful authentication, check if the user is staff/admin
        username = request.data.get('username')
        try:
            user = User.objects.get(username=username)
            if not (user.is_staff or user.is_superuser):
                raise AuthenticationFailed("Access restricted. This account does not have staff privileges.")
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found.")
            
        return response