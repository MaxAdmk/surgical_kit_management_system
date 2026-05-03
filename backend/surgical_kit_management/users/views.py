from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from .serializers import UserRegistrationSerializer
import logging

logger = logging.getLogger(__name__)

class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    # Add rate limiting: max 5 registrations per hour per IP
    @method_decorator(ratelimit(key='ip', rate='5/h', method='POST'))
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.perform_create(serializer)
        
        # Log registration event
        logger.info(f"New user registered: {serializer.data.get('email')}")
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            {"message": "User created successfully!", "user": serializer.data}, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )

    def perform_create(self, serializer):
        return serializer.save()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view that sets JWT tokens as HTTP-only cookies"""
    permission_classes = [AllowAny]
    
    # Add rate limiting: max 10 login attempts per hour per IP
    @method_decorator(ratelimit(key='ip', rate='10/h', method='POST'))
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            tokens = response.data
            access_token = tokens.get('access')
            refresh_token = tokens.get('refresh')
            
            # Extract email from request for logging
            email = request.data.get('email', 'unknown')
            logger.info(f"Successful login for user: {email}")
            
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=access_token,
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            )
            
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                value=refresh_token,
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            )
            
            response.data = {'message': 'Successful login!'}
        else:
            email = request.data.get('email', 'unknown')
            logger.warning(f"Failed login attempt for user: {email}")
        
        return response


class CustomTokenRefreshView(TokenRefreshView):
    """Custom refresh token view that works with HTTP-only cookies"""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # Get refresh token from cookies
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        
        if refresh_token:
            request.data._mutable = True
            request.data['refresh'] = refresh_token
            request.data._mutable = False
        
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            access_token = response.data.get('access')
            
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=access_token,
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            )
            
            response.data = {'message': 'Token refreshed successfully!'}
        
        return response


class CsrfTokenView(views.APIView):
    """Endpoint to get CSRF token for frontend"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Provide CSRF token to frontend"""
        csrf_token = get_token(request)
        return Response(
            {'csrfToken': csrf_token},
            status=status.HTTP_200_OK
        )


class LogoutView(views.APIView):
    """Logout endpoint that clears authentication cookies"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Clear authentication cookies and log user logout"""
        try:
            response = Response(
                {'message': 'Successfully logged out!'},
                status=status.HTTP_200_OK
            )
            
            # Clear JWT tokens from cookies
            response.delete_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            )
            response.delete_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            )
            
            # Log logout event for audit trail
            logger.info(f"User logged out successfully. User ID: {request.user.id if request.user.is_authenticated else 'anonymous'}")
            
            return response
            
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return Response(
                {'error': 'Logout failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserProfileView(views.APIView):
    """Get current user profile"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Return current user's profile including role"""
        user = request.user
        return Response(
            {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role,
            },
            status=status.HTTP_200_OK
        )