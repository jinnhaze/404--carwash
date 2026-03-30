from django.core.management.base import BaseCommand
from bookings.models import ParkingSlot


SLOTS = [
    # (zone, slot_number, floor, price_per_hour)
    ('VIP',    'P08', 1, 159), ('VIP',    'P12', 2, 139),
    ('Zone A', 'P01', 0, 119), ('Zone A', 'P05', 1,  99),
    ('Zone A', 'P09', 1, 179), ('Zone A', 'P13', 0, 159),
    ('Zone B', 'P02', 1, 139), ('Zone B', 'P06', 2, 119),
    ('Zone B', 'P10', 0,  99), ('Zone B', 'P14', 1, 179),
    ('Zone C', 'P03', 2, 159), ('Zone C', 'P07', 0, 139),
    ('Zone C', 'P11', 1, 119), ('Zone C', 'P15', 2,  99),
    ('VIP',    'P16', 0, 199), ('Zone A', 'P17', 2, 109),
    ('Zone B', 'P18', 1, 149), ('Zone C', 'P19', 0, 129),
    ('VIP',    'P20', 3, 249), ('Zone A', 'P21', 0,  89),
]


class Command(BaseCommand):
    help = 'Seed initial parking slots'

    def handle(self, *args, **kwargs):
        created = 0
        for zone, slot_number, floor, price in SLOTS:
            obj, was_created = ParkingSlot.objects.get_or_create(
                slot_number=slot_number,
                defaults=dict(zone=zone, floor=floor, price_per_hour=price, is_available=True)
            )
            if was_created:
                created += 1
        self.stdout.write(self.style.SUCCESS(f'✅ Seeded {created} parking slots ({ParkingSlot.objects.count()} total)'))
