"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import RoleBasedLayout from "@/components/RoleBasedLayout";
import {
  Calendar, MapPin, Users, DollarSign, CheckCircle,
  XCircle, Search, FileText, Clock
} from "lucide-react";

interface Booking {
  id: number;
  booking_id: string;
  venue_id: number;
  venue_name: string;
  venue_image: string;
  venue_city: string;
  event_date: string;
  confirmed_at?: string; // This is the mapped updated_at from backend
  guest_count: number;
  total_amount: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  payment_status: 'paid' | 'partial' | 'pending';
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setUserName(localStorage.getItem("user_name") || 'User');
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // LOGIC: 5-Day Countdown from confirmation
  const getDeadlineInfo = (booking: Booking) => {
    if (booking.status !== 'confirmed' || booking.payment_status === 'paid' || !booking.confirmed_at) return null;

    const confirmDate = new Date(booking.confirmed_at);
    const deadlineDate = new Date(confirmDate);
    deadlineDate.setDate(confirmDate.getDate() + 5); // 5 days limit

    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      daysLeft: diffDays,
      isExpired: diffDays <= 0,
      deadlineString: deadlineDate.toLocaleDateString()
    };
  };

  const getStatusBadge = (booking: Booking) => {
    const deadline = getDeadlineInfo(booking);

    if (booking.status === 'confirmed' && deadline?.isExpired) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-100 text-red-800 flex items-center gap-1"><XCircle size={12} /> Cancelled (Expired)</span>;
    }

    const styles: any = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-amber-100 text-amber-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[booking.status] || "bg-gray-100"}`}>{booking.status}</span>;
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.venue_name.toLowerCase().includes(searchTerm.toLowerCase()) || b.booking_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="p-20 text-center font-bold animate-pulse">Loading...</div>;

  return (
    <RoleBasedLayout userName={userName} userRole="user">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900">My Bookings</h1>
          <p className="text-gray-500">View and manage your reservations</p>
        </div>
        <Link href="/venues" className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-700 transition-all">Book New</Link>
      </div>

      <div className="space-y-6">
        {filteredBookings.map((booking) => {
          const deadline = getDeadlineInfo(booking);
          const isActuallyCancelled = booking.status === 'confirmed' && deadline?.isExpired;

          return (
            <div key={booking.id} className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              <div className="p-6 flex flex-col lg:flex-row gap-8">
                {/* Image */}
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
                      <p className="text-gray-500 text-sm flex items-center gap-1"><MapPin size={14} className="text-pink-500" /> {booking.venue_city}</p>
                    </div>
                    {getStatusBadge(booking)}
                  </div>

                  {/* PAYMENT WARNING: If confirmed but not paid */}
                  {booking.status === 'confirmed' && booking.payment_status !== 'paid' && !deadline?.isExpired && (
                    <div className="mb-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs font-bold animate-pulse">
                      <Clock size={14} />
                      <span>DEADLINE: Please pay advance within {deadline?.daysLeft} days (by {deadline?.deadlineString}) to keep your booking.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-2xl text-center">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Date</p>
                      <p className="text-sm font-bold">{new Date(booking.event_date).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl text-center">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Total</p>
                      <p className="text-sm font-bold text-pink-600 font-black">Rs. {booking.total_amount.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl text-center">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Guests</p>
                      <p className="text-sm font-bold">{booking.guest_count}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl text-center">
                      <p className="text-[10px] uppercase font-bold text-gray-400">ID</p>
                      <p className="text-sm font-bold">{booking.booking_id}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {/* Only show pay button if status is confirmed and time has not run out */}
                    {booking.status === 'confirmed' && booking.payment_status !== 'paid' && !isActuallyCancelled && (
                      <Link href={`/payment/${booking.id}`} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-100">
                        <DollarSign size={16} /> Pay Advance
                      </Link>
                    )}
                    <button className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-pink-600 transition-all flex items-center justify-center gap-2">
                      <FileText size={16} /> Invoice
                    </button>
                    <Link href={`/venues/${booking.venue_id}`} className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all">View Venue</Link>
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