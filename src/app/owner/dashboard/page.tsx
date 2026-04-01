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
  MoreVertical,
  Plus
} from "lucide-react";

export default function OwnerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const name = localStorage.getItem("user_name");
        setUserName(name || 'Owner');
        
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/owner/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (error) {
        console.error("Error fetching dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <RoleBasedLayout userName={userName} userRole="owner">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
          ))}
        </div>
        <div className="bg-gray-200 rounded-xl h-96"></div>
      </div>
    </RoleBasedLayout>
  );

  const stats = data?.stats || { total_venues: 0, pending_bookings: 0, confirmed_bookings: 0, total_revenue: 0 };
  const bookings = data?.recent_bookings || [];

  return (
    <RoleBasedLayout userName={userName} userRole="owner">
      {/* Page Header with Add Venue Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your venues</p>
        </div>
        <Link 
          href="/owner/venues/create" 
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 group"
        >
          <Plus size={18} />
          Add New Venue
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Stats Grid - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Venues</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_venues}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="text-green-500" size={16} />
                <span className="text-sm text-green-600">+2 this month</span>
              </div>
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
                <CalendarClock className="text-amber-500" size={16} />
                <span className="text-sm text-amber-600">Requires attention</span>
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
                <CheckCircle className="text-green-500" size={16} />
                <span className="text-sm text-green-600">All scheduled</span>
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
              <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.total_revenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="text-green-500" size={16} />
                <span className="text-sm text-green-600">+24% this month</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <DollarSign className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Rest of your owner dashboard content */}
      {/* ... */}
    </RoleBasedLayout>
  );
}