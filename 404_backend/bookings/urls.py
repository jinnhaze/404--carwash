from django.urls import path
from .views import (
    CreateBookingView, MyBookingsView, CancelBookingView,
    AdminAllBookingsView, AdminUpdateBookingView,
    CreateDummyPaymentView, ParkingSlotListView,
    CreateRazorpayOrderView, VerifyRazorpayPaymentView
)

urlpatterns = [
    path('create/',                    CreateBookingView.as_view()),
    path('my-bookings/',               MyBookingsView.as_view()),
    path('cancel/<int:pk>/',           CancelBookingView.as_view()),
    path('admin/all/',                 AdminAllBookingsView.as_view()),
    path('admin/update/<int:pk>/',     AdminUpdateBookingView.as_view()),
    path('pay/<int:pk>/',              CreateDummyPaymentView.as_view()),
    path('pay/razorpay/create/<int:pk>/', CreateRazorpayOrderView.as_view()),
    path('pay/razorpay/verify/',       VerifyRazorpayPaymentView.as_view()),
    path('parking-slots/',             ParkingSlotListView.as_view()),
]