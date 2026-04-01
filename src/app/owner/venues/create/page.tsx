// app/owner/venues/create/page.tsx
"use client";
import { useEffect, useState } from "react";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import VenueForm from "@/components/VenueForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateVenuePage() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    setUserName(name || 'Owner');
  }, []);

  return (
    <RoleBasedLayout userName={userName} userRole="owner">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/owner/venues" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Venues
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Create New Venue</h1>
            <p className="text-gray-600 mt-1">Add a new venue to your portfolio</p>
          </div>
          <div className="p-6">
            <VenueForm />
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
} 