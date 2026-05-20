"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Printer,
  ChevronLeft,
  CheckCircle,
  Clock,
  Building2,
  AlertCircle,
} from "lucide-react";

interface BookingDetail {
  id: number;
  booking_id: string;
  venue_id: number;
  event_date: string;
  guest_count: number;
  total_amount: number;
  advance_paid: number;
  remaining_due: number;
  status: string;
  payment_status: string;
  created_at: string;
  venue: {
    id: number;
    name: string;
    city: string;
    address: string;
    price_per_plate: number;
    hall_cost: number;
    primary_image: string;
  };
  payments: Array<{
    id: number;
    amount: number;
    type: string;
    status: string;
    transaction_id: string;
    paid_at: string;
  }>;
}

// Helper to ensure image URL is absolute
const getImageUrl = (path: string | null): string => {
  if (!path) return "/placeholder.jpg";
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_BACKEND_FILE_URL}/${path.replace(/^\//, "")}`;
};

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    setUserName(name || "User");
    fetchInvoiceDetails();
  }, [id]);

  const fetchInvoiceDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings/${id}/invoice`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBooking(res.data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching invoice:", err);
      setError(err.response?.data?.message || "Failed to load invoice details.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-NP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <RoleBasedLayout userName={userName} userRole="user">
        <div className="animate-pulse p-8 max-w-4xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="bg-white rounded-2xl p-8 space-y-6">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-100 rounded"></div>
          </div>
        </div>
      </RoleBasedLayout>
    );
  }

  if (error || !booking) {
    return (
      <RoleBasedLayout userName={userName} userRole="user">
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The requested invoice could not be found."}</p>
          <Link href="/my-bookings" className="inline-flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-700">
            Back to My Bookings
          </Link>
        </div>
      </RoleBasedLayout>
    );
  }

  const hallCost = booking.venue.hall_cost || 0;
  const cateringCost = booking.guest_count * booking.venue.price_per_plate;
  const totalCalculated = hallCost + cateringCost;
  const advancePaid = booking.advance_paid;
  const remainingDue = booking.remaining_due;

  return (
    <RoleBasedLayout userName={userName} userRole="user">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with only Print button */}
        <div className="flex justify-between items-center mb-8 print:mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-600 print:hidden"
          >
            <ChevronLeft size={20} /> Back
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 print:hidden"
          >
            <Printer size={18} /> Print
          </button>
        </div>

        {/* Invoice Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden print:shadow-none">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-8 text-white print:bg-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">INVOICE</h1>
                <p className="text-pink-100 mt-1">Booking Confirmation</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-pink-100">Invoice #</p>
                <p className="text-2xl font-bold">{booking.booking_id}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Venue & Dates */}
            <div className="flex flex-col md:flex-row justify-between gap-6 pb-8 border-b border-gray-200">
              <div className="flex gap-4">
                {booking.venue.primary_image && (
                  <img
                    src={getImageUrl(booking.venue.primary_image)}
                    alt={booking.venue.name}
                    className="w-20 h-20 rounded-xl object-cover bg-gray-100"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{booking.venue.name}</h2>
                  <p className="text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin size={16} /> {booking.venue.address}, {booking.venue.city}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Event Date</p>
                <p className="text-xl font-semibold text-gray-900">{formatDate(booking.event_date)}</p>
                <p className="text-sm text-gray-500 mt-2">Booking Date</p>
                <p className="text-base">{formatDate(booking.created_at)}</p>
              </div>
            </div>

            {/* Booking Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Status</p>
                <div className="mt-1">
                  {booking.status === "confirmed" ? (
                    <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-semibold">
                      <CheckCircle size={14} /> Confirmed
                    </span>
                  ) : booking.status === "pending" ? (
                    <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-sm font-semibold">
                      <Clock size={14} /> Pending
                    </span>
                  ) : (
                    <span className="text-red-600">{booking.status}</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Payment Status</p>
                <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                  {booking.payment_status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Guests</p>
                <p className="text-lg font-semibold text-gray-900 mt-1 flex items-center gap-1">
                  <Users size={18} /> {booking.guest_count} guests
                </p>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="py-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cost Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Venue Hall Cost (fixed)</span>
                  <span className="font-semibold">₹{hallCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Catering ({booking.guest_count} guests × ₹{booking.venue.price_per_plate}/plate)
                  </span>
                  <span className="font-semibold">₹{cateringCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 mt-3">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="font-bold text-gray-900">₹{totalCalculated.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>Advance Paid</span>
                  <span className="font-semibold">- ₹{advancePaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="font-bold text-gray-900">Remaining Due</span>
                  <span className="font-bold text-pink-600 text-xl">₹{remainingDue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {booking.payments && booking.payments.length > 0 && (
              <div className="py-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Payment History</h3>
                <div className="space-y-3">
                  {booking.payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{payment.type} Payment</p>
                        <p className="text-xs text-gray-500">{formatDateTime(payment.paid_at)}</p>
                        <p className="text-xs text-gray-400">Transaction: {payment.transaction_id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-700">₹{payment.amount.toLocaleString()}</p>
                        <p className="text-xs text-green-600 flex items-center gap-1 justify-end">
                          <CheckCircle size={12} /> {payment.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>Thank you for choosing {booking.venue.name}. For any queries, please contact us.</p>
              <p className="mt-2">© {new Date().getFullYear()} Wedding Planner. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}