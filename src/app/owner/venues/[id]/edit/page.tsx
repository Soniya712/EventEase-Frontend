"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import VenueForm from "@/components/VenueForm";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function EditVenuePage() {
  const { id } = useParams();
  const router = useRouter();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    setUserName(name || "Owner");

    const fetchVenue = async () => {
      const token = localStorage.getItem("token");
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/owner/venues/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
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

  // Loading State – matches the spinning loader style from the venues page
  if (loading) {
    return (
      <RoleBasedLayout userName={userName} userRole="owner">
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-gray-500 font-medium">Loading venue details...</p>
        </div>
      </RoleBasedLayout>
    );
  }

  // Error State – styled like the “Venue Not Found” card in the reference
  if (error || !venue) {
    return (
      <RoleBasedLayout userName={userName} userRole="owner">
        <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-2xl border border-red-100 shadow-sm text-center">
          <div className="inline-flex items-center justify-center p-4 bg-red-50 rounded-full mb-4">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Venue Not Found</h2>
          <p className="text-gray-600 mt-2 mb-6">
            The venue you are looking for does not exist or you don't have permission to edit it.
          </p>
          <Link
            href="/owner/venues"
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md"
          >
            Back to My Venues
          </Link>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout userName={userName} userRole="owner">
      {/* 
        VenueForm handles the form fields, images, documents, and the PUT request.
        The form's submit button currently uses a pink/purple gradient (default).
        To fully match the owner blue theme, you may want to update the VenueForm 
        component's button classes to use from-blue-600 to-cyan-600.
      */}
      <div className="animate-fadeIn">
        <VenueForm initialData={venue} isEditMode={true} />
      </div>
    </RoleBasedLayout>
  );
}