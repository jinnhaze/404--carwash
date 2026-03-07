from rest_framework import generics, permissions
from .models import Booking, Payment
from .serializers import BookingSerializer
from rest_framework.response import Response
from rest_framework import status

class CreateBookingView(generics.CreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        vehicle = request.data.get("vehicle")
        service = request.data.get("service")
        booking_date = request.data.get("booking_date")
        booking_time = request.data.get("booking_time")

        
        existing_booking = Booking.objects.filter(
            booking_date=booking_date,
            booking_time=booking_time
        ).exists()

        if existing_booking:
            return Response(
                {"error": "This slot is already booked"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)
    

class CancelBookingView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            booking = Booking.objects.get(id=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=404)

        if booking.status in ['completed', 'cancelled']:
            return Response(
                {"error": "Cannot cancel this booking"},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = 'cancelled'
        booking.save()

        return Response({"message": "Booking cancelled successfully"})

class AdminAllBookingsView(generics.ListAPIView):
    # For now, just require authentication. Ideally would check admin flag.
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BookingSerializer

    def get_queryset(self):
        # Fetch all bookings, sorted by newest first
        return Booking.objects.all().order_by('-created_at')

class AdminUpdateBookingView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    
    def patch(self, request, pk):
        try:
            booking = self.get_queryset().get(id=pk)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status")
        is_approved = request.data.get("is_approved")

        if new_status is not None:
            booking.status = new_status
        if is_approved is not None:
            booking.is_approved = is_approved

        booking.save()
        return Response({
            "message": "Updated successfully", 
            "status": booking.status,
            "is_approved": booking.is_approved
        })

class CreateDummyPaymentView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(id=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

        if not booking.is_approved:
            return Response({"error": "Booking not approved yet"}, status=status.HTTP_400_BAD_REQUEST)

        if hasattr(booking, 'payment') and booking.payment.status == 'completed':
            return Response({"error": "Already paid"}, status=status.HTTP_400_BAD_REQUEST)

        amount = request.data.get("amount", booking.service.price)

        payment, created = Payment.objects.get_or_create(
            booking=booking,
            defaults={
                'amount': amount,
                'status': 'completed',
                'payment_method': 'dummy',
                'transaction_id': f"DUMMY_TXN_{booking.id}"
            }
        )

        if not created and payment.status != 'completed':
            payment.status = 'completed'
            payment.save()

        return Response({"message": "Payment successful", "status": "completed"})