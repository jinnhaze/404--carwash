from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Vehicle(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    car_name = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    number_plate = models.CharField(max_length=20, unique=True)
    color = models.CharField(max_length=50)
    image = models.ImageField(upload_to='vehicle_photos/', null=True, blank=True)

    def __str__(self):
        return self.number_plate