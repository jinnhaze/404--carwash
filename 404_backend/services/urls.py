from django.urls import path
from .views import ServiceListView, TimeSlotListView

urlpatterns = [
    path('', ServiceListView.as_view()),
    path('slots/', TimeSlotListView.as_view()),
]