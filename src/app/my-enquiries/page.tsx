// app/my-enquiries/page.tsx
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
  Reply,
  Search,
  Eye,
  Calendar,
  ChevronDown,
  ChevronUp,
  Building2,
  AlertCircle,
  RefreshCw,
  X,
  ArrowLeft,
  Send,
  Check,
  Filter
} from "lucide-react";

interface Inquiry {
  id: number;
  venue_id: number;
  user_id: number | null;
  full_name: string;
  contact: string;
  email: string;
  message: string;
  status: 'pending' | 'replied';  // removed 'completed'
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
  venue: {
    id: number;
    name: string;
    primary_image: string;
    city: string;
    address: string;
  };
}

interface Stats {
  total: number;
  pending: number;
  replied: number;
  // removed completed
}

export default function MyEnquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    replied: 0,
  });
  
  // View Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null);
  
  // New Inquiry Modal State
  const [showNewInquiryModal, setShowNewInquiryModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [newInquiryForm, setNewInquiryForm] = useState({
    full_name: '',
    contact: '',
    email: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<any>({});
  const [venues, setVenues] = useState<any[]>([]);
  
  // Expanded rows for mobile view
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    const email = localStorage.getItem("user_email");
    const phone = localStorage.getItem("user_phone");
    
    setUserName(name || 'User');
    
    // Pre-fill form with user data
    setNewInquiryForm({
      full_name: name || '',
      contact: phone || '',
      email: email || '',
      message: ''
    });
    
    fetchUserInquiries();
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/public/venues`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setVenues(res.data);
    } catch (error) {
      console.error("Error fetching venues:", error);
    }
  };

  const fetchUserInquiries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user/inquiries`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { per_page: 100 }
        }
      );
      
      if (response.data.success) {
        let inquiriesData: Inquiry[] = [];
        
        // Handle different response structures
        if (response.data.data && response.data.data.data) {
          inquiriesData = response.data.data.data;
        } else if (Array.isArray(response.data.data)) {
          inquiriesData = response.data.data;
        } else if (Array.isArray(response.data)) {
          inquiriesData = response.data;
        }
        
        setInquiries(inquiriesData);
        
        // Calculate stats (excluding completed)
        setStats({
          total: inquiriesData.length,
          pending: inquiriesData.filter(i => i.status === 'pending').length,
          replied: inquiriesData.filter(i => i.status === 'replied').length,
        });
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewInquiryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewInquiryForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev: any) => ({ ...prev, [name]: null }));
    }
  };

  const validateNewInquiry = () => {
    const errors: any = {};
    
    if (!newInquiryForm.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }
    
    if (!newInquiryForm.contact.trim()) {
      errors.contact = 'Contact number is required';
    } else if (!/^[0-9+\-\s()]{10,15}$/.test(newInquiryForm.contact)) {
      errors.contact = 'Please enter a valid phone number';
    }
    
    if (!newInquiryForm.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(newInquiryForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!newInquiryForm.message.trim()) {
      errors.message = 'Message is required';
    } else if (newInquiryForm.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }
    
    return errors;
  };

  const handleSubmitNewInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateNewInquiry();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!selectedVenue) {
      alert('Please select a venue');
      return;
    }

    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/venues/${selectedVenue.id}/inquiries`,
        newInquiryForm,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      
      alert("Inquiry sent successfully! The venue owner will contact you soon.");
      setShowNewInquiryModal(false);
      setSelectedVenue(null);
      setNewInquiryForm(prev => ({
        ...prev,
        message: ''
      }));
      
      // Refresh inquiries list
      fetchUserInquiries();
      
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || "Failed to send inquiry. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
            <Clock size={12} /> Awaiting Response
          </span>
        );
      case 'replied':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
            <Reply size={12} /> Replied
          </span>
        );
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.admin_reply && inquiry.admin_reply.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <RoleBasedLayout userName={userName} userRole="user">
        <div className="animate-pulse p-8 space-y-8">
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout userName={userName} userRole="user">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Enquiries</h1>
          <p className="text-gray-500 mt-1 font-medium">
            Track and manage your venue inquiries
          </p>
        </div>
        <button
          onClick={() => setShowNewInquiryModal(true)}
          className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-pink-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg"
        >
          <MessageSquare size={20} /> New Inquiry
        </button>
      </div>

      {/* Stats Cards - Removed Completed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Awaiting Response</p>
              <p className="text-3xl font-black mt-2 text-amber-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 font-medium">Venue owners will respond soon</p>
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
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by venue name or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-pink-500 font-medium"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-3 bg-gray-50 border-none rounded-xl outline-none font-bold text-gray-700"
          >
            <option value="all">All Status</option>
            <option value="pending">Awaiting Response</option>
            <option value="replied">Replied</option>
            {/* Removed completed option */}
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Venue</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Message</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredInquiries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">
                  No enquiries found
                </td>
              </tr>
            ) : (
              filteredInquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={`${process.env.NEXT_PUBLIC_BACKEND_FILE_URL}/${inquiry.venue.primary_image || "placeholder.png"}`}
                        className="w-12 h-12 rounded-xl object-cover"
                        alt={inquiry.venue.name}
                      />
                      <div>
                        <p className="font-bold text-gray-900">{inquiry.venue.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{inquiry.venue.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">{inquiry.message}</p>
                    {inquiry.admin_reply && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <Reply size={10} /> Replied: {inquiry.admin_reply.substring(0, 50)}...
                      </p>
                    )}
                   </td>
                  <td className="px-6 py-4">{getStatusBadge(inquiry.status)}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {formatDate(inquiry.created_at)}
                    </div>
                    {inquiry.replied_at && (
                      <div className="text-xs text-gray-400 mt-1">
                        Replied: {new Date(inquiry.replied_at).toLocaleDateString()}
                      </div>
                    )}
                   </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => {
                          setViewingInquiry(inquiry);
                          setShowViewModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
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
              <div className="flex items-start gap-3 mb-3">
                <img 
                  src={inquiry.venue.primary_image || "/placeholder.png"}
                  className="w-14 h-14 rounded-xl object-cover"
                  alt={inquiry.venue.name}
                />
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{inquiry.venue.name}</p>
                  <p className="text-xs text-gray-500">{inquiry.venue.city}</p>
                  <div className="mt-1">{getStatusBadge(inquiry.status)}</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{inquiry.message}</p>
              
              <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
                <span>{formatDate(inquiry.created_at)}</span>
                {inquiry.replied_at && (
                  <span className="text-blue-600">Replied</span>
                )}
              </div>
              
              <button
                onClick={() => setExpandedRow(expandedRow === inquiry.id ? null : inquiry.id)}
                className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-xl"
              >
                <span className="text-xs font-bold text-gray-500">
                  {expandedRow === inquiry.id ? 'Hide Details' : 'View Full Details'}
                </span>
                {expandedRow === inquiry.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {expandedRow === inquiry.id && (
                <div className="mt-3 space-y-3">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs font-bold text-gray-500 mb-1">Your Message:</p>
                    <p className="text-sm text-gray-700">{inquiry.message}</p>
                  </div>
                  
                  {inquiry.admin_reply && (
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <p className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1">
                        <Reply size={12} /> Venue Owner's Reply:
                      </p>
                      <p className="text-sm text-gray-700">{inquiry.admin_reply}</p>
                      {inquiry.replied_at && (
                        <p className="text-xs text-gray-400 mt-2">
                          Replied on: {formatDate(inquiry.replied_at)}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      setViewingInquiry(inquiry);
                      setShowViewModal(true);
                    }}
                    className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                  >
                    View Full Details
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* View Inquiry Modal */}
      {showViewModal && viewingInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Inquiry Details</h2>
                <p className="text-sm text-gray-500 mt-1">
                  For {viewingInquiry.venue.name}
                </p>
              </div>
              <button 
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Venue Info */}
              <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <img
                    src={`${process.env.NEXT_PUBLIC_BACKEND_FILE_URL}/${viewingInquiry.venue.primary_image || "placeholder.png"}`}
                    className="w-16 h-16 rounded-xl object-cover"
                    alt="Venue"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{viewingInquiry.venue.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Building2 size={14} /> {viewingInquiry.venue.city}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{viewingInquiry.venue.address}</p>
                  </div>
                </div>
              </div>
              
              {/* Status */}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="text-sm font-bold text-gray-700">Status:</span>
                {getStatusBadge(viewingInquiry.status)}
              </div>
              
              {/* Your Message */}
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs text-gray-500 font-bold uppercase mb-2 flex items-center gap-2">
                  <User size={14} /> Your Message
                </p>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {viewingInquiry.message}
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  Sent on: {formatDate(viewingInquiry.created_at)}
                </p>
              </div>
              
              {/* Venue Owner's Reply */}
              {viewingInquiry.admin_reply ? (
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <p className="text-xs text-blue-600 font-bold uppercase mb-2 flex items-center gap-2">
                    <Reply size={14} /> Venue Owner's Reply
                  </p>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {viewingInquiry.admin_reply}
                  </p>
                  {viewingInquiry.replied_at && (
                    <p className="text-xs text-gray-500 mt-3">
                      Replied on: {formatDate(viewingInquiry.replied_at)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <p className="text-xs text-amber-600 font-bold uppercase mb-2 flex items-center gap-2">
                    <Clock size={14} /> Awaiting Response
                  </p>
                  <p className="text-sm text-gray-700">
                    The venue owner hasn't replied yet. They will respond to your inquiry shortly.
                  </p>
                </div>
              )}
              
              {/* Actions - Removed "Mark as Completed" button */}
              <div className="flex gap-3 pt-4">
                <Link
                  href={`/venues/${viewingInquiry.venue.id}`}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-center hover:bg-gray-200 transition-all"
                >
                  View Venue
                </Link>
                {/* No "Mark as Completed" button anymore */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Inquiry Modal */}
      {showNewInquiryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">New Venue Inquiry</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Send an inquiry to a venue owner
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowNewInquiryModal(false);
                  setSelectedVenue(null);
                  setFormErrors({});
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitNewInquiry} className="p-6 space-y-4">
              {/* Select Venue */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Select Venue <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedVenue?.id || ''}
                  onChange={(e) => {
                    const venue = venues.find(v => v.id === parseInt(e.target.value));
                    setSelectedVenue(venue);
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                  required
                >
                  <option value="">Choose a venue...</option>
                  {venues.map(venue => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name} - {venue.city}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={newInquiryForm.full_name}
                  onChange={handleNewInquiryChange}
                  className={`w-full px-4 py-3 bg-gray-50 border ${formErrors.full_name ? 'border-red-300' : 'border-gray-200'} rounded-xl outline-none focus:ring-2 focus:ring-pink-500 font-medium`}
                />
                {formErrors.full_name && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.full_name}</p>
                )}
              </div>
              
              {/* Contact */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={newInquiryForm.contact}
                  onChange={handleNewInquiryChange}
                  className={`w-full px-4 py-3 bg-gray-50 border ${formErrors.contact ? 'border-red-300' : 'border-gray-200'} rounded-xl outline-none focus:ring-2 focus:ring-pink-500 font-medium`}
                />
                {formErrors.contact && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.contact}</p>
                )}
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={newInquiryForm.email}
                  onChange={handleNewInquiryChange}
                  className={`w-full px-4 py-3 bg-gray-50 border ${formErrors.email ? 'border-red-300' : 'border-gray-200'} rounded-xl outline-none focus:ring-2 focus:ring-pink-500 font-medium`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                )}
              </div>
              
              {/* Message */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={newInquiryForm.message}
                  onChange={handleNewInquiryChange}
                  placeholder="Tell the venue owner about your event, date, number of guests, etc..."
                  rows={5}
                  className={`w-full px-4 py-3 bg-gray-50 border ${formErrors.message ? 'border-red-300' : 'border-gray-200'} rounded-xl outline-none focus:ring-2 focus:ring-pink-500 font-medium resize-none`}
                />
                {formErrors.message && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.message}</p>
                )}
              </div>
              
              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting || !selectedVenue}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-xl font-extrabold hover:from-pink-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send size={18} /> Send Inquiry
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewInquiryModal(false);
                    setSelectedVenue(null);
                    setFormErrors({});
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-extrabold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
              
              <p className="text-xs text-gray-400 text-center">
                The venue owner will contact you via email or phone
              </p>
            </form>
          </div>
        </div>
      )}
    </RoleBasedLayout>
  );
}