"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import RoleBasedLayout from "@/components/RoleBasedLayout";
import { 
  MapPin, 
  Star, 
  CheckCircle, 
  Users, 
  Calendar, 
  ChevronRight, 
  Heart, 
  TrendingUp, 
  Search, 
  Building2,
  MessageSquare,
  DollarSign,
  Clock
} from "lucide-react";
import Link from "next/link";

// ✅ Image helper (same as in admin pages)
const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80";
  if (path.startsWith('http')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  const fullPath = path.startsWith('storage/') ? `/${path}` : `/storage/${path}`;
  return `${baseUrl}${fullPath}`;
};

export default function UserDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    savedVenues: 0,
    upcomingEvents: 0,
    totalBookings: 0,
    budgetSpent: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [savedVenues, setSavedVenues] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('user_name');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    setUserName(name || 'User');
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch user's bookings
      const bookingsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bookings = bookingsRes.data || [];
      
      // Filter upcoming events (date >= today and status not cancelled)
      const today = new Date().toISOString().split('T')[0];
      const upcoming = bookings.filter((b: any) => 
        b.event_date >= today && b.status !== 'cancelled'
      );
      
      // Calculate total spent
      const totalSpent = bookings
        .filter((b: any) => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);
      
      // Fetch saved venues
      let saved = [];
      try {
        const savedRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/saved-venues`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        saved = savedRes.data || [];
      } catch (err) {
        console.warn("Saved venues endpoint error:", err);
        saved = [];
      }
      
      setSavedVenues(saved);
      setStats({
        savedVenues: saved.length,
        upcomingEvents: upcoming.length,
        totalBookings: bookings.length,
        budgetSpent: totalSpent,
      });
      setUpcomingBookings(upcoming.slice(0, 3));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <RoleBasedLayout userName={userName} userRole="user">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout userName={userName} userRole="user">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userName}! 👋</h1>
        <p className="text-gray-600 mt-2">Let's plan your perfect wedding celebration</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-pink-50 to-white rounded-xl border border-pink-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Saved Venues</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.savedVenues}</p>
            </div>
            <div className="p-3 bg-pink-100 rounded-lg">
              <Heart className="text-pink-600" size={24} />
            </div>
          </div>
          <Link href="/my-saved" className="inline-flex items-center gap-1 text-pink-600 text-sm font-medium mt-4">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming Events</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcomingEvents}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
          <Link href="/my-bookings" className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium mt-4">
            View calendar <ChevronRight size={16} />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Budget Spent</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.budgetSpent.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <DollarSign className="text-emerald-600" size={24} />
            </div>
          </div>
          <Link href="/payments" className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium mt-4">
            View payments <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Upcoming Events */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
              <Link href="/my-bookings" className="text-pink-600 font-medium flex items-center gap-1">
                View All <ChevronRight size={18} />
              </Link>
            </div>
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No upcoming events. Start booking your dream venue!
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((event) => (
                  <div key={event.id} className="p-4 border border-gray-200 rounded-lg hover:border-pink-200 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <Building2 className="text-pink-600" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{event.venue_name || event.venue?.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{event.venue?.city || 'N/A'}</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              event.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                              event.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {event.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{new Date(event.event_date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">{event.guest_count} guests</p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Link href={`/bookings/${event.id}`} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-center">
                        View Details
                      </Link>
                      <Link href={`/invoices/${event.id}`} className="flex-1 py-2 bg-pink-50 text-pink-700 rounded-lg font-medium hover:bg-pink-100 text-center">
                        View Invoice
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Venue Search */}
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-3">Find Your Dream Wedding Venue</h2>
              <p className="text-white/90">Search from 500+ verified venues across Nepal</p>
            </div>
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-1" /> Location
                  </label>
                  <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500">
                    <option>Select City</option>
                    <option>Kathmandu</option>
                    <option>Lalitpur</option>
                    <option>Bhaktapur</option>
                    <option>Pokhara</option>
                    <option>Chitwan</option>
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" /> Wedding Date
                  </label>
                  <input type="date" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500" />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users size={16} className="inline mr-1" /> Guests
                  </label>
                  <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500">
                    <option>Number of Guests</option>
                    <option>50-100</option>
                    <option>100-200</option>
                    <option>200-500</option>
                    <option>500-1000</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link href="/venues" className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-lg hover:shadow-lg transition-all">
                  <Search size={20} /> Browse All Venues
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Saved Venues */}
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recently Saved</h2>
              <Link href="/my-saved" className="text-pink-600 font-medium flex items-center gap-1">
                View All <ChevronRight size={18} />
              </Link>
            </div>
            {savedVenues.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No saved venues yet. Heart your favorites!
              </div>
            ) : (
              <div className="space-y-4">
                {savedVenues.slice(0, 2).map((venue) => (
                  <Link href={`/venues/${venue.id}`} key={venue.id} className="group block">
                    <div className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      {/* ✅ Use getImageUrl for the image src */}
                      <img 
                        src={getImageUrl(venue.primary_image)} 
                        className="w-16 h-16 rounded-lg object-cover" 
                        alt={venue.name} 
                        onError={(e) => {
                          // Fallback if image fails to load
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80";
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-pink-600">{venue.name}</h3>
                        <p className="text-sm text-gray-600">{venue.city}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-gray-900">₹{venue.price_per_plate}/plate</span>
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-sm">{(venue.rating || 4.5).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link href="/payments" className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-sm transition">
                <DollarSign size={20} className="text-green-600" />
                <span>Payment History</span>
                <ChevronRight size={16} className="ml-auto text-gray-400" />
              </Link>
              <Link href="/my-bookings" className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-sm transition">
                <Calendar size={20} className="text-blue-600" />
                <span>All Bookings</span>
                <ChevronRight size={16} className="ml-auto text-gray-400" />
              </Link>
              <Link href="/my-saved" className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-sm transition">
                <Heart size={20} className="text-pink-600" />
                <span>Saved Venues</span>
                <ChevronRight size={16} className="ml-auto text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Special Offers */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="text-white" size={24} />
              <h3 className="text-lg font-bold">Need Help?</h3>
            </div>
            <p className="text-sm mb-4">Our wedding experts are here 24/7.</p>
            <button className="w-full py-2 bg-white text-pink-600 font-semibold rounded-lg hover:bg-gray-100">
              Chat with Support
            </button>
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}