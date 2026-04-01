// app/owner/venues/page.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import { 
  Building2, 
  MapPin, 
  Users, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign
} from "lucide-react";

export default function OwnerVenuesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    rejected: 0,
    totalBookings: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    setUserName(name || 'Owner');
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/owner/venues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      setVenues(data);

      // Dynamic Stats calculation
      setStats({
        total: data.length,
        active: data.filter((v: any) => v.status === 'active').length,
        pending: data.filter((v: any) => v.status === 'pending').length,
        rejected: data.filter((v: any) => v.status === 'rejected').length,
        totalBookings: data.reduce((acc: number, v: any) => acc + (v.bookings_count || 0), 0),
        totalRevenue: data.reduce((acc: number, v: any) => acc + (parseFloat(v.total_revenue) || 0), 0)
      });
    } catch (error) {
      console.error("Error fetching venues:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVenue = async (venueId: number, venueName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${venueName}"?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/owner/venues/${venueId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVenues(venues.filter(venue => venue.id !== venueId));
      alert("Venue deleted successfully!");
    } catch (error) {
      alert("Failed to delete venue.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full"><CheckCircle size={14} /> Active</span>;
      case 'pending':
        return <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full"><Clock size={14} /> Pending Review</span>;
      case 'rejected':
        return <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full"><XCircle size={14} /> Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-bold">{status}</span>;
    }
  };

  const filteredVenues = venues.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <RoleBasedLayout userName={userName} userRole="owner">
        <div className="animate-pulse p-8 space-y-8">
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout userName={userName} userRole="owner">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Venues</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage your wedding venues and listings</p>
        </div>
        <Link href="/owner/venues/create" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100">
          <Plus size={20} /> Add New Venue
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Venues</p><p className="text-3xl font-black mt-2">{stats.total}</p></div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Building2 size={24} /></div>
          </div>
          <p className="text-xs text-amber-600 mt-4 font-bold">{stats.pending} awaiting approval</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Active</p><p className="text-3xl font-black mt-2">{stats.active}</p></div>
            <div className="p-3 bg-green-50 rounded-xl text-green-600"><CheckCircle size={24} /></div>
          </div>
          <p className="text-xs text-gray-400 mt-4 font-medium">Visible to public</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Bookings</p><p className="text-3xl font-black mt-2">{stats.totalBookings}</p></div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><Calendar size={24} /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Revenue</p><p className="text-3xl font-black mt-2">₹{stats.totalRevenue.toLocaleString()}</p></div>
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><DollarSign size={24} /></div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input type="text" placeholder="Search venues..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full md:w-48 p-3 bg-gray-50 border-none rounded-xl outline-none font-bold text-gray-700">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Venue Details</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Location</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Capacity</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Price/Plate</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredVenues.map((venue) => (
              <tr key={venue.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    {/* FIXED IMAGE SRC: Directly using venue.primary_image */}
                    <img 
                      src={venue.primary_image || "/placeholder.png"} 
                      className="w-14 h-14 rounded-2xl object-cover bg-gray-100 shadow-sm border border-gray-100" 
                      alt={venue.name}
                      onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                    />
                    <div>
                      <p className="font-bold text-gray-900">{venue.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Listed on {new Date(venue.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 font-medium"><div className="flex items-center gap-2"><MapPin size={16} className="text-gray-400" />{venue.city}</div></td>
                <td className="px-6 py-4 text-sm text-gray-600 font-medium"><div className="flex items-center gap-2"><Users size={16} className="text-gray-400" />{venue.capacity} guests</div></td>
                <td className="px-6 py-4 text-sm font-black text-gray-900">₹{venue.price_per_plate}</td>
                <td className="px-6 py-4">{getStatusBadge(venue.status)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <Link href={`/owner/venues/${venue.id}`} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="View"><Eye size={20} /></Link>
                    <Link href={`/owner/venues/${venue.id}/edit`} className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all" title="Edit"><Edit size={20} /></Link>
                    <button onClick={() => handleDeleteVenue(venue.id, venue.name)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete"><Trash2 size={20} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredVenues.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No venues found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </RoleBasedLayout>
  );
}