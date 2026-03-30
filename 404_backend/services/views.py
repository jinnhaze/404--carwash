from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.core.management import call_command
from .models import Service, TimeSlot
from .serializers import ServiceSerializer, TimeSlotSerializer

class ServiceListView(generics.ListAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

class TimeSlotListView(generics.ListAPIView):
    queryset = TimeSlot.objects.all().order_by('start_time')
    serializer_class = TimeSlotSerializer