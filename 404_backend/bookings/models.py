from django.db import models
from django.conf import settings
from vehicles.models import Vehicle
from services.models import Service
from services.models import TimeSlot

User = settings.AUTH_USER_MODEL

class Booking(models.Model):

    STATUS_CHOICES = (
    ('pending', 'Pending'),
    ('pickup_scheduled', 'Pickup Scheduled'),
    ('picked_up', 'Vehicle Picked Up'),
    ('washing', 'Washing In Progress'),
    ('coating', 'Ceramic Coating'),
    ('completed', 'Completed'),
    ('cancelled', 'Cancelled'),
)

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)

    booking_date = models.DateField(null=True, blank=True)
    booking_time = models.TimeField(null=True, blank=True)
    slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, null=True, blank=True)

    pickup_address = models.CharField(max_length=255, blank=True, null=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_approved = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vehicle} - {self.service}"

class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=50, default='dummy')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment for {self.booking.vehicle} - {self.amount}"