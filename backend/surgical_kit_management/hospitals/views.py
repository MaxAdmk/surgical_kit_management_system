from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Hospital
from .serializers import HospitalSerializer

class HospitalViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Hospitals list is public (for registration).
    Authenticated users can only see hospitals they're associated with.
    """
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Anonymous users can see all hospitals (for registration)
        user = self.request.user
        
        # If user is authenticated, filter to only their hospital
        if user.is_authenticated and user.hospital:
            return Hospital.objects.filter(id=user.hospital.id)
        
        # If not authenticated (e.g., during registration), show all
        if not user.is_authenticated:
            return Hospital.objects.all()
        
        return Hospital.objects.none()
