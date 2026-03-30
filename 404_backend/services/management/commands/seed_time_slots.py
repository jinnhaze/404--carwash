from django.core.management.base import BaseCommand
from services.models import TimeSlot
from datetime import datetime, time, timedelta


class Command(BaseCommand):
    help = 'Seed 15-minute time slots from 6 AM to 6 PM'

    def handle(self, *args, **kwargs):
        # Clear existing slots
        TimeSlot.objects.all().delete()
        self.stdout.write(self.style.WARNING('Clearing existing time slots...'))

        start_h, start_m = 6, 0   # 6 AM
        end_h, end_m = 18, 0      # 6 PM
        
        current_time = datetime.combine(datetime.today(), time(start_h, start_m))
        end_time = datetime.combine(datetime.today(), time(end_h, end_m))
        
        interval = timedelta(minutes=15)
        created_count = 0
        
        while current_time < end_time:
            slot_start = current_time.time()
            current_time += interval
            slot_end = current_time.time()
            
            TimeSlot.objects.create(
                start_time=slot_start,
                end_time=slot_end,
                max_bookings=5  # Default slots to 5 vehicles per 15 mins
            )
            created_count += 1
            
        self.stdout.write(self.style.SUCCESS(f'✅ Successfully seeded {created_count} time slots (6 AM - 6 PM, 15-min intervals)'))
