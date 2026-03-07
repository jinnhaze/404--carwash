from rest_framework import serializers
from .models import Booking
from rest_framework.exceptions import ValidationError

class BookingSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_phone = serializers.CharField(source='user.phone', read_only=True)
    vehicle_name = serializers.CharField(source='vehicle.car_name', read_only=True)
    vehicle_plate = serializers.CharField(source='vehicle.number_plate', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    payment_status = serializers.SerializerMethodField()

    def get_payment_status(self, obj):
        if hasattr(obj, 'payment'):
            return obj.payment.status
        return 'not_paid'

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.user and not request.user.phone:
            raise ValidationError({"phone": "A phone number is required to make a booking. Please update your profile."})
        return super().validate(attrs)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['user']