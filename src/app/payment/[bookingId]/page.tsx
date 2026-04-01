"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import { CreditCard, Lock, ShieldCheck, ChevronLeft, Loader2 } from "lucide-react";
import axios from "axios";

export default function PaymentPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    setUserName(localStorage.getItem("user_name") || 'User');
    // In a real app, you'd fetch the specific booking to get the amount
    const fetchBooking = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/my-bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const found = res.data.find((b: any) => b.id === Number(bookingId));
            setBooking(found);
        } catch (e) { console.error(e); }
    };
    fetchBooking();
  }, [bookingId]);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate Dummy API Call
    setTimeout(() => {
      setLoading(false);
      alert("Payment Successful! Your booking is now secured.");
      router.push("/my-bookings");
    }, 2000);
  };

  if (!booking) return <div className="p-20 text-center">Loading payment details...</div>;

  const advanceAmount = booking.total_amount * 0.25; // 25% advance

  return (
    <RoleBasedLayout userName={userName} userRole="user">
      <div className="max-w-2xl mx-auto py-10 px-4">
        <button onClick={() => router.back()} className="flex items-center text-gray-500 mb-6 hover:text-gray-800">
          <ChevronLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gray-900 p-8 text-white">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Secure Checkout</p>
            <h1 className="text-3xl font-black">Pay Advance</h1>
            <div className="mt-6 flex justify-between items-end">
              <div>
                <p className="text-gray-400 text-sm">{booking.venue_name}</p>
                <p className="text-xs font-medium">Booking ID: {booking.booking_id}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs uppercase font-bold">Amount Due</p>
                <p className="text-3xl font-black text-green-400">Rs. {advanceAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handlePayment} className="p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cardholder Name</label>
                <input type="text" required placeholder="John Doe" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-4 text-gray-400" size={20} />
                  <input type="text" required placeholder="xxxx xxxx xxxx xxxx" className="w-full pl-12 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date</label>
                  <input type="text" required placeholder="MM/YY" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">CVV</label>
                  <input type="password" required placeholder="***" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl text-blue-700 text-xs">
              <Lock size={16} />
              <p>Your payment information is encrypted and processed securely. We do not store your card details.</p>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-green-600 text-white py-5 rounded-3xl font-black text-xl hover:bg-green-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-100 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} /> Processing...
                </>
              ) : (
                <>
                  <ShieldCheck size={24} /> Pay Rs. {advanceAmount.toLocaleString()}
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="mt-8 flex justify-center items-center gap-6 opacity-40 grayscale">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" className="h-6" />
        </div>
      </div>
    </RoleBasedLayout>
  );
}