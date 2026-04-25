// app/owner/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import {
  Building2,
  CalendarClock,
  CheckCircle,
  TrendingUp,
  MapPin,
  Users,
  DollarSign,
  ChevronRight,
  Plus,
  Clock,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Mail,
  Phone,
  Reply
} from "lucide-react";

interface DashboardStats {
  total_venues: number;
  pending_bookings: number;
  confirmed_bookings: number;
  total_revenue: number;
  active_venues?: number;
  pending_venues?: number;
}

interface RecentBooking {
  id: number;
  booking_id: string;
  customer_name: string;
  venue_name: string;
  event_date: string;
  guest_count: number;
  total_amount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
}

interface RecentVenue {
  id: number;
  name: string;
  city: string;
  status: "active" | "pending" | "rejected";
  total_bookings?: number;
  primary_image?: string;
}

interface RecentEnquiry {
  id: number;
  full_name: string;
  email: string;
  contact: string;
  message: string;
  status: "pending" | "replied";
  created_at: string;
  venue: {
    name: string;
  };
}

export default function OwnerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_venues: 0,
    pending_bookings: 0,
    confirmed_bookings: 0,
    total_revenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [recentVenues, setRecentVenues] = useState<RecentVenue[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<RecentEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const name = localStorage.getItem("user_name");
        setUserName(name || "Owner");

        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }

        // Fetch dashboard stats & recent bookings/venues
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/owner/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStats(res.data.stats || res.data);
        setRecentBookings(res.data.recent_bookings || []);
        setRecentVenues(res.data.recent_venues || []);

        // Fetch recent enquiries
        const enquiriesRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/owner/inquiries`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { per_page: 5 }
        });

        let enquiriesData: RecentEnquiry[] = [];
        if (enquiriesRes.data.success && enquiriesRes.data.data.data) {
          enquiriesData = enquiriesRes.data.data.data;
        } else if (Array.isArray(enquiriesRes.data.data)) {
          enquiriesData = enquiriesRes.data.data;
        } else if (Array.isArray(enquiriesRes.data)) {
          enquiriesData = enquiriesRes.data;
        }
        setRecentEnquiries(enquiriesData.slice(0, 5));

        setError(null);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Confirmed</span>;
      case "pending":
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Pending</span>;
      case "completed":
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Completed</span>;
      case "cancelled":
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Cancelled</span>;
      default:
        return null;
    }
  };

  const getEnquiryStatusBadge = (status: string) => {
    if (status === "pending")
      return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Awaiting Reply</span>;
    return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Replied</span>;
  };

  const getVenueStatusBadge = (status: string) => {
    if (status === "active")
      return <span className="text-xs text-green-600 font-medium">Active</span>;
    if (status === "pending")
      return <span className="text-xs text-amber-600 font-medium">Pending approval</span>;
    return <span className="text-xs text-red-600 font-medium">Rejected</span>;
  };

  const refreshDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/owner/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data.stats || res.data);
      setRecentBookings(res.data.recent_bookings || []);
      setRecentVenues(res.data.recent_venues || []);

      const enquiriesRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/owner/inquiries`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { per_page: 5 }
      });
      let enquiriesData: RecentEnquiry[] = [];
      if (enquiriesRes.data.success && enquiriesRes.data.data.data) {
        enquiriesData = enquiriesRes.data.data.data;
      } else if (Array.isArray(enquiriesRes.data.data)) {
        enquiriesData = enquiriesRes.data.data;
      } else if (Array.isArray(enquiriesRes.data)) {
        enquiriesData = enquiriesRes.data;
      }
      setRecentEnquiries(enquiriesData.slice(0, 5));
      setError(null);
    } catch (err) {
      console.error("Refresh error:", err);
      setError("Could not refresh data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <RoleBasedLayout userName={userName} userRole="owner">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-96"></div>
            ))}
          </div>
        </div>
      </RoleBasedLayout>
    );
  }

  if (error) {
    return (
      <RoleBasedLayout userName={userName} userRole="owner">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <AlertCircle className="text-red-500 mx-auto mb-3" size={48} />
          <h3 className="text-lg font-bold text-red-800 mb-2">Unable to load dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refreshDashboard}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout userName={userName} userRole="owner">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your venues</p>
        </div>
        <button
          onClick={refreshDashboard}
          className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Venues</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_venues}</p>
              {stats.active_venues !== undefined && (
                <div className="flex items-center gap-1 mt-2">
                  <Building2 size={14} className="text-blue-500" />
                  <span className="text-sm text-blue-600">{stats.active_venues} active</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Building2 className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending_bookings}</p>
              <div className="flex items-center gap-1 mt-2">
                <CalendarClock size={14} className="text-amber-500" />
                <span className="text-sm text-amber-600">Awaiting response</span>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <CalendarClock className="text-amber-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Confirmed Events</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.confirmed_bookings}</p>
              <div className="flex items-center gap-1 mt-2">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-sm text-green-600">Scheduled</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(stats.total_revenue)}</p>
              <div className="flex items-center gap-1 mt-2">
                <DollarSign size={14} className="text-emerald-500" />
                <span className="text-sm text-emerald-600">From confirmed bookings</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <DollarSign className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Three‑column layout for recent bookings, venues, enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
            <Link href="/owner/bookings" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentBookings.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <CalendarClock className="mx-auto mb-2" size={32} />
                <p>No bookings yet</p>
              </div>
            ) : (
              recentBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{booking.customer_name}</p>
                      <p className="text-xs text-gray-500">{booking.venue_name}</p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-1">
                      <CalendarClock size={14} />
                      <span>{formatDate(booking.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{booking.guest_count} guests</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} />
                      <span>{formatCurrency(booking.total_amount)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formatDate(booking.created_at)}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Link href={`/owner/bookings/${booking.id}`} className="text-xs text-blue-600 hover:underline">
                      View Details
                    </Link>
                    {booking.status === "pending" && (
                      <Link href={`/owner/bookings/${booking.id}/respond`} className="text-xs text-green-600 hover:underline">
                        Respond
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Venues – three‑dot menu removed */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Your Venues</h3>
            <Link href="/owner/venues" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Manage <ChevronRight size={16} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentVenues.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Building2 className="mx-auto mb-2" size={32} />
                <p>No venues added yet</p>
                <Link href="/owner/venues/create" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
                  Add your first venue
                </Link>
              </div>
            ) : (
              recentVenues.slice(0, 5).map((venue) => (
                <div key={venue.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900">{venue.name}</p>
                        {getVenueStatusBadge(venue.status)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} /> {venue.city}
                        </span>
                        {venue.total_bookings !== undefined && (
                          <span className="flex items-center gap-1">
                            <CalendarClock size={14} /> {venue.total_bookings} bookings
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Three‑dot menu (MoreVertical) removed */}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Recent Enquiries</h3>
            <Link href="/owner/enquiries" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentEnquiries.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <MessageSquare className="mx-auto mb-2" size={32} />
                <p>No enquiries yet</p>
              </div>
            ) : (
              recentEnquiries.map((enquiry) => (
                <div key={enquiry.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{enquiry.full_name}</p>
                      <p className="text-xs text-gray-500">{enquiry.venue.name}</p>
                    </div>
                    {getEnquiryStatusBadge(enquiry.status)}
                  </div>
                  <div className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {enquiry.message}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Mail size={12} /> {enquiry.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={12} /> {enquiry.contact}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Link
                      href={`/owner/enquiries?reply=${enquiry.id}`}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Reply size={12} /> {enquiry.status === "pending" ? "Reply now" : "View reply"}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions – Analytics card removed */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/owner/bookings?status=pending"
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-sm font-bold text-amber-700">Pending Bookings</p>
            <p className="text-2xl font-black text-amber-800">{stats.pending_bookings}</p>
          </div>
          <ChevronRight className="text-amber-600 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/owner/enquiries?status=pending"
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-sm font-bold text-blue-700">Pending Enquiries</p>
            <p className="text-2xl font-black text-blue-800">{stats.pending_enquiries || recentEnquiries.filter(e => e.status === "pending").length}</p>
          </div>
          <ChevronRight className="text-blue-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </RoleBasedLayout>
  );
}