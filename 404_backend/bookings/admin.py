from django.contrib import admin
from .models import Booking, Payment

class BookingAdmin(admin.ModelAdmin):
    list_display = ('user_name', 'user_phone', 'user_email', 'vehicle', 'service', 'booking_date', 'booking_time', 'status', 'is_approved')
    list_filter = ('status', 'is_approved', 'booking_date')
    search_fields = ('user__username', 'user__phone', 'user__email', 'vehicle__car_name', 'vehicle__number_plate')

    def user_name(self, obj):
        return obj.user.username
    user_name.short_description = 'User Name'

    def user_phone(self, obj):
        return obj.user.phone
    user_phone.short_description = 'Phone Number'

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'

class PaymentAdmin(admin.ModelAdmin):
    list_display = ('booking', 'amount', 'status', 'payment_method', 'created_at')
    list_filter = ('status', 'payment_method')

admin.site.register(Booking, BookingAdmin)
admin.site.register(Payment, PaymentAdmin)