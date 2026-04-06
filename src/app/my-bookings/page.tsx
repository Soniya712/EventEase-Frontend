"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  Search,
  FileText,
  Clock,
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

  advance_payment_date?: string; // keep
  advance_paid_at?: string; // ✅ NEW (IMPORTANT)

  guest_count: number;
  total_amount: number;
  advance_paid: number;
  remaining_due: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  payment_status: "paid" | "partial" | "unpaid";
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setUserName(localStorage.getItem("user_name") || "User");
    fetchBookings();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");

    if (paymentStatus === "success") {
      alert("Payment successful! Your booking is now confirmed.");
      fetchBookings();
      window.history.replaceState({}, "", "/my-bookings");
    } else if (paymentStatus === "failed") {
      alert("Payment failed. Please try again.");
      window.history.replaceState({}, "", "/my-bookings");
    }
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/my-bookings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBookings(res.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const payRemaining = async (bookingId: number) => {
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
      console.error("Full payment initiation failed", error);
      alert(error.response?.data?.error || "Could not initiate full payment");
    }
  };

  const getDeadlineInfo = (booking: Booking) => {
    if (
      booking.status !== "confirmed" ||
      booking.payment_status === "paid" ||
      !booking.confirmation_date
    )
      return null;

    const confirmDate = new Date(booking.confirmation_date);
    const deadlineDate = new Date(confirmDate);
    deadlineDate.setDate(confirmDate.getDate() + 5);

    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      daysLeft: diffDays,
      isExpired: diffDays <= 0,
      deadlineString: deadlineDate,
    };
  };

  const getStatusBadge = (booking: Booking) => {
    const deadline = getDeadlineInfo(booking);

    if (booking.status === "confirmed" && deadline?.isExpired) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-100 text-red-800 flex items-center gap-1">
          <XCircle size={12} /> Cancelled (Expired)
        </span>
      );
    }

    const styles: any = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-amber-100 text-amber-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
          styles[booking.status] || "bg-gray-100"
        }`}
      >
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

  if (loading)
    return (
      <div className="p-20 text-center font-bold animate-pulse">
        Loading...
      </div>
    );

  return (
    <RoleBasedLayout userName={userName} userRole="user">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900">My Bookings</h1>
          <p className="text-gray-500">
            View and manage your reservations
          </p>
        </div>
        <Link
          href="/venues"
          className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-700 transition-all"
        >
          Book New
        </Link>
      </div>

      {/* Search and Filter */}
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
          className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="space-y-6">
        {filteredBookings.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-3xl">
            <p className="text-gray-500">No bookings found.</p>
          </div>
        )}

        {filteredBookings.map((booking) => {
          const deadline = getDeadlineInfo(booking);

          // ✅ FIXED LOGIC ONLY
          const showPayAdvance =
            booking.status === "confirmed" &&
            !booking.advance_paid_at &&
            !deadline?.isExpired;

          const showPayRemaining =
            booking.status === "confirmed" &&
            !!booking.advance_paid_at &&
            booking.remaining_due > 0 &&
            !deadline?.isExpired;

          return (
            <div
              key={booking.id}
              className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
            >
              <div className="p-6 flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-64 h-48 shrink-0 bg-gray-100 rounded-2xl overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_BACKEND_FILE_URL}/${booking.venue_image || "placeholder.png"}`}
                    className="w-full h-full object-cover"
                    alt="Venue"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {booking.venue_name}
                      </h3>
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        <MapPin size={14} className="text-pink-500" />{" "}
                        {booking.venue_city}
                      </p>
                    </div>
                    {getStatusBadge(booking)}
                  </div>

                  {booking.status === "confirmed" &&
                    !booking.advance_paid_at &&
                    !deadline?.isExpired && (
                      <div className="mb-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs font-bold animate-pulse">
                        <Clock size={14} />
                        Pay advance within {deadline?.daysLeft} days
                      </div>
                    )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-2xl text-center">
                      <p className="text-[10px] uppercase font-bold text-gray-400">
                        Total
                      </p>
                      <p className="text-sm font-bold text-pink-600">
                        Rs. {booking.total_amount}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-2xl text-center">
                      <p className="text-[10px] uppercase font-bold text-gray-400">
                        Advance Paid
                      </p>
                      <p className="text-sm font-bold text-green-600">
                        Rs. {booking.advance_paid}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-2xl text-center">
                      <p className="text-[10px] uppercase font-bold text-gray-400">
                        Remaining
                      </p>
                      <p className="text-sm font-bold text-orange-600">
                        Rs. {booking.remaining_due}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {showPayAdvance && (
                      <Link
                        href={`/payment/${booking.id}`}
                        className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700"
                      >
                        Pay Advance
                      </Link>
                    )}

                    {showPayRemaining && (
                      <button
                        onClick={() => payRemaining(booking.id)}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700"
                      >
                        Pay Remaining (Rs. {booking.remaining_due})
                      </button>
                    )}

                    <button className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm">
                      Invoice
                    </button>
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