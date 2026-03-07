from django.urls import path
from .views import CreateBookingView, MyBookingsView, CancelBookingView, AdminAllBookingsView, AdminUpdateBookingView, CreateDummyPaymentView

urlpatterns = [
    path('create/', CreateBookingView.as_view()),
    path('my-bookings/', MyBookingsView.as_view()),
    path('cancel/<int:pk>/', CancelBookingView.as_view()),
    path('admin/all/', AdminAllBookingsView.as_view()),
    path('admin/update/<int:pk>/', AdminUpdateBookingView.as_view()),
    path('pay/<int:pk>/', CreateDummyPaymentView.as_view()),
]