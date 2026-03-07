from django.db import models

class Service(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    duration = models.CharField(max_length=50)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name
    
class TimeSlot(models.Model):
    start_time = models.TimeField()
    end_time = models.TimeField()
    max_bookings = models.IntegerField(default=3)

    def __str__(self):
        return f"{self.start_time} - {self.end_time}"    