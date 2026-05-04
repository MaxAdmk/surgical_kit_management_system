from rest_framework import serializers
from .models import Instrument, Kit, KitItem


class InstrumentSerializer(serializers.ModelSerializer):
    """Serializer for medical instruments."""
    
    class Meta:
        model = Instrument
        fields = '__all__'


class KitItemSerializer(serializers.ModelSerializer):
    """
    Serializer for individual items within a kit.
    
    Uses PrimaryKeyRelatedField for writing (accepts instrument ID)
    and InstrumentSerializer for reading (displays full instrument details).
    """
    
    instrument_id = serializers.PrimaryKeyRelatedField(
        queryset=Instrument.objects.all(),
        source='instrument',
        help_text="ID of the instrument to add to the kit"
    )
    
    instrument_details = InstrumentSerializer(
        source='instrument',
        read_only=True,
        help_text="Full details of the instrument"
    )

    class Meta:
        model = KitItem
        fields = ('id', 'instrument_id', 'instrument_details', 'quantity', 'status')


class KitSerializer(serializers.ModelSerializer):
    """
    Serializer for surgical kits with nested items.
    
    Handles creation and update of kits along with their associated instruments.
    """
    
    items = KitItemSerializer(many=True)

    class Meta:
        model = Kit
        fields = ('id', 'name', 'operation_type', 'description', 'doctor', 'created_at', 'items')
        read_only_fields = ('doctor', 'created_at')

    def create(self, validated_data):
        """Create a new kit with associated instruments."""
        items_data = validated_data.pop('items')
        kit = Kit.objects.create(**validated_data)
        
        for item_data in items_data:
            KitItem.objects.create(kit=kit, **item_data)
        
        return kit

    def update(self, instance, validated_data):
        """Update kit details and replace all associated instruments."""
        items_data = validated_data.pop('items', None)
        
        # Update basic kit fields
        instance.name = validated_data.get('name', instance.name)
        instance.operation_type = validated_data.get('operation_type', instance.operation_type)
        instance.description = validated_data.get('description', instance.description)
        instance.save()

        # Replace instruments if new list provided
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                KitItem.objects.create(kit=instance, **item_data)
                
        return instance