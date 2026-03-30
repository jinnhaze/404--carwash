from django.db import models
from django.conf import settings
from vehicles.models import Vehicle
from services.models import Service
from services.models import TimeSlot

User = settings.AUTH_USER_MODEL


class ParkingSlot(models.Model):
    ZONE_CHOICES = [
        ('VIP',    'VIP'),
        ('Zone A', 'Zone A'),
        ('Zone B', 'Zone B'),
        ('Zone C', 'Zone C'),
    ]
    zone           = models.CharField(max_length=20, choices=ZONE_CHOICES)
    slot_number    = models.CharField(max_length=10, unique=True)   # e.g. P01
    floor          = models.IntegerField(default=0)
    price_per_hour = models.DecimalField(max_digits=8, decimal_places=2, default=99)
    is_available   = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.zone} – {self.slot_number} (Floor {self.floor})"


class Booking(models.Model):

    STATUS_CHOICES = (
        ('pending',          'Awaiting Approval'),
        ('confirmed',        'Confirmed'),
        ('queued',           'In Queue'),
        ('pre_wash',         'Pre-Wash Inspection'),
        ('washing',          'Deep Cleaning'),
        ('detailing',        'Precision Detailing'),
        ('waxing',           'Wax & Polish'),
        ('inspection_final', 'Final Quality Check'),
        ('ready',            'Ready for Handover'),
        ('completed',        'Service Completed'),
        ('cancelled',        'Cancelled'),
    )

    user    = models.ForeignKey(User, on_delete=models.CASCADE)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    services = models.ManyToManyField(Service)

    booking_date = models.DateField(null=True, blank=True)
    booking_time = models.TimeField(null=True, blank=True)
    slot         = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, null=True, blank=True)

    parking_slot = models.ForeignKey(
        ParkingSlot, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='bookings'
    )

    pickup_address = models.CharField(max_length=255, blank=True, null=True)
    latitude       = models.FloatField(null=True, blank=True)
    longitude      = models.FloatField(null=True, blank=True)

    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_approved = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Free the parking slot when booking ends
        if self.pk:
            try:
                old = Booking.objects.get(pk=self.pk)
                if old.status != self.status and self.status in ('completed', 'cancelled'):
                    if self.parking_slot:
                        self.parking_slot.is_available = True
                        self.parking_slot.save()
            except Booking.DoesNotExist:
                pass
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.vehicle} - {self.id}"


class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('pending',   'Pending'),
        ('completed', 'Completed'),
        ('failed',    'Failed'),
    )

    booking        = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    amount         = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    status         = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=50, default='dummy')
    razorpay_order_id   = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature  = models.CharField(max_length=255, blank=True, null=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment for {self.booking.vehicle} - {self.amount}"