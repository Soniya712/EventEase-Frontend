"use client";

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Navbar from "@/components/Navbar";
import { 
  MapPin, 
  Users, 
  Search, 
  CheckCircle,
} from "lucide-react";

interface Venue {
  id: number;
  name: string;
  description: string;
  city: string;
  capacity: number;
  price_per_plate: number;
  primary_image: string; 
  verified: boolean;
}

export default function BrowseVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/public/venues`);
      // Ensure we handle the response structure correctly
      setVenues(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (error) {
      console.error("Error fetching venues:", error);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        venue.name.toLowerCase().includes(searchLower) ||
        venue.city.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm, venues]);

  if (loading) return (
    <>
      <Navbar />
      <div className="p-20 text-center font-bold">Loading Venues...</div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 mb-8 text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Find Your Perfect Wedding Venue</h1>
          
          {/* Search Bar Container */}
          <div className="max-w-2xl mx-auto flex gap-2 bg-white p-2 rounded-xl shadow-lg">
             <div className="flex items-center pl-3 text-gray-400">
               <Search size={20} />
             </div>
             <input 
               type="text" 
               placeholder="Search by venue name or city (e.g. Kathmandu)..." 
               className="flex-1 p-2 outline-none text-gray-800"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             {searchTerm && (
               <button 
                 onClick={() => setSearchTerm('')} 
                 className="text-gray-400 hover:text-gray-600 px-2"
               >
                 Clear
               </button>
             )}
          </div>
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVenues.map(venue => (
            <div key={venue.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative h-56 overflow-hidden">
                <img
                  src={venue.primary_image || "/placeholder.png"}
                  alt={venue.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/400x300?text=No+Image";
                  }}
                />
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl text-gray-900 line-clamp-1">{venue.name}</h3>
                  {venue.verified && <CheckCircle size={18} className="text-green-500 shrink-0" />}
                </div>
                
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                  <MapPin size={16} className="text-pink-500" /> {venue.city}
                </div>

                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Capacity</span>
                    <span className="flex items-center gap-1 font-semibold text-gray-700">
                      <Users size={14}/> {venue.capacity} guests
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-pink-600">₹{venue.price_per_plate}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Per Plate</p>
                  </div>
                </div>

                <Link 
                  href={`/venues/${venue.id}`}
                  className="mt-6 block w-full text-center py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-pink-600 transition-all duration-300 shadow-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty State */}
        {filteredVenues.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No matches for "{searchTerm}"</h3>
            <p className="mt-1">Try checking for typos or searching for a different city.</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-4 text-pink-600 font-bold hover:underline"
            >
              Show all venues
            </button>
          </div>
        )}
      </div>
    </>
  );
}