from rest_framework import generics, permissions
from .models import Booking, Payment, ParkingSlot
from .serializers import BookingSerializer, ParkingSlotSerializer
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
try:
    import razorpay
except ImportError:
    razorpay = None


# ── Parking Slots ──────────────────────────────────────────────────────────────

class ParkingSlotListView(generics.ListAPIView):
    """Returns only currently available parking slots."""
    serializer_class   = ParkingSlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ParkingSlot.objects.filter(is_available=True).order_by('zone', 'slot_number')


# ── Bookings ───────────────────────────────────────────────────────────────────

class CreateBookingView(generics.CreateAPIView):
    serializer_class   = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        booking_date = request.data.get("booking_date")
        booking_time = request.data.get("booking_time")
        parking_slot_id = request.data.get("parking_slot")

        existing_booking = Booking.objects.filter(
            booking_date=booking_date,
            booking_time=booking_time
        ).exists()

        if existing_booking:
            return Response(
                {"error": "This time slot is already booked"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate parking slot availability
        parking_slot = None
        if parking_slot_id:
            try:
                parking_slot = ParkingSlot.objects.get(id=parking_slot_id, is_available=True)
            except ParkingSlot.DoesNotExist:
                return Response(
                    {"error": "Selected parking slot is no longer available"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save(user=request.user)

        services_ids = request.data.get("services", [])
        if services_ids:
            booking.services.set(services_ids)

        # Lock the parking slot
        if parking_slot:
            parking_slot.is_available = False
            parking_slot.save()
            booking.parking_slot = parking_slot
            booking.save()

        return Response(self.get_serializer(booking).data, status=status.HTTP_201_CREATED)


class MyBookingsView(generics.ListAPIView):
    serializer_class   = BookingSerializer
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
        booking.save()  # save() override will free the parking slot

        return Response({"message": "Booking cancelled successfully"})


class AdminAllBookingsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class   = BookingSerializer

    def get_queryset(self):
        return Booking.objects.all().order_by('-created_at')


class AdminUpdateBookingView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset           = Booking.objects.all()
    serializer_class   = BookingSerializer

    def patch(self, request, pk):
        try:
            booking = self.get_queryset().get(id=pk)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

        new_status  = request.data.get("status")
        is_approved = request.data.get("is_approved")

        if new_status is not None:
            booking.status = new_status
        if is_approved is not None:
            booking.is_approved = is_approved

        booking.save()  # save() override will free the parking slot on complete/cancel

        return Response({
            "message":     "Updated successfully",
            "status":      booking.status,
            "is_approved": booking.is_approved
        })


class CreateRazorpayOrderView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if not razorpay:
            return Response({"error": "Razorpay library not installed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        try:
            booking = Booking.objects.get(id=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        # Calculate amount (Razorpay expects in paise)
        # Handle float/decimal properly
        try:
            amount_val = float(request.data.get("amount", sum([s.price for s in booking.services.all()])))
            amount = int(amount_val * 100)
        except (ValueError, TypeError):
             return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        data = {
            "amount": amount,
            "currency": "INR",
            "receipt": f"receipt_{booking.id}",
            "payment_capture": 1
        }
        
        try:
            order = client.order.create(data=data)
        except Exception as e:
            return Response({"error": f"Razorpay order failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save order_id to Payment model
        Payment.objects.update_or_create(
            booking=booking,
            defaults={
                'amount': amount / 100,
                'razorpay_order_id': order['id'],
                'status': 'pending',
                'payment_method': 'razorpay'
            }
        )
        
        return Response({
            "order_id": order['id'],
            "amount": amount,
            "currency": "INR",
            "key_id": settings.RAZORPAY_KEY_ID
        })

class VerifyRazorpayPaymentView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not razorpay:
            return Response({"error": "Razorpay library not installed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }

        try:
            client.utility.verify_payment_signature(params_dict)
            
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.status = 'completed'
            payment.transaction_id = razorpay_payment_id
            payment.save()

            booking = payment.booking
            booking.is_approved = True
            
            new_services = request.data.get('new_services', [])
            if new_services:
                booking.services.add(*new_services)

            booking.save()

            return Response({"status": "Payment verified successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"status": f"Payment verification failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


class CreateDummyPaymentView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(id=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

        if hasattr(booking, 'payment') and booking.payment.status == 'completed':
            return Response({"error": "Already paid"}, status=status.HTTP_400_BAD_REQUEST)

        amount = request.data.get("amount", sum([s.price for s in booking.services.all()]))

        payment, created = Payment.objects.get_or_create(
            booking=booking,
            defaults={
                'amount':         amount,
                'status':         'completed',
                'payment_method': 'dummy',
                'transaction_id': f"DUMMY_TXN_{booking.id}"
            }
        )

        if not created and payment.status != 'completed':
            payment.status = 'completed'
            payment.save()

        booking.is_approved = True
        booking.save()

        return Response({"message": "Payment successful", "status": "completed"})