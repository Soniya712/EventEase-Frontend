// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleBasedLayout from "@/components/RoleBasedLayout";
import { 
  MapPin, 
  Star, 
  CheckCircle, 
  Users, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Heart, 
  TrendingUp, 
  Search, 
  Package,
  Bell,
  Gift,
  Camera,
  Music,
  Utensils,
  Car,
  Building2,
  MessageSquare,
  TrendingUp as TrendingUpIcon,
  Award
} from "lucide-react";
import Link from "next/link";

export default function UserDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    savedVenues: 3,
    upcomingEvents: 2,
    totalBookings: 8,
    citiesVisited: 4,
    budgetSpent: 125000,
    recommendations: 12
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('user_name');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    setUserName(name || 'User');
    // Fetch user stats from API
    fetchUserStats();
    setLoading(false);
  }, [router]);

  const fetchUserStats = async () => {
    // Mock data - replace with API call
    setStats({
      savedVenues: 3,
      upcomingEvents: 2,
      totalBookings: 8,
      citiesVisited: 4,
      budgetSpent: 125000,
      recommendations: 12
    });
  };

  if (loading) {
    return (
      <RoleBasedLayout userName={userName} userRole="user">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your wedding planning dashboard...</p>
          </div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout userName={userName} userRole="user">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userName}! 👋</h1>
            <p className="text-gray-600 mt-2">Let's plan your perfect wedding celebration</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 text-sm font-semibold rounded-full flex items-center gap-2">
              <Award size={14} />
              Premium Member
            </span>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            </button>
          </div>
        </div>
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
          <Link 
            href="/my-saved" 
            className="inline-flex items-center gap-1 text-pink-600 hover:text-pink-700 text-sm font-medium mt-4"
          >
            View all saved venues
            <ChevronRight size={16} />
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
          <Link 
            href="/my-bookings" 
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-4"
          >
            View calendar
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Budget Spent</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.budgetSpent.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <TrendingUpIcon className="text-emerald-600" size={24} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4">
            <TrendingUp size={16} className="text-green-500" />
            <span className="text-sm text-green-600">Within budget</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Upcoming Events & Quick Search */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
              <Link 
                href="/my-bookings" 
                className="text-pink-600 hover:text-pink-800 font-medium flex items-center gap-1"
              >
                View All
                <ChevronRight size={18} />
              </Link>
            </div>
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  venue: "Grand Palace Wedding Hall",
                  date: "Feb 14, 2024",
                  time: "2:00 PM - 6:00 PM",
                  guests: 250,
                  status: "confirmed",
                  city: "Kathmandu"
                },
                {
                  id: 2,
                  venue: "Royal Garden Resort",
                  date: "Mar 5, 2024",
                  time: "11:00 AM - 4:00 PM",
                  guests: 150,
                  status: "pending",
                  city: "Lalitpur"
                },
              ].map((event) => (
                <div key={event.id} className="p-4 border border-gray-200 rounded-lg hover:border-pink-200 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <Building2 className="text-pink-600" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{event.venue}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{event.city}</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              event.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {event.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{event.date}</p>
                      <p className="text-sm text-gray-600">{event.time}</p>
                      <p className="text-sm text-gray-600">{event.guests} guests</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Link 
                      href={`/bookings/${event.id}`}
                      className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
                    >
                      View Details
                    </Link>
                    <button className="flex-1 py-2 bg-pink-50 text-pink-700 rounded-lg font-medium hover:bg-pink-100 transition-colors">
                      Message Venue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Venue Search */}
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Find Your Dream Wedding Venue
              </h2>
              <p className="text-white/90">
                Search from 500+ verified venues across Nepal
              </p>
            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-1" />
                    Location
                  </label>
                  <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent">
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
                    <Calendar size={16} className="inline mr-1" />
                    Wedding Date
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users size={16} className="inline mr-1" />
                    Guests
                  </label>
                  <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                    <option>Number of Guests</option>
                    <option>50-100</option>
                    <option>100-200</option>
                    <option>200-500</option>
                    <option>500-1000</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Link 
                  href="/venues" 
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Search size={20} />
                  Browse All Venues
                </Link>
              </div>
            </div>
          </div>

          {/* Wedding Planning Checklist */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Wedding Planning Checklist</h2>
            <div className="space-y-4">
              {[
                { task: "Book Venue", progress: 100, completed: true },
                { task: "Finalize Guest List", progress: 80, completed: false },
                { task: "Choose Caterer", progress: 60, completed: false },
                { task: "Book Photographer", progress: 40, completed: false },
                { task: "Select Wedding Attire", progress: 30, completed: false },
                { task: "Send Invitations", progress: 20, completed: false },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      item.completed 
                        ? 'border-green-500 bg-green-500' 
                        : 'border-gray-300'
                    }`}>
                      {item.completed && <CheckCircle size={14} className="text-white" />}
                    </div>
                    <span className={`font-medium ${
                      item.completed ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {item.task}
                    </span>
                  </div>
                  <div className="w-24">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block text-right">
                      {item.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 border-2 border-pink-600 text-pink-600 rounded-lg font-semibold hover:bg-pink-50 transition-colors">
              Download Complete Checklist
            </button>
          </div>
        </div>

        {/* Right Column - Saved Venues & Quick Actions */}
        <div className="space-y-8">
          {/* Saved Venues */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recently Saved</h2>
              <Link 
                href="/my-saved" 
                className="text-pink-600 hover:text-pink-800 font-medium flex items-center gap-1"
              >
                View All
                <ChevronRight size={18} />
              </Link>
            </div>
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  name: "Heritage Palace",
                  city: "Bhaktapur",
                  price: 2200,
                  rating: 4.7,
                  image: "https://images.unsplash.com/photo-1596484552993-9c59505c865a"
                },
                {
                  id: 2,
                  name: "Lakeside Resort",
                  city: "Pokhara",
                  price: 2000,
                  rating: 4.9,
                  image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa"
                },
              ].map((venue) => (
                <Link 
                  href={`/venues/${venue.id}`}
                  key={venue.id}
                  className="group block"
                >
                  <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={venue.image} 
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                        {venue.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{venue.city}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-gray-900">₹{venue.price}/plate</span>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-gray-700">{venue.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Wedding Services */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Wedding Services</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/services/catering"
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-sm transition-all text-center"
              >
                <div className="w-12 h-12 mx-auto mb-2 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Utensils className="text-pink-600" size={24} />
                </div>
                <span className="font-medium text-gray-900">Catering</span>
              </Link>
              <Link 
                href="/services/photography"
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-sm transition-all text-center"
              >
                <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Camera className="text-blue-600" size={24} />
                </div>
                <span className="font-medium text-gray-900">Photography</span>
              </Link>
              <Link 
                href="/services/decor"
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-sm transition-all text-center"
              >
                <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-lg flex items-center justify-center">
                  <Gift className="text-green-600" size={24} />
                </div>
                <span className="font-medium text-gray-900">Decoration</span>
              </Link>
              <Link 
                href="/services/music"
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-sm transition-all text-center"
              >
                <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Music className="text-purple-600" size={24} />
                </div>
                <span className="font-medium text-gray-900">Music & DJ</span>
              </Link>
              <Link 
                href="/services/transport"
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-sm transition-all text-center"
              >
                <div className="w-12 h-12 mx-auto mb-2 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Car className="text-amber-600" size={24} />
                </div>
                <span className="font-medium text-gray-900">Transport</span>
              </Link>
              <Link 
                href="/services/all"
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-sm transition-all text-center"
              >
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="text-gray-600" size={24} />
                </div>
                <span className="font-medium text-gray-900">All Services</span>
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                href="/my-bookings" 
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Calendar className="text-blue-600" size={18} />
                  </div>
                  <span className="font-medium text-gray-900">My Bookings</span>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/messages" 
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <MessageSquare className="text-green-600" size={18} />
                  </div>
                  <span className="font-medium text-gray-900">Messages</span>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/budget-planner" 
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="text-purple-600" size={18} />
                  </div>
                  <span className="font-medium text-gray-900">Budget Planner</span>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/vendor-recommendations" 
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                    <Star className="text-pink-600" size={18} />
                  </div>
                  <span className="font-medium text-gray-900">Recommendations</span>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Special Offers */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="text-white" size={24} />
              <h3 className="text-lg font-bold">Special Offers</h3>
            </div>
            <p className="text-sm mb-4">Get 15% off on venue booking this month!</p>
            <button className="w-full py-2 bg-white text-pink-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Claim Offer
            </button>
            <p className="text-xs text-white/80 mt-3">Valid until Feb 29, 2024</p>
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}