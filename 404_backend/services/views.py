from rest_framework import generics
from .models import Service,TimeSlot
from .serializers import ServiceSerializer,TimeSlotSerializer

class ServiceListView(generics.ListAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

class TimeSlotListView(generics.ListAPIView):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer    