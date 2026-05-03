from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Instrument, Kit
from .serializers import InstrumentSerializer, KitSerializer


class InstrumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing medical instruments.
    
    Provides CRUD operations for instruments that can be added to surgical kits.
    Only authenticated users can access this endpoint.
    """
    
    queryset = Instrument.objects.all()
    serializer_class = InstrumentSerializer
    permission_classes = [IsAuthenticated]


class KitViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing surgical kits.
    
    Features:
    - List only kits created by the current user (doctor)
    - Create new kits with associated instruments
    - Update existing kits
    - Delete kits
    - Search kits by name or operation type
    
    Only authenticated users can access this endpoint.
    """
    
    serializer_class = KitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return kits created only by the current user."""
        return Kit.objects.filter(doctor=self.request.user)

    def perform_create(self, serializer):
        """Automatically set the doctor who creates the kit."""
        serializer.save(doctor=self.request.user)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search kits by name or operation type.
        
        Query Parameters:
            - q: Search query for kit name (case-insensitive)
            - operation_type: Filter by operation type
            
        Example: /api/kits/search/?q=appendectomy&operation_type=General%20Surgery
        """
        queryset = self.get_queryset()
        
        search_query = request.query_params.get('q', '').strip()
        operation_type = request.query_params.get('operation_type', '').strip()
        
        if search_query:
            queryset = queryset.filter(name__icontains=search_query)
        
        if operation_type:
            queryset = queryset.filter(operation_type=operation_type)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)