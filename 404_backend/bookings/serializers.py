from rest_framework import serializers
from .models import Booking, ParkingSlot
from rest_framework.exceptions import ValidationError


class ParkingSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ParkingSlot
        fields = '__all__'


class BookingSerializer(serializers.ModelSerializer):
    # User info
    user_email = serializers.CharField(source='user.email',    read_only=True)
    user_name  = serializers.CharField(source='user.username', read_only=True)
    user_phone = serializers.CharField(source='user.phone',    read_only=True)

    # Vehicle info (expanded for admin)
    vehicle_name  = serializers.CharField(source='vehicle.car_name',     read_only=True)
    vehicle_model = serializers.CharField(source='vehicle.model',        read_only=True)
    vehicle_color = serializers.CharField(source='vehicle.color',        read_only=True)
    vehicle_plate = serializers.CharField(source='vehicle.number_plate', read_only=True)
    vehicle_image = serializers.ImageField(source='vehicle.image',       read_only=True)

    # Service info
    service_names = serializers.SerializerMethodField()
    total_price   = serializers.SerializerMethodField()

    # Payment
    payment_status = serializers.SerializerMethodField()

    # Parking slot (nested read)
    parking_slot_detail = ParkingSlotSerializer(source='parking_slot', read_only=True)

    def get_service_names(self, obj):
        return ", ".join([s.name for s in obj.services.all()])

    def get_total_price(self, obj):
        return sum([s.price for s in obj.services.all()])

    def get_payment_status(self, obj):
        if hasattr(obj, 'payment'):
            return obj.payment.status
        return 'not_paid'

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.user and not request.user.phone:
            raise ValidationError({"phone": "A phone number is required to make a booking."})
        return super().validate(attrs)

    class Meta:
        model  = Booking
        fields = '__all__'
        read_only_fields = ['user']