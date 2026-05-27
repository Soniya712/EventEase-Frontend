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
  Users,
  Mail,
  Phone,
  Building2,
} from "lucide-react";

interface OwnerPayment {
  id: string;
  booking_id: number;
  booking_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  venue_name: string;
  event_date: string;
  amount: number;
  type: 'advance' | 'remaining';
  status: 'paid';
  payment_method: string;
  transaction_id: string;
  paid_at: string;
}

export default function OwnerPaymentsPage() {
  const [payments, setPayments] = useState<OwnerPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    setUserName(name || "Owner");
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/owner/payments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPayments(res.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-NP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "advance":
        return "Advance Payment";
      case "remaining":
        return "Final Payment";
      default:
        return type;
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.venue_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.transaction_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Calculate stats
  const totalReceived = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const advanceTotal = payments
    .filter(p => p.type === 'advance')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const finalTotal = payments
    .filter(p => p.type === 'remaining')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <RoleBasedLayout userName={userName} userRole="owner">
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
    <RoleBasedLayout userName={userName} userRole="owner">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Payment History</h1>
        <p className="text-gray-500">Track all customer payments for your venues</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Received</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{totalReceived.toLocaleString()}
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
              <p className="text-sm text-gray-600">Advance Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{advanceTotal.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Receipt className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Final Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{finalTotal.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircle className="text-purple-600" size={24} />
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
              placeholder="Search by booking ID, venue, customer, or transaction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Payments</option>
              <option value="advance">Advance Payments</option>
              <option value="remaining">Final Payments</option>
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
          <p className="text-gray-600">No customer payments have been recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{payment.venue_name}</h3>
                    <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-semibold">
                      <CheckCircle size={12} /> Paid
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Booking: {payment.booking_reference}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users size={14} /> {payment.customer_name}
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Mail size={14} /> {payment.customer_email}
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Phone size={14} /> {payment.customer_phone}
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar size={14} /> {formatDate(payment.event_date)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase">{getTypeLabel(payment.type)}</p>
                  <p className="text-2xl font-bold text-blue-600">₹{payment.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDateTime(payment.paid_at)}
                  </p>
                  <p className="text-xs text-gray-400 truncate max-w-[200px]">
                    TXN: {payment.transaction_id}
                  </p>
                </div>
               
              </div>
            </div>
          ))}
        </div>
      )}
    </RoleBasedLayout>
  );
}