"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import { 
  Calendar, Users, Info, ChevronLeft, 
  CreditCard, LayoutGrid, MapPin 
} from "lucide-react";

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    event_date: "",
    guest_count: 0,
    event_type: "",
    special_requests: ""
  });

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    setUserName(name || 'User');
    fetchVenueDetails();
  }, [id]);

  const fetchVenueDetails = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/public/venues/${id}`);
      setVenue(res.data);
    } catch (error) {
      console.error("Error fetching venue:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!venue || !formData.guest_count) return 0;
    return formData.guest_count * venue.price_per_plate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Please login to book this venue.");
      router.push('/login');
      return;
    }

    try {
      const finalAmount = calculateTotal();
      
      // FIXED: Sending 'total_amount' instead of 'total_price' to match backend validation
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
        venue_id: id,
        event_date: formData.event_date,
        guest_count: formData.guest_count,
        event_type: formData.event_type,
        special_requests: formData.special_requests,
        total_amount: finalAmount 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Booking request submitted! The owner will review it shortly.");
      router.push('/my-bookings'); // Redirect to user's bookings list
    } catch (error: any) {
      console.error("Booking Error:", error.response?.data);
      alert(error.response?.data?.message || "Something went wrong.");
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-bold">Loading venue details...</div>;
  if (!venue) return <div className="p-20 text-center">Venue not found.</div>;

  return (
    <RoleBasedLayout userName={userName} userRole="user">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-gray-600 mb-8 hover:text-pink-600 transition-colors font-bold uppercase text-xs tracking-widest"
        >
          <ChevronLeft size={18} className="mr-1" /> Back to Venue
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Book Your Event</h1>
              <p className="text-gray-500 mb-8 font-medium">Request a booking at {venue.name}.</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Event Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-3.5 text-gray-400" size={18} />
                      <input 
                        type="date" 
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-12 p-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-bold text-gray-700"
                        onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Guests</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-3.5 text-gray-400" size={18} />
                      <input 
                        type="number" 
                        required
                        max={venue.capacity}
                        placeholder={`Max ${venue.capacity}`}
                        className="w-full pl-12 p-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-bold text-gray-700"
                        onChange={(e) => setFormData({...formData, guest_count: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Event Type</label>
                  <div className="relative">
                    <LayoutGrid className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <select 
                      required
                      className="w-full pl-12 p-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none appearance-none font-bold text-gray-700"
                      onChange={(e) => setFormData({...formData, event_type: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      {venue.event_types?.map((type: string) => (
                        <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Special Requests</label>
                  <textarea 
                    rows={4}
                    placeholder="Tell us about your requirements..."
                    className="w-full p-5 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-pink-500 outline-none font-medium text-gray-700"
                    onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-pink-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-200"
                >
                  <CreditCard size={20} /> Request Booking
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tighter">Summary</h2>
              
              <div className="flex gap-4 mb-8">
                <img src={venue.primary_image} className="w-16 h-16 rounded-2xl object-cover bg-gray-100 shadow-sm" alt="" />
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{venue.name}</h3>
                  <p className="text-gray-400 text-xs flex items-center gap-1 mt-1 font-bold">
                    <MapPin size={12} /> {venue.city}
                  </p>
                </div>
              </div>

              <div className="space-y-5 border-t pt-8">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Price / Plate</span>
                  <span className="font-bold text-gray-900">₹{venue.price_per_plate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Guests</span>
                  <span className="font-bold text-gray-900">{formData.guest_count || 0}</span>
                </div>
                
                <div className="pt-6 mt-4 border-t border-gray-50 flex flex-col gap-1">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Estimated Total</p>
                    <p className="text-4xl font-black text-pink-600">
                      ₹{calculateTotal().toLocaleString()}
                    </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
                <Info className="shrink-0 text-blue-600" size={20} />
                <p className="text-xs font-bold text-blue-800 leading-relaxed">
                  Notice: This is a booking request. The owner will review availability and contact you.
                </p>
            </div>
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}