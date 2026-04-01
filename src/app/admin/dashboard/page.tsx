// app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import RoleBasedLayout from "@/components/RoleBasedLayout";
import { 
  Users, Building2, Calendar, CreditCard, Shield, TrendingUp,
  AlertCircle, CheckCircle, Clock, Settings, ArrowRight, 
  RefreshCw, AlertTriangle, Activity as ActivityIcon
} from "lucide-react";
import Link from "next/link";

interface AdminStats {
  totalUsers: number;
  totalVenues: number;
  activeBookings: number;
  totalRevenue: number;
  systemHealth: number;
  pendingApprovals: number;
  verificationRate: number;
}

interface Activity {
  action: string;
  user: string;
  time: string;
  type: 'success' | 'warning' | 'info';
}

export default function AdminDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication token missing");

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard-stats`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      setStats(res.data.stats);
      setActivities(res.data.recentActivity || []);
    } catch (err: any) {
      console.error("Dashboard Load Error:", err);
      setError(err.response?.data?.message || "Failed to connect to backend server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('user_role');
    
    if (!token || role !== 'admin') {
      router.push('/login');
      return;
    }
    
    setUserName(localStorage.getItem('user_name') || 'Admin');
    fetchDashboardData();
  }, [router, fetchDashboardData]);

  if (loading) {
    return (
      <RoleBasedLayout userName={userName} userRole="admin">
        <div className="flex flex-col items-center justify-center h-screen -mt-20">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-bold animate-pulse">Initializing Admin Engine...</p>
        </div>
      </RoleBasedLayout>
    );
  }

  if (error) {
    return (
      <RoleBasedLayout userName={userName} userRole="admin">
        <div className="max-w-md mx-auto mt-20 text-center bg-red-50 p-10 rounded-[40px] border border-red-100">
          <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-black text-red-900 mb-2">Connection Error</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <button 
            onClick={() => fetchDashboardData(true)}
            className="bg-red-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 mx-auto hover:bg-red-700 transition-all"
          >
            <RefreshCw size={20} /> Try Again
          </button>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout userName={userName} userRole="admin">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Administration</h1>
            <p className="text-gray-500 mt-1">Real-time platform metrics and oversight</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm text-gray-600 disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-2xl border border-green-100 font-bold text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live Status
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers.toLocaleString() || '0'} 
          icon={<Users size={28} />} 
          color="indigo" 
          sub={"+12.5% Growth"}
        />
        <StatCard 
          title="Platform Venues" 
          value={stats?.totalVenues || 0} 
          icon={<Building2 size={28} />} 
          color="blue" 
          sub={`${stats?.verificationRate}% Compliance`}
        />
        <StatCard 
          title="Active Events" 
          value={stats?.activeBookings || 0} 
          icon={<Calendar size={28} />} 
          color="purple" 
          sub="Confirmed & Upcoming"
        />
        <StatCard 
          title="Total Revenue" 
          value={`Rs. ${Number(stats?.totalRevenue).toLocaleString()}`} 
          icon={<CreditCard size={28} />} 
          color="emerald" 
          sub="Net Platform Volume"
        />
        <StatCard 
          title="System Security" 
          value={`${stats?.systemHealth}%`} 
          icon={<Shield size={28} />} 
          color="slate" 
          sub="All Protocols Valid"
        />
        
        {/* Special Pending Approvals Card */}
        <Link href="/admin/venues/approvals" className="bg-red-50 rounded-[32px] shadow-sm border border-red-100 p-8 hover:bg-red-100 transition-all group relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 bg-white rounded-2xl text-red-600 shadow-sm">
              <AlertCircle size={28} />
            </div>
            <ArrowRight className="text-red-400 group-hover:translate-x-1 transition-transform" size={24} />
          </div>
          <p className="text-sm font-bold text-red-400 uppercase tracking-widest">Action Required</p>
          <p className="text-4xl font-black text-red-700 mt-1">{stats?.pendingApprovals || 0}</p>
          <p className="text-xs font-bold text-red-500 mt-2">Pending Venue Approvals</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity List */}
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
               <ActivityIcon className="text-indigo-600" /> Recent Activity
            </h2>
          </div>
          <div className="space-y-6 flex-1">
            {activities.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-medium">No recent activity detected.</div>
            ) : activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-3xl transition-colors border border-transparent hover:border-gray-100">
                <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="font-bold text-gray-900 leading-tight">{activity.action}</p>
                  <p className="text-xs text-gray-400 mt-1 font-medium">
                    {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Server Performance Monitors */}
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10">
          <h2 className="text-2xl font-black text-gray-900 mb-8">Performance Monitor</h2>
          <div className="space-y-8">
            <ProgressBar label="Database Read/Write" value={32} color="indigo" />
            <ProgressBar label="Storage Assets" value={14} color="emerald" />
            <div className="pt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-6 rounded-3xl text-center border border-gray-100">
                    <p className="text-xs font-black text-gray-400 uppercase mb-1">Response Latency</p>
                    <p className="text-2xl font-black text-gray-900">142ms</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl text-center border border-gray-100">
                    <p className="text-xs font-black text-gray-400 uppercase mb-1">API Error Rate</p>
                    <p className="text-2xl font-black text-gray-900">0.02%</p>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel Section */}
      <div className="mt-12 bg-indigo-900 rounded-[40px] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-indigo-200">
        <div className="max-w-md text-center md:text-left">
            <h2 className="text-3xl font-black mb-2">Platform Controls</h2>
            <p className="text-indigo-200 font-medium">Advanced administrative tools for maintenance and security overrides.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-bold transition-all flex items-center gap-2">
                <Settings size={20} /> Preferences
            </button>
            <button className="px-8 py-4 bg-indigo-500 hover:bg-indigo-400 rounded-2xl font-bold shadow-xl transition-all flex items-center gap-2">
                <Shield size={20} /> Security Sweep
            </button>
        </div>
      </div>
    </RoleBasedLayout>
  );
}

/* Helper Sub-Components */
function StatCard({ title, value, icon, color, sub }: any) {
  const colors: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
    slate: "bg-slate-50 text-slate-600",
  };

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-4 rounded-2xl transition-colors ${colors[color]}`}>
          {icon}
        </div>
        <div className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <TrendingUp size={20} />
        </div>
      </div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      <p className="text-4xl font-black text-gray-900 mt-1">{value}</p>
      <p className="text-xs font-bold text-gray-400 mt-2">{sub}</p>
    </div>
  );
}

function ProgressBar({ label, value, color }: any) {
  const barColors: any = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
  };
  const textColors: any = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
  };

  return (
    <div>
      <div className="flex justify-between mb-3 text-sm font-black uppercase tracking-tighter">
        <span className="text-gray-400">{label}</span>
        <span className={textColors[color]}>{value}%</span>
      </div>
      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${barColors[color]}`} 
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}