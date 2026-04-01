"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import DashboardLayout from "@/components/DashboardNavbar";
import VenueForm from "@/components/VenueForm";
import { Loader2, AlertCircle } from "lucide-react";

export default function EditVenuePage() {
  const { id } = useParams();
  const router = useRouter();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // 1. Get User Name for Layout
    const name = localStorage.getItem("user_name");
    setUserName(name || 'Owner');
    
    // 2. Fetch the specific venue data
    const fetchVenue = async () => {
      const token = localStorage.getItem("token");
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/owner/venues/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data) {
          setVenue(res.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error loading venue:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchVenue();
  }, [id]);

  // Loading State
  if (loading) {
    return (
      <DashboardLayout userName={userName} userType="owner">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-gray-500 font-medium">Loading venue details...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Error State (Venue not found or API error)
  if (error || !venue) {
    return (
      <DashboardLayout userName={userName} userType="owner">
        <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-2xl border border-red-100 shadow-sm text-center">
          <div className="inline-flex items-center justify-center p-4 bg-red-50 rounded-full mb-4">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Venue Not Found</h2>
          <p className="text-gray-600 mt-2 mb-6">
            The venue you are looking for does not exist or you don't have permission to edit it.
          </p>
          <button 
            onClick={() => router.push('/owner/venues')}
            className="px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all"
          >
            Back to Venues
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName={userName} userType="owner">
      {/* 
          We pass initialData (the venue object) and isEditMode={true} 
          The VenueForm handles all the fields, images, and the PUT request logic internally.
      */}
      <div className="animate-fadeIn">
        <VenueForm initialData={venue} isEditMode={true} />
      </div>
    </DashboardLayout>
  );
}