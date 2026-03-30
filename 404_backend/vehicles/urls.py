from django.urls import path
from .views import AddVehicleView, MyVehiclesView, DeleteVehicleView

urlpatterns = [
    path('add/', AddVehicleView.as_view()),
    path('my-vehicles/', MyVehiclesView.as_view()),
    path('delete/<int:pk>/', DeleteVehicleView.as_view()),
]