"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import { 
  Building2, MapPin, Users, Clock, CheckCircle, XCircle, Eye, 
  Search, Shield, DollarSign, User, Mail, Phone, Calendar,
  Info, AlertTriangle, Image as ImageIcon, Check, X
} from "lucide-react";

interface VenueApproval {
  id: number;
  name: string;
  description: string;
  city: string;
  address: string;
  capacity: number;
  price_per_plate: number;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  primary_image: string;
  amenities: string[];
}

export default function AdminVenueApprovalsPage() {
  const [venues, setVenues] = useState<VenueApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<VenueApproval | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const userName = typeof window !== 'undefined' ? localStorage.getItem("user_name") || 'Admin' : 'Admin';

  const getImageUrl = (path: string) => {
    if (!path) return "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80";
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const fullPath = path.startsWith('storage/') ? `/${path}` : `/storage/${path}`;
    return `${baseUrl}${fullPath}`;
  };

  useEffect(() => {
    fetchVenueApprovals();
  }, []);

  const fetchVenueApprovals = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/venues/approvals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVenues(res.data);
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason) {
        alert("Please provide a reason for rejection.");
        return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/venues/${id}/${action}`;
      await axios.post(url, { reason: rejectionReason }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`Venue listing has been ${action}ed successfully`);
      setSelectedVenue(null);
      setRejectionReason('');
      fetchVenueApprovals();
    } catch (error) {
      alert("Operation failed. Check server logs.");
    }
  };

  const filteredVenues = venues.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RoleBasedLayout userName={userName} userRole="admin">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Venue Approvals</h1>
            <p className="text-gray-500 mt-2 flex items-center gap-2 font-medium">
              <Shield size={18} className="text-blue-600" />
              Active quality assurance dashboard
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Search by venue or owner..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="font-bold">Syncing pending listings...</p>
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="bg-white rounded-[32px] p-20 text-center border-2 border-dashed border-gray-200">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Queue is Clear</h3>
            <p className="text-gray-500 mt-1">There are no pending venue requests at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredVenues.map(venue => (
              <div key={venue.id} className="group bg-white rounded-3xl overflow-hidden flex flex-col md:flex-row border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="w-full md:w-72 h-56 md:h-auto relative overflow-hidden">
                  <img src={getImageUrl(venue.primary_image)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                      venue.status === 'approved' ? 'bg-green-500 text-white' : 
                      venue.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-amber-400 text-white'
                    }`}>
                      {venue.status}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-2xl font-bold text-gray-900">{venue.name}</h3>
                      <p className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                        ID: #{venue.id}
                      </p>
                    </div>
                    <div className="flex items-center text-gray-500 font-medium mt-1">
                      <MapPin size={16} className="mr-2 text-pink-500" /> {venue.city}, {venue.address}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg"><Users size={18} className="text-gray-400" /></div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 leading-none">Capacity</p>
                          <p className="text-sm font-bold">{venue.capacity} Guests</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg"><DollarSign size={18} className="text-gray-400" /></div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 leading-none">Price/Plate</p>
                          <p className="text-sm font-bold">Rs. {venue.price_per_plate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg"><User size={18} className="text-gray-400" /></div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 leading-none">Owner</p>
                          <p className="text-sm font-bold">{venue.owner_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg"><Calendar size={18} className="text-gray-400" /></div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 leading-none">Submitted</p>
                          <p className="text-sm font-bold">{new Date(venue.submitted_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS ON THE CARD */}
                  <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-gray-50">
                    <button 
                      onClick={() => setSelectedVenue(venue)}
                      className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye size={18}/> Review Details
                    </button>
                    
                    {venue.status === 'pending' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAction(venue.id, 'approve')}
                          className="px-6 py-3 bg-green-100 text-green-700 rounded-xl font-bold hover:bg-green-600 hover:text-white transition-all flex items-center gap-2"
                        >
                          <CheckCircle size={18} /> Approve
                        </button>
                        
                        {/* THE REJECT BUTTON ON CARD */}
                        <button 
                          onClick={() => setSelectedVenue(venue)}
                          className="px-6 py-3 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                        >
                          <XCircle size={18} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAILED REVIEW MODAL */}
      {selectedVenue && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header Image */}
            <div className="h-64 relative shrink-0">
              <img src={getImageUrl(selectedVenue.primary_image)} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <button 
                onClick={() => setSelectedVenue(null)}
                className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors"
              >
                <X size={24} />
              </button>
              <div className="absolute bottom-8 left-8 text-white">
                <h2 className="text-3xl font-black">{selectedVenue.name}</h2>
                <p className="flex items-center gap-2 opacity-80"><MapPin size={16} /> {selectedVenue.address}</p>
              </div>
            </div>
            
            <div className="p-10 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                
                {/* Information Column */}
                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                        <Info size={16} /> Description
                    </h4>
                    <p className="text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-3xl italic">
                      "{selectedVenue.description}"
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                        <ImageIcon size={16} /> Amenities Provided
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedVenue.amenities?.map((item, i) => (
                        <span key={i} className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 shadow-sm flex items-center gap-2">
                           <Check size={14} className="text-green-500" /> {item.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Owner Sidebar */}
                <div className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-[32px] border border-blue-100">
                        <h4 className="text-xs font-black uppercase text-blue-600 mb-4">Owner Information</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User size={18} className="text-blue-400" />
                                <p className="text-sm font-bold">{selectedVenue.owner_name}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail size={18} className="text-blue-400" />
                                <p className="text-sm font-medium text-gray-600 truncate">{selectedVenue.owner_email}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={18} className="text-blue-400" />
                                <p className="text-sm font-medium text-gray-600">{selectedVenue.owner_phone}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-50 p-6 rounded-[32px] border border-orange-100">
                        <h4 className="text-xs font-black uppercase text-orange-600 mb-4 flex items-center gap-2">
                            <AlertTriangle size={14} /> Critical Specs
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-orange-800/60 font-medium">Capacity</span>
                                <span className="font-black text-orange-900">{selectedVenue.capacity}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-orange-800/60 font-medium">Plate Price</span>
                                <span className="font-black text-orange-900">Rs. {selectedVenue.price_per_plate}</span>
                            </div>
                        </div>
                    </div>
                </div>
              </div>

              {/* Action Footer (MODAL) */}
              {selectedVenue.status === 'pending' && (
                <div className="mt-12 pt-10 border-t border-gray-100">
                  <h4 className="text-lg font-bold mb-4">Final Determination</h4>
                  <div className="bg-red-50 p-6 rounded-3xl mb-6 border-2 border-red-100">
                    <p className="text-xs font-bold text-red-600 uppercase mb-2">Rejection Feedback (Required to Reject)</p>
                    <textarea 
                        className="w-full border-none bg-transparent focus:ring-0 text-lg font-medium placeholder:text-red-200" 
                        placeholder="e.g., Please upload higher quality photos or verify the address..."
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <button 
                      onClick={() => handleAction(selectedVenue.id, 'approve')}
                      className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={22} /> Confirm & Approve
                    </button>
                    <button 
                      onClick={() => handleAction(selectedVenue.id, 'reject')}
                      disabled={!rejectionReason}
                      className="flex-1 bg-white border-2 border-red-600 text-red-600 py-4 rounded-2xl font-black text-lg hover:bg-red-600 hover:text-white disabled:opacity-30 disabled:border-gray-200 disabled:text-gray-300 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={22} /> Reject Listing
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </RoleBasedLayout>
  );
}