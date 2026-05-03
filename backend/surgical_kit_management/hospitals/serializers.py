from rest_framework import serializers
from .models import Hospital

class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = ('id', 'name', 'address', 'city', 'country', 'phone', 'email', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')
