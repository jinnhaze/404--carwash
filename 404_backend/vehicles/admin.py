from django.contrib import admin
from .models import Vehicle

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('car_name', 'model', 'number_plate', 'user', 'image')
    search_fields = ('number_plate', 'car_name')