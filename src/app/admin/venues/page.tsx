"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import {
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Users,
} from "lucide-react";
import Link from "next/link";

interface Venue {
  id: number;
  name: string;
  city: string;
  address: string;
  status: "pending" | "active" | "rejected";
  primary_image: string | null;
  user: {
    name: string;
    email: string;
  };
  created_at: string;
}

export default function AdminVenuesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");

  const [venues, setVenues] = useState<Venue[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, active: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(statusParam || "all");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [userName, setUserName] = useState("");

  // ✅ IMAGE HELPER – fixes missing images
  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2069&auto=format&fit=crop";
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const fullPath = path.startsWith('storage/') ? `/${path}` : `/storage/${path}`;
    return `${baseUrl}${fullPath}`;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("user_role");
    if (!token || role !== "admin") {
      router.push("/login");
      return;
    }
    setUserName(localStorage.getItem("user_name") || "Admin");
    fetchVenues();
  }, [statusFilter]);

  const fetchVenues = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/venues${
        statusFilter !== "all" ? `?status=${statusFilter}` : ""
      }`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVenues(res.data.data);
      setCounts(res.data.counts);
    } catch (err: any) {
      console.error("Failed to fetch venues", err);
      setError(err.response?.data?.message || "Could not load venues");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (venueId: number) => {
    setProcessingId(venueId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/venues/${venueId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVenues((prev) =>
        prev.map((v) => (v.id === venueId ? { ...v, status: "active" } : v))
      );
      setCounts((prev) => ({
        ...prev,
        pending: prev.pending - 1,
        active: prev.active + 1,
      }));
      alert("Venue approved successfully!");
    } catch (err) {
      console.error("Approval failed", err);
      alert("Failed to approve venue");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (venueId: number) => {
    if (!confirm("Are you sure you want to reject this venue?")) return;
    setProcessingId(venueId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/venues/${venueId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVenues((prev) =>
        prev.map((v) => (v.id === venueId ? { ...v, status: "rejected" } : v))
      );
      setCounts((prev) => ({
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1,
      }));
      alert("Venue rejected.");
    } catch (err) {
      console.error("Rejection failed", err);
      alert("Failed to reject venue");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
            <CheckCircle size={12} /> Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
            <Clock size={12} /> Pending
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredVenues = venues.filter(
    (venue) =>
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <RoleBasedLayout userName={userName} userRole="admin">
        <div className="flex flex-col items-center justify-center h-screen -mt-20">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-bold animate-pulse">Loading venues...</p>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout userName={userName} userRole="admin">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Venue Management</h1>
          <p className="text-gray-500 mt-1">Review, approve, or reject venue listings</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Venues</p>
                <p className="text-3xl font-black text-gray-900 mt-2">{counts.total}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <Building2 size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Pending</p>
                <p className="text-3xl font-black text-amber-600 mt-2">{counts.pending}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <Clock size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Approved</p>
                <p className="text-3xl font-black text-green-600 mt-2">{counts.active}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl text-green-600">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Rejected</p>
                <p className="text-3xl font-black text-red-600 mt-2">{counts.rejected}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl text-red-600">
                <XCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by venue name, city, or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 border-none rounded-xl outline-none font-bold text-gray-700"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={fetchVenues}
                className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={18} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Venues Grid */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle className="text-red-500 mx-auto mb-3" size={48} />
            <h3 className="text-lg font-bold text-red-800 mb-2">Failed to load venues</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchVenues}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Building2 className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 font-medium">
              {searchTerm || statusFilter !== "all"
                ? "No venues match your filters"
                : "No venues found"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <div
                key={venue.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image with proper URL helper */}
                <div className="relative h-48 bg-gray-100">
                  {venue.primary_image ? (
                    <img
                      src={getImageUrl(venue.primary_image)}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                      <Building2 size={40} className="text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">{getStatusBadge(venue.status)}</div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{venue.name}</h3>
                    <Link
                      href={`/venues/${venue.id}`}
                      className="text-gray-400 hover:text-indigo-600 transition-colors"
                      target="_blank"
                    >
                      <Eye size={18} />
                    </Link>
                  </div>

                  <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                    <MapPin size={14} />
                    <span>{venue.city}</span>
                    {venue.address && <span className="text-gray-300">•</span>}
                    <span className="text-gray-400 text-xs">{venue.address}</span>
                  </div>

                  <div className="border-t border-gray-100 my-3 pt-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Users size={14} className="text-gray-400" />
                      <span className="font-medium">{venue.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail size={14} className="text-gray-400" />
                      <span>{venue.user.email}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                      <span>Submitted: {formatDate(venue.created_at)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4">
                    {venue.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(venue.id)}
                          disabled={processingId === venue.id}
                          className="flex-1 bg-green-600 text-white py-2 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {processingId === venue.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <CheckCircle size={16} /> Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(venue.id)}
                          disabled={processingId === venue.id}
                          className="flex-1 bg-red-600 text-white py-2 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </>
                    )}
                    {venue.status === "active" && (
                      <button
                        onClick={() => handleReject(venue.id)}
                        disabled={processingId === venue.id}
                        className="w-full bg-red-100 text-red-700 py-2 rounded-xl font-bold text-sm hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} /> Revoke Approval
                      </button>
                    )}
                    {venue.status === "rejected" && (
                      <button
                        onClick={() => handleApprove(venue.id)}
                        disabled={processingId === venue.id}
                        className="w-full bg-green-100 text-green-700 py-2 rounded-xl font-bold text-sm hover:bg-green-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} /> Approve Anyway
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </RoleBasedLayout>
  );
}