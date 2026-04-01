// app/owner/enquiries/page.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import {
  MessageSquare,
  Mail,
  Phone,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Reply,
  Search,
  Filter,
  Eye,
  Calendar,
  ChevronDown,
  ChevronUp,
  Send,
  FileText,
  AlertCircle,
  Building2,
  Users,
  RefreshCw,
  X
} from "lucide-react";


interface Inquiry {
  id: number;
  venue_id: number;
  user_id: number | null;
  full_name: string;
  contact: string;
  email: string;
  message: string;
  status: 'pending' | 'replied' | 'completed';
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
  venue: {
    id: number;
    name: string;
    primary_image: string;
    city: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface Stats {
  total: number;
  pending: number;
  replied: number;
  completed: number;
}

export default function OwnerEnquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [venues, setVenues] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    replied: 0,
    completed: 0
  });
  
  // Reply Modal State
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState('');
  
  // View Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null);
  
  // Expanded rows for mobile view
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    setUserName(name || 'Owner');
    fetchVenues();
    fetchInquiries();
  }, []);

  const fetchVenues = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/owner/venues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVenues(res.data);
    } catch (error) {
      console.error("Error fetching venues:", error);
    }
  };

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Use the optimized endpoint for owner's inquiries
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/owner/inquiries`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { per_page: 100 } // Get up to 100 records
        }
      );
      
      if (response.data.success) {
        let inquiriesData: Inquiry[] = [];
        
        // Handle different response structures
        if (response.data.data && response.data.data.data) {
          // Paginated response
          inquiriesData = response.data.data.data;
        } else if (Array.isArray(response.data.data)) {
          // Direct array response
          inquiriesData = response.data.data;
        } else if (Array.isArray(response.data)) {
          // Direct response without wrapper
          inquiriesData = response.data;
        }
        
        setInquiries(inquiriesData);
        
        // Calculate stats
        setStats({
          total: inquiriesData.length,
          pending: inquiriesData.filter(i => i.status === 'pending').length,
          replied: inquiriesData.filter(i => i.status === 'replied').length,
          completed: inquiriesData.filter(i => i.status === 'completed').length
        });
      } else {
        console.error("Failed to fetch inquiries:", response.data.message);
      }
    } catch (error: any) {
      console.error("Error fetching inquiries:", error);
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      setReplyError('Please enter a reply message');
      return;
    }
    
    if (!selectedInquiry) return;
    
    setReplying(true);
    setReplyError('');
    
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/inquiries/${selectedInquiry.id}/status`,
        {
          status: 'replied',
          admin_reply: replyMessage
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setInquiries(inquiries.map(inquiry => 
        inquiry.id === selectedInquiry.id 
          ? { 
              ...inquiry, 
              status: 'replied', 
              admin_reply: replyMessage,
              replied_at: new Date().toISOString()
            }
          : inquiry
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        replied: prev.replied + 1
      }));
      
      setShowReplyModal(false);
      setReplyMessage('');
      setSelectedInquiry(null);
      
      alert('Reply sent successfully!');
    } catch (error: any) {
      console.error("Error sending reply:", error);
      setReplyError(error.response?.data?.message || 'Failed to send reply. Please try again.');
    } finally {
      setReplying(false);
    }
  };

  const handleStatusUpdate = async (inquiryId: number, newStatus: 'pending' | 'replied' | 'completed') => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/inquiries/${inquiryId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setInquiries(inquiries.map(inquiry => 
        inquiry.id === inquiryId ? { ...inquiry, status: newStatus } : inquiry
      ));
      
      // Update stats
      const oldStatus = inquiries.find(i => i.id === inquiryId)?.status;
      setStats(prev => {
        const newStats = { ...prev };
        if (oldStatus === 'pending') newStats.pending--;
        if (oldStatus === 'replied') newStats.replied--;
        if (oldStatus === 'completed') newStats.completed--;
        
        if (newStatus === 'pending') newStats.pending++;
        if (newStatus === 'replied') newStats.replied++;
        if (newStatus === 'completed') newStats.completed++;
        
        return newStats;
      });
      
      alert('Status updated successfully!');
    } catch (error) {
      console.error("Error updating status:", error);
      alert('Failed to update status. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full"><Clock size={12} /> Pending</span>;
      case 'replied':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full"><Reply size={12} /> Replied</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full"><CheckCircle size={12} /> Completed</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.contact.includes(searchTerm) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    const matchesVenue = selectedVenue === 'all' || inquiry.venue_id === parseInt(selectedVenue);
    
    return matchesSearch && matchesStatus && matchesVenue;
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
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Venue Enquiries</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage and respond to customer inquiries</p>
        </div>
        <button 
          onClick={fetchInquiries}
          className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Enquiries</p>
              <p className="text-3xl font-black mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <MessageSquare size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Pending</p>
              <p className="text-3xl font-black mt-2 text-amber-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 font-medium">Awaiting response</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Replied</p>
              <p className="text-3xl font-black mt-2 text-blue-600">{stats.replied}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Reply size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Completed</p>
              <p className="text-3xl font-black mt-2 text-green-600">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, phone, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-3 bg-gray-50 border-none rounded-xl outline-none font-bold text-gray-700"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="replied">Replied</option>
            <option value="completed">Completed</option>
          </select>
          
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="w-full p-3 bg-gray-50 border-none rounded-xl outline-none font-bold text-gray-700"
          >
            <option value="all">All Venues</option>
            {venues.map(venue => (
              <option key={venue.id} value={venue.id}>{venue.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Inquiry Details</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Info</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Venue</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredInquiries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">
                  No enquiries found
                </td>
              </tr>
            ) : (
              filteredInquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-gray-900">{inquiry.full_name}</p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{inquiry.message}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" /> {inquiry.email}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" /> {inquiry.contact}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{inquiry.venue?.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(inquiry.status)}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {formatDate(inquiry.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setViewingInquiry(inquiry);
                          setShowViewModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {inquiry.status !== 'completed' && (
                        <button
                          onClick={() => {
                            setSelectedInquiry(inquiry);
                            setReplyMessage(inquiry.admin_reply || '');
                            setShowReplyModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                          title="Reply"
                        >
                          <Reply size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredInquiries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
            No enquiries found
          </div>
        ) : (
          filteredInquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              {/* ... mobile card content (same as before) ... */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-gray-900">{inquiry.full_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(inquiry.created_at)}</p>
                </div>
                {getStatusBadge(inquiry.status)}
              </div>
              
              <div className="space-y-2 mb-3">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Mail size={14} className="text-gray-400 shrink-0" />
                  <span className="truncate">{inquiry.email}</span>
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Phone size={14} className="text-gray-400 shrink-0" />
                  {inquiry.contact}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Building2 size={14} className="text-gray-400 shrink-0" />
                  {inquiry.venue?.name || 'N/A'}
                </p>
              </div>
              
              <button
                onClick={() => setExpandedRow(expandedRow === inquiry.id ? null : inquiry.id)}
                className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-xl mb-2"
              >
                <span className="text-xs font-bold text-gray-500">Message Preview</span>
                {expandedRow === inquiry.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {expandedRow === inquiry.id && (
                <div className="mb-3 p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-700">{inquiry.message}</p>
                  {inquiry.admin_reply && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs font-bold text-blue-600 mb-1">Your Reply:</p>
                      <p className="text-sm text-gray-700">{inquiry.admin_reply}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setViewingInquiry(inquiry);
                    setShowViewModal(true);
                  }}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <Eye size={16} /> View
                </button>
                {inquiry.status !== 'completed' && (
                  <button
                    onClick={() => {
                      setSelectedInquiry(inquiry);
                      setReplyMessage(inquiry.admin_reply || '');
                      setShowReplyModal(true);
                    }}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Reply size={16} /> Reply
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Reply to Inquiry</h2>
                <p className="text-sm text-gray-500 mt-1">
                  To: {selectedInquiry.full_name} ({selectedInquiry.email})
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyMessage('');
                  setReplyError('');
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Original Message */}
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs text-gray-500 font-bold uppercase mb-2">Original Message</p>
                <p className="text-gray-700">{selectedInquiry.message}</p>
              </div>
              
              {/* Reply Form */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Your Reply <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => {
                    setReplyMessage(e.target.value);
                    if (replyError) setReplyError('');
                  }}
                  placeholder="Type your reply here..."
                  rows={6}
                  className={`w-full px-4 py-3 bg-gray-50 border ${replyError ? 'border-red-300' : 'border-gray-200'} rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium resize-none`}
                />
                {replyError && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={12} /> {replyError}
                  </p>
                )}
              </div>
              
              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReply}
                  disabled={replying}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-extrabold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {replying ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send size={18} /> Send Reply
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyMessage('');
                    setReplyError('');
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-extrabold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
              
              <p className="text-xs text-gray-400 text-center">
                The customer will be notified via email about your reply
              </p>
            </div>
          </div>
        </div>
      )}
    </RoleBasedLayout>
  );
}
