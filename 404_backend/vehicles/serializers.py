from rest_framework import serializers
from .models import Vehicle

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'
        read_only_fields = ['user']

    def validate_number_plate(self, value):
        # Ignore case and spacing for true uniqueness check
        normalized_val = str(value).replace(" ", "").upper()
        
        # Check if any vehicle exists with this exact or similar plate
        for vehicle in Vehicle.objects.all():
            if str(vehicle.number_plate).replace(" ", "").upper() == normalized_val:
                raise serializers.ValidationError("A vehicle with this license plate is already registered.")
        
        return value