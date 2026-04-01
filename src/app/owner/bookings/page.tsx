"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import { 
  Calendar, Users, CheckCircle, XCircle, 
  Phone, Mail, MapPin, AlertCircle
} from "lucide-react";

interface Booking {
  id: number;
  event_date: string;
  guest_count: number; // Updated name
  event_type: string;
  total_amount: number; // Updated name
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests: string;
  created_at: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  venue: {
    name: string;
    city: string;
  };
}

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    setUserName(localStorage.getItem("user_name") || 'Owner');
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/owner/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    if (!window.confirm(`Set this booking to ${newStatus}?`)) return;

    try {
      const token = localStorage.getItem("token");
      // Use the route exactly as defined in your api.php
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/owner/bookings/${id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Booking ${newStatus} successfully!`);
      fetchBookings(); 
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  const filteredBookings = bookings.filter(b => 
    statusFilter === 'all' ? true : b.status === statusFilter
  );

  if (loading) return <div className="p-10 text-center font-bold animate-pulse">Loading requests...</div>;

  return (
    <RoleBasedLayout userName={userName} userRole="owner">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Booking Requests</h1>
            <p className="text-gray-500">Manage incoming event requests</p>
          </div>

          <div className="flex bg-white border rounded-2xl p-1 shadow-sm">
            {['all', 'pending', 'confirmed', 'cancelled'].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${statusFilter === s ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row transition-all hover:shadow-md">
              <div className={`lg:w-2 h-2 lg:h-auto ${booking.status === 'confirmed' ? 'bg-green-500' : booking.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-400'}`} />

              <div className="p-8 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2 block">Event Details</span>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.venue.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-4"><MapPin size={14}/> {booking.venue.city}</p>
                  <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm font-bold text-gray-700"><Calendar size={16} className="text-pink-500" /> {new Date(booking.event_date).toLocaleDateString()}</div>
                      <div className="flex items-center gap-3 text-sm font-bold text-gray-700"><Users size={16} className="text-blue-500" /> {booking.guest_count} Guests</div>
                  </div>
                </div>

                <div className="lg:col-span-1 border-l lg:pl-8 border-gray-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2 block">Customer</span>
                  <p className="font-bold text-gray-900 mb-3">{booking.user.name}</p>
                  <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex items-center gap-2"><Phone size={14}/> {booking.user.phone}</p>
                      <p className="flex items-center gap-2"><Mail size={14}/> {booking.user.email}</p>
                  </div>
                </div>

                <div className="lg:col-span-1 border-l lg:pl-8 border-gray-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2 block">Financials</span>
                  <div className="text-2xl font-black text-gray-900 mb-1">Rs. {Number(booking.total_amount).toLocaleString()}</div>
                  <p className="text-xs text-gray-400 mb-4 font-bold uppercase">{booking.event_type}</p>
                  {booking.special_requests && (
                      <div className="flex gap-2 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 italic">
                          <AlertCircle size={14} className="shrink-0 text-amber-500" /> "{booking.special_requests}"
                      </div>
                  )}
                </div>

                <div className="lg:col-span-1 flex flex-col justify-center gap-3 border-l lg:pl-8 border-gray-100">
                  {booking.status === 'pending' ? (
                      <>
                          <button onClick={() => handleStatusUpdate(booking.id, 'confirmed')} className="w-full bg-green-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-green-700 transition-all flex items-center justify-center gap-2"><CheckCircle size={18} /> Confirm</button>
                          <button onClick={() => handleStatusUpdate(booking.id, 'cancelled')} className="w-full bg-white border border-red-200 text-red-600 py-3 rounded-2xl font-bold text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2"><XCircle size={18} /> Reject</button>
                      </>
                  ) : (
                      <div className={`text-center py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 ${booking.status === 'confirmed' ? 'border-green-100 text-green-600 bg-green-50' : 'border-red-100 text-red-600 bg-red-50'}`}>
                          {booking.status}
                      </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleBasedLayout>
  );
}