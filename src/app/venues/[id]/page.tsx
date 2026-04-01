"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import { 
  MapPin, Users, Star, Heart, Calendar, DollarSign,
  CheckCircle, Phone, Mail, Share2, ChevronLeft, ChevronRight,
  Shield, MessageSquare, X, Send, User, FileText
} from "lucide-react";

export default function VenueDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  
  // Inquiry Modal State
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    full_name: '',
    contact: '',
    email: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    const userEmail = localStorage.getItem("user_email");
    const userPhone = localStorage.getItem("user_phone");
    
    setUserName(name || 'User');
    
    // Pre-fill form with user data if available
    setInquiryForm(prev => ({
      ...prev,
      full_name: name || '',
      contact: userPhone || '',
      email: userEmail || ''
    }));
    
    fetchVenueDetails();
  }, [id]);

  const fetchVenueDetails = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/public/venues/${id}`);
      setVenue(res.data);
    } catch (error) {
      console.error("Error fetching venue details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareVenue = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  // Handle form input
  const handleInquiryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInquiryForm(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev: any) => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: any = {};
    
    if (!inquiryForm.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }
    
    if (!inquiryForm.contact.trim()) {
      errors.contact = 'Contact number is required';
    } else if (!/^[0-9+\-\s()]{10,15}$/.test(inquiryForm.contact)) {
      errors.contact = 'Please enter a valid phone number';
    }
    
    if (!inquiryForm.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(inquiryForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!inquiryForm.message.trim()) {
      errors.message = 'Message is required';
    } else if (inquiryForm.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }
    
    return errors;
  };

  // Submit inquiry
  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/venues/${id}/inquiries`,
        {
          full_name: inquiryForm.full_name,
          contact: inquiryForm.contact,
          email: inquiryForm.email,
          message: inquiryForm.message
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      
      alert("Inquiry sent successfully! The venue owner will contact you soon.");
      setShowInquiryModal(false);
      
      // Reset form but keep user data
      setInquiryForm({
        full_name: localStorage.getItem("user_name") || '',
        contact: localStorage.getItem("user_phone") || '',
        email: localStorage.getItem("user_email") || '',
        message: ''
      });
      setFormErrors({});
      
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to send inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <RoleBasedLayout userName={userName}>
        <div className="animate-pulse p-8">
          <div className="h-96 bg-gray-200 rounded-2xl mb-6"></div>
          <div className="h-10 bg-gray-200 w-1/3 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
        </div>
      </RoleBasedLayout>
    );
  }

  if (!venue) {
    return (
      <RoleBasedLayout userName={userName}>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900">Venue Not Found</h2>
          <Link href="/venues" className="text-pink-600 mt-4 inline-block">← Back to venues</Link>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout userName={userName}>
      {/* Back Link */}
      <div className="mb-6">
        <Link href="/venues" className="inline-flex items-center text-gray-600 hover:text-pink-600 transition-colors">
          <ChevronLeft size={18} className="mr-2" /> Back to venues
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Gallery & Info */}
        <div className="lg:col-span-2">
          
          {/* Main Gallery */}
          <div className="mb-8">
            <div className="relative h-[450px] rounded-2xl overflow-hidden mb-4 bg-gray-100 shadow-inner">
              <img 
                src={venue.images?.[selectedImage] || venue.primary_image} 
                alt={venue.name}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              
              {/* Navigation Arrows */}
              {venue.images?.length > 1 && (
                <>
                  <button 
                    onClick={() => setSelectedImage((prev) => (prev - 1 + venue.images.length) % venue.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md hover:bg-white"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={() => setSelectedImage((prev) => (prev + 1) % venue.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md hover:bg-white"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Top Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={handleShareVenue} className="p-3 bg-white/90 hover:bg-white rounded-full shadow-md">
                  <Share2 size={20} className="text-gray-700" />
                </button>
                <button onClick={() => setIsSaved(!isSaved)} className="p-3 bg-white/90 hover:bg-white rounded-full shadow-md">
                  <Heart size={20} className={isSaved ? "text-pink-600 fill-pink-600" : "text-gray-700"} />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {venue.images?.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-28 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    index === selectedImage ? 'border-pink-600 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>

          {/* Venue Content */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{venue.name}</h1>
                <p className="flex items-center gap-2 text-gray-500 font-medium">
                  <MapPin size={18} className="text-pink-600" /> {venue.address}, {venue.city}
                </p>
              </div>
              <div className="bg-yellow-50 px-4 py-2 rounded-2xl flex items-center gap-2">
                <Star size={20} className="text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-lg text-yellow-700">4.8</span>
                <span className="text-yellow-600/70 text-sm">(124 reviews)</span>
              </div>
            </div>

            {/* Core Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <Users className="text-blue-600 mb-2" size={24} />
                <p className="text-xs text-blue-600 uppercase font-bold tracking-wider">Capacity</p>
                <p className="text-xl font-bold text-blue-900">{venue.capacity} Guests</p>
              </div>
              <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                <DollarSign className="text-green-600 mb-2" size={24} />
                <p className="text-xs text-green-600 uppercase font-bold tracking-wider">Price</p>
                <p className="text-xl font-bold text-green-900">₹{venue.price_per_plate} <span className="text-sm font-normal">/ plate</span></p>
              </div>
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <Shield className="text-purple-600 mb-2" size={24} />
                <p className="text-xs text-purple-600 uppercase font-bold tracking-wider">Status</p>
                <p className="text-xl font-bold text-purple-900">Verified</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <CheckCircle className="text-amber-600 mb-2" size={24} />
                <p className="text-xs text-amber-600 uppercase font-bold tracking-wider">Approved</p>
                <p className="text-xl font-bold text-amber-900">Live</p>
              </div>
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About Venue</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{venue.description}</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {venue.amenities?.map((amenity: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-gray-700">
                      <CheckCircle size={18} className="text-green-500 shrink-0" />
                      <span className="font-medium capitalize">{amenity.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Right Column - Booking & Owner */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Contact & Booking</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="p-3 bg-white rounded-xl shadow-sm text-pink-600">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Phone Number</p>
                  <p className="font-bold text-gray-900">{venue.owner.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Email Address</p>
                  <p className="font-bold text-gray-900">{venue.owner.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link 
                href={`/venues/${venue.id}/book`}
                className="w-full bg-pink-600 text-white py-4 rounded-2xl font-extrabold hover:bg-pink-700 transition-all shadow-lg shadow-pink-100 flex items-center justify-center gap-2 text-center"
              >
                <Calendar size={20} /> Book Venue Now
              </Link>
              
              <button 
                onClick={() => setShowInquiryModal(true)}
                className="w-full bg-white border-2 border-gray-900 text-gray-900 py-4 rounded-2xl font-extrabold hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={20} /> Send Inquiry
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-3 text-gray-500 text-sm justify-center">
              <Shield size={16} className="text-green-500" />
              <span>Verified Owner & Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            {/* Modal Header */}
            <div className="border-b border-gray-100 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Send Inquiry</h2>
                <p className="text-sm text-gray-500 mt-1">to {venue.name}</p>
              </div>
              <button 
                onClick={() => setShowInquiryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitInquiry} className="p-6 space-y-4">
              {/* Full Name Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={inquiryForm.full_name}
                    onChange={handleInquiryChange}
                    placeholder="John Doe"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${formErrors.full_name ? 'border-red-300' : 'border-gray-200'} rounded-xl outline-none focus:ring-2 focus:ring-pink-500 font-medium`}
                  />
                </div>
                {formErrors.full_name && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.full_name}</p>
                )}
              </div>

              {/* Contact (Phone) Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="tel"
                    name="contact"
                    value={inquiryForm.contact}
                    onChange={handleInquiryChange}
                    placeholder="+91 98765 43210"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${formErrors.contact ? 'border-red-300' : 'border-gray-200'} rounded-xl outline-none focus:ring-2 focus:ring-pink-500 font-medium`}
                  />
                </div>
                {formErrors.contact && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.contact}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={inquiryForm.email}
                    onChange={handleInquiryChange}
                    placeholder="john@example.com"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${formErrors.email ? 'border-red-300' : 'border-gray-200'} rounded-xl outline-none focus:ring-2 focus:ring-pink-500 font-medium`}
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <textarea
                    name="message"
                    value={inquiryForm.message}
                    onChange={handleInquiryChange}
                    placeholder="I'm interested in booking this venue for my wedding on..."
                    rows={4}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${formErrors.message ? 'border-red-300' : 'border-gray-200'} rounded-xl outline-none focus:ring-2 focus:ring-pink-500 font-medium resize-none`}
                  />
                </div>
                {formErrors.message && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.message}</p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-pink-600 text-white py-3 rounded-xl font-extrabold hover:bg-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
                  onClick={() => setShowInquiryModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-extrabold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>

              {/* Note */}
              <p className="text-xs text-gray-400 text-center mt-2">
                The venue owner will contact you via email or phone
              </p>
            </form>
          </div>
        </div>
      )}
    </RoleBasedLayout>
  );
}