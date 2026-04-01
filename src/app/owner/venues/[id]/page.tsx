// app/owner/venues/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import { 
  MapPin, Users, Clock, DollarSign, Phone, Mail, 
  ChevronLeft, CheckCircle, Tag, Edit, AlertCircle, 
  ChevronRight, Building2, Shield
} from "lucide-react";

interface Venue {
  id: number;
  name: string;
  address: string;
  city: string;
  contact_phone: string;
  email: string;
  capacity: number;
  price_per_plate: number;
  description: string;
  start_time: string;
  end_time: string;
  amenities: string[];
  event_types: string[];
  images: string[];
  primary_image: string;
  status: string;
  created_at: string;
}

export default function OwnerVenueDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [userName, setUserName] = useState("Owner");

  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        setUserName(localStorage.getItem("user_name") || "Owner");

        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/owner/venues/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setVenue(res.data);
        // The backend now returns full URLs, so we set it directly
        setActiveImage(res.data.primary_image || res.data.images?.[0] || "");
      } catch (error) {
        console.error("Error fetching venue:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchVenueDetails();
  }, [id, router]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><CheckCircle size={14}/> Active</span>;
      case 'pending':
        return <span className="px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><Clock size={14}/> Pending Review</span>;
      case 'rejected':
        return <span className="px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><AlertCircle size={14}/> Rejected</span>;
      default:
        return <span className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  if (loading) return (
    <RoleBasedLayout userName={userName} userRole="owner">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Venue Details</p>
      </div>
    </RoleBasedLayout>
  );

  if (!venue) return (
    <RoleBasedLayout userName={userName} userRole="owner">
      <div className="text-center py-20">
        <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-black text-gray-900">Venue Not Found</h2>
        <p className="text-gray-500 mt-2">The venue may have been deleted or you don't have permission to view it.</p>
        <Link href="/owner/venues" className="text-blue-600 font-bold mt-6 inline-block hover:underline">← Back to My Venues</Link>
      </div>
    </RoleBasedLayout>
  );

  return (
    <RoleBasedLayout userName={userName} userRole="owner">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <Link href="/owner/venues" className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-bold text-sm uppercase tracking-wider">
          <ChevronLeft size={20} className="mr-1" /> Back to List
        </Link>
        <div className="flex gap-3">
          <Link 
            href={`/owner/venues/${id}/edit`} 
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Edit size={18} /> Edit Venue
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Hero Image */}
          <div className="aspect-[16/9] rounded-[2rem] overflow-hidden bg-gray-100 shadow-xl border-4 border-white relative group">
            <img src={activeImage || "/placeholder.png"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={venue.name} />
            <div className="absolute top-6 left-6">
                {getStatusBadge(venue.status)}
            </div>
          </div>

          {/* Thumbnails Gallery */}
          {venue.images && venue.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
              {venue.images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(img)} 
                  className={`w-28 h-20 rounded-2xl overflow-hidden border-4 flex-shrink-0 transition-all duration-300 ${activeImage === img ? 'border-blue-600 scale-95 shadow-md' : 'border-white opacity-60 hover:opacity-100 shadow-sm'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}

          {/* Core Info Card */}
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="mb-8">
               <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">{venue.name}</h1>
               <div className="flex items-center text-gray-500 font-medium bg-gray-50 self-start px-4 py-2 rounded-xl">
                 <MapPin size={18} className="mr-2 text-blue-600" /> {venue.address}, {venue.city}
               </div>
            </div>

            <div className="space-y-10">
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 italic">
                    <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
                    Venue Description
                </h3>
                <p className="whitespace-pre-line leading-relaxed text-gray-600 text-lg">
                    {venue.description || "No description provided."}
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                  <h4 className="font-bold mb-4 flex items-center gap-2 text-blue-900 underline decoration-blue-200 underline-offset-4">
                      <CheckCircle size={20} className="text-blue-600"/> Amenities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {venue.amenities?.length > 0 ? (
                        venue.amenities.map((a, i) => (
                            <span key={i} className="px-4 py-1.5 bg-white border border-blue-100 rounded-xl text-sm font-bold text-blue-700 capitalize shadow-sm">
                                {a.replace('_', ' ')}
                            </span>
                        ))
                    ) : (
                        <p className="text-xs text-blue-400 italic">No amenities listed</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
                  <h4 className="font-bold mb-4 flex items-center gap-2 text-gray-800 underline decoration-gray-200 underline-offset-4">
                      <Tag size={20} className="text-gray-600"/> Event Types
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {venue.event_types?.length > 0 ? (
                        venue.event_types.map((e, i) => (
                            <span key={i} className="px-4 py-1.5 bg-white text-gray-600 border border-gray-200 rounded-xl text-sm font-bold shadow-sm">
                                {e}
                            </span>
                        ))
                    ) : (
                        <p className="text-xs text-gray-400 italic">No event types selected</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Sticky Stats */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 sticky top-6">
            <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Venue Metrics</h3>
            
            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="text-gray-500 font-bold text-xs uppercase flex items-center gap-2 tracking-widest"><Users size={18} className="text-blue-600"/> Max Capacity</span>
                <span className="font-black text-lg text-gray-900">{venue.capacity}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="text-gray-500 font-bold text-xs uppercase flex items-center gap-2 tracking-widest"><DollarSign size={18} className="text-green-600"/> Price Per Plate</span>
                <span className="font-black text-lg text-gray-900">₹{venue.price_per_plate}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="text-gray-500 font-bold text-xs uppercase flex items-center gap-2 tracking-widest"><Clock size={18} className="text-purple-600"/> Op. Hours</span>
                <span className="font-black text-sm text-gray-900">
                    {venue.start_time?.substring(0,5) || "09:00"} - {venue.end_time?.substring(0,5) || "22:00"}
                </span>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact Details</h4>
                <Shield size={16} className="text-green-500" />
              </div>
              <div className="group flex items-center p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors">
                <Phone size={18} className="mr-3 text-gray-400 group-hover:text-blue-600"/>
                <span className="font-bold text-sm text-gray-700">{venue.contact_phone}</span>
              </div>
              <div className="group flex items-center p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors overflow-hidden">
                <Mail size={18} className="mr-3 text-gray-400 group-hover:text-blue-600"/>
                <span className="font-bold text-sm text-gray-700 truncate">{venue.email}</span>
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-gray-100">
               <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-6 rounded-3xl text-white text-center shadow-lg shadow-blue-900/20">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Performance</p>
                  <p className="text-3xl font-black mb-1">0</p>
                  <p className="text-xs font-bold opacity-80 uppercase tracking-tighter">Total Bookings</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}