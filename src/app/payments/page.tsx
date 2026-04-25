"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import {
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Download,
  Receipt,
  ChevronRight,
} from "lucide-react";

interface Payment {
  id: number | string;
  booking_id: number;
  amount: number;
  type: 'advance' | 'remaining' | 'full';
  status: 'paid' | 'failed' | 'pending';
  payment_method: string;
  transaction_id: string;
  paid_at: string;
  created_at: string;
  booking: {
    id: number;
    booking_id: string;
    venue_name: string;
    event_date: string;
    venue_city: string;
  };
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    setUserName(name || "User");
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user/payments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPayments(res.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      // Optional: show a user-friendly message
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-NP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-semibold">
            <CheckCircle size={12} /> Paid
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-semibold">
            <AlertCircle size={12} /> Failed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-semibold">
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "advance":
        return "Advance Payment";
      case "remaining":
        return "Final Payment";
      case "full":
        return "Full Payment";
      default:
        return type;
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.booking.booking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.booking.venue_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.transaction_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <RoleBasedLayout userName={userName} userRole="user">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout userName={userName} userRole="user">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Payment History</h1>
        <p className="text-gray-500">Track all your transactions and invoices</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Receipt className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recent Payment</p>
              <p className="text-lg font-bold text-gray-900">
                {payments.length > 0 ? formatDate(payments[0].paid_at) : "N/A"}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by booking ID, venue, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white"
            >
              <option value="all">All Types</option>
              <option value="advance">Advance Payments</option>
              <option value="remaining">Final Payments</option>
              <option value="full">Full Payments</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment List */}
      {filteredPayments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Receipt className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments found</h3>
          <p className="text-gray-600">You haven't made any payments yet.</p>
          <Link href="/venues" className="inline-block mt-6 px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700">
            Browse Venues
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{payment.booking.venue_name}</h3>
                    {getStatusBadge(payment.status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    Booking ID: {payment.booking.booking_id} • {payment.booking.venue_city}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Calendar size={14} /> {formatDate(payment.booking.event_date)}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600">
                      <Clock size={14} /> {formatTime(payment.paid_at)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase">{getTypeLabel(payment.type)}</p>
                  <p className="text-2xl font-bold text-pink-600">₹{payment.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">Transaction: {payment.transaction_id}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/invoices/${payment.booking_id}`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2"
                  >
                    <Download size={16} /> Invoice
                  </Link>
                  <Link
                    href={`/my-bookings?booking=${payment.booking_id}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2"
                  >
                    View Booking <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </RoleBasedLayout>
  );
}