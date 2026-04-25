"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import {
  Calendar,
  MapPin,
  Users,
  Search,
  Clock,
  AlertCircle,
  CreditCard,
  Receipt,
} from "lucide-react";

interface Booking {
  id: number;
  booking_id: string;
  venue_id: number;
  venue_name: string;
  venue_image: string;
  venue_city: string;
  event_date: string;
  confirmation_date?: string;
  advance_payment_date?: string;
  advance_paid_at?: string;
  guest_count: number;
  total_amount: number | string;
  advance_paid: number | string;
  remaining_due: number | string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  payment_status: "paid" | "partial" | "unpaid";
}

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingPayment, setProcessingPayment] = useState<number | null>(null);

  useEffect(() => {
    setUserName(localStorage.getItem("user_name") || "User");
    fetchBookings();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const bookingId = urlParams.get("booking_id");
    if (paymentStatus === "success" && bookingId) {
      alert("Payment successful! Redirecting to invoice...");
      router.push(`/invoices/${bookingId}`);
      window.history.replaceState({}, "", "/my-bookings");
    } else if (paymentStatus === "failed") {
      alert("Payment failed. Please try again.");
      window.history.replaceState({}, "", "/my-bookings");
    }
  }, [router]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Convert string numbers to actual numbers (does NOT modify API data)
  const toNumber = (val: number | string): number => {
    if (typeof val === "number") return val;
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const payAdvance = async (bookingId: number) => {
    setProcessingPayment(bookingId);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/khalti-payment/initiate-advance`,
        { booking_id: bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Backend returns { payment_url } (from existing initiate() method)
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        alert("Failed to initiate advance payment");
      }
    } catch (error: any) {
      console.error("Advance payment error:", error);
      alert(error.response?.data?.error || "Could not initiate advance payment");
    } finally {
      setProcessingPayment(null);
    }
  };

  const payRemaining = async (bookingId: number) => {
    setProcessingPayment(bookingId);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/khalti-payment/initiate-full`,
        { booking_id: bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        alert("Failed to initiate full payment");
      }
    } catch (error: any) {
      console.error("Full payment error:", error);
      alert(error.response?.data?.error || "Could not initiate full payment");
    } finally {
      setProcessingPayment(null);
    }
  };

  const isEventDateValid = (eventDate: string) => {
    const today = new Date().toISOString().split("T")[0];
    return eventDate >= today;
  };

  const getDeadlineInfo = (booking: Booking) => {
    if (
      booking.status !== "confirmed" ||
      booking.payment_status === "paid" ||
      !booking.advance_payment_date
    )
      return null;

    const deadlineDate = new Date(booking.advance_payment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      daysLeft: diffDays > 0 ? diffDays : 0,
      isExpired: diffDays <= 0,
      deadlineDate,
    };
  };

  const shouldShowPayAdvance = (booking: Booking) => {
    const deadline = getDeadlineInfo(booking);
    const advancePaid = toNumber(booking.advance_paid);
    return (
      booking.status === "confirmed" &&
      advancePaid === 0 &&
      !deadline?.isExpired &&
      isEventDateValid(booking.event_date)
    );
  };

  const shouldShowPayRemaining = (booking: Booking) => {
    const advancePaid = toNumber(booking.advance_paid);
    const remainingDue = toNumber(booking.remaining_due);
    return (
      booking.status === "confirmed" &&
      advancePaid > 0 &&
      remainingDue > 0 &&
      isEventDateValid(booking.event_date)
    );
  };

  const getStatusBadge = (booking: Booking) => {
    const deadline = getDeadlineInfo(booking);
    if (booking.status === "confirmed" && deadline?.isExpired && toNumber(booking.advance_paid) === 0) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-100 text-red-800 flex items-center gap-1">
          <Clock size={12} /> Expired
        </span>
      );
    }
    const styles: Record<string, string> = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-amber-100 text-amber-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[booking.status] || "bg-gray-100"}`}>
        {booking.status}
      </span>
    );
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.venue_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.booking_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <RoleBasedLayout userName={userName} userRole="user">
        <div className="animate-pulse p-8 space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-3xl"></div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout userName={userName} userRole="user">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900">My Bookings</h1>
          <p className="text-gray-500">View and manage your reservations</p>
        </div>
        <Link
          href="/venues"
          className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-700 transition-all"
        >
          Book New
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by venue or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bookings List */}
      <div className="space-y-6">
        {filteredBookings.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-3xl">
            <AlertCircle className="mx-auto text-gray-400 mb-2" size={48} />
            <p className="text-gray-500">No bookings found.</p>
          </div>
        )}

        {filteredBookings.map((booking) => {
          const deadline = getDeadlineInfo(booking);
          const showPayAdvance = shouldShowPayAdvance(booking);
          const showPayRemaining = shouldShowPayRemaining(booking);
          const isProcessing = processingPayment === booking.id;

          return (
            <div
              key={booking.id}
              className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
            >
              <div className="p-6 flex flex-col lg:flex-row gap-8">
                {/* Venue Image */}
                <div className="w-full lg:w-64 h-48 shrink-0 bg-gray-100 rounded-2xl overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_BACKEND_FILE_URL}/${booking.venue_image || "placeholder.png"}`}
                    className="w-full h-full object-cover"
                    alt="Venue"
                  />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{booking.venue_name}</h3>
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        <MapPin size={14} className="text-pink-500" /> {booking.venue_city}
                      </p>
                    </div>
                    {getStatusBadge(booking)}
                  </div>

                  {/* Deadline warning */}
                  {showPayAdvance && !booking.advance_paid_at && !deadline?.isExpired && (
                    <div className="mb-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs font-bold animate-pulse">
                      <Clock size={14} />
                      Pay advance within {deadline?.daysLeft} day{deadline?.daysLeft !== 1 ? "s" : ""}!
                    </div>
                  )}

                  {/* Payment summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-2xl text-center">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Total</p>
                      <p className="text-sm font-bold text-pink-600">
                        Rs. {toNumber(booking.total_amount).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl text-center">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Advance Paid</p>
                      <p className="text-sm font-bold text-green-600">
                        Rs. {toNumber(booking.advance_paid).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl text-center">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Remaining</p>
                      <p className="text-sm font-bold text-orange-600">
                        Rs. {toNumber(booking.remaining_due).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl text-center">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Guests</p>
                      <p className="text-sm font-bold text-gray-700">{booking.guest_count}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {showPayAdvance && (
                      <button
                        onClick={() => payAdvance(booking.id)}
                        disabled={isProcessing}
                        className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {isProcessing ? (
                          "Processing..."
                        ) : (
                          <>
                            <CreditCard size={16} /> Pay Advance
                          </>
                        )}
                      </button>
                    )}
                    {showPayRemaining && (
                      <button
                        onClick={() => payRemaining(booking.id)}
                        disabled={isProcessing}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {isProcessing ? (
                          "Processing..."
                        ) : (
                          <>
                            <CreditCard size={16} /> Pay Remaining (Rs. {toNumber(booking.remaining_due).toLocaleString()})
                          </>
                        )}
                      </button>
                    )}
                    {(toNumber(booking.advance_paid) > 0 || booking.status === "completed") && (
                      <Link
                        href={`/invoices/${booking.id}`}
                        className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center gap-2"
                      >
                        <Receipt size={16} /> Invoice
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </RoleBasedLayout>
  );
}