from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that reads tokens from cookies AND Authorization header.
    SimpleJWT by default only reads from Authorization header, but we also set tokens in cookies.
    """
    
    def authenticate(self, request):
        # First, check if we have an Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if auth_header:
            # If Authorization header exists, use parent's implementation
            return super().authenticate(request)
        
        # Try to get token from cookies
        access_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
        
        if access_token:
            # Set the Authorization header from the cookie
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
            logger.info(f"Token found in cookie for user: {request.user if hasattr(request, 'user') else 'unknown'}")
            return super().authenticate(request)
        
        # No token found in either place - return None to indicate this auth method didn't find credentials
        return None


