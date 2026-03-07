from django.urls import path
from .views import AddVehicleView, MyVehiclesView

urlpatterns = [
    path('add/', AddVehicleView.as_view()),
    path('my-vehicles/', MyVehiclesView.as_view()),
]