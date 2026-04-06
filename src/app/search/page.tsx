"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { MapPin, Users, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl } from "@/lib/imageHelper";

interface Venue {
  id: number;
  name: string;
  description: string;
  city: string;
  capacity: number;
  price_per_plate: number;
  primary_image: string | null;
}

interface PaginationMeta {
  current_page: number;
  total: number;
  per_page: number;
  last_page: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [guestCount, setGuestCount] = useState(searchParams.get('guests') || '');
  const [sortBy, setSortBy] = useState('recommended');
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    fetchVenues();
  }, [location, guestCount, sortBy, currentPage]);
  
  const fetchVenues = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        per_page: 12,
      };
      if (location) params.location = location;
      if (guestCount) params.guests = guestCount;
      if (sortBy !== 'recommended') params.sort = sortBy;
      
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/venues/search`, { params });
      
      // Handle nested data structure
      const paginatedData = res.data.data;
      const venuesData = paginatedData.data;
      setVenues(Array.isArray(venuesData) ? venuesData : []);
      
      setPagination({
        current_page: paginatedData.current_page,
        total: paginatedData.total,
        per_page: paginatedData.per_page,
        last_page: paginatedData.last_page,
      });
    } catch (error) {
      console.error("Search error:", error);
      setVenues([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (guestCount) params.set('guests', guestCount);
    router.push(`/search?${params.toString()}`);
    fetchVenues();
  };
  
  const handleClearFilters = () => {
    setLocation('');
    setGuestCount('');
    setSortBy('recommended');
    setCurrentPage(1);
    router.push('/search');
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.last_page)) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Your Perfect Wedding Venue</h1>
          <p className="text-gray-600">Discover the best wedding halls and party palaces in Nepal</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City (e.g., Kathmandu)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Guest Capacity</label>
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Any</option>
                <option value="50">50+ guests</option>
                <option value="100">100+ guests</option>
                <option value="300">300+ guests</option>
                <option value="500">500+ guests</option>
                <option value="1000">1000+ guests</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="recommended">Recommended</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg flex items-center gap-2">
                <Search size={18} /> Search
              </button>
              {(location || guestCount || sortBy !== 'recommended') && (
                <button type="button" onClick={handleClearFilters} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>
        
        {!loading && pagination && (
          <div className="mb-4 text-gray-600">
            Found {pagination.total} venue{pagination.total !== 1 ? 's' : ''}
            {location && ` in ${location}`}
            {guestCount && ` with ${guestCount}+ guests`}
          </div>
        )}
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : venues.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No venues found</h3>
            <p className="text-gray-600 mb-4">
              {location || guestCount ? "Try adjusting your search filters." : "No venues available at the moment."}
            </p>
            <button onClick={handleClearFilters} className="bg-pink-600 text-white px-6 py-2 rounded-lg">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <Link key={venue.id} href={`/venues/${venue.id}`} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={getImageUrl(venue.primary_image)}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">{venue.name}</h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                      <MapPin size={16} className="text-pink-500" /> {venue.city}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{venue.description || "Beautiful wedding venue with excellent facilities."}</p>
                    <div className="flex items-center justify-between border-t pt-4">
                      <div>
                        <span className="text-xs text-gray-400 uppercase">Capacity</span>
                        <div className="flex items-center gap-1 font-semibold text-gray-700">
                          <Users size={14} /> {venue.capacity} guests
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-pink-600">₹{venue.price_per_plate.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 uppercase">Per Plate</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {pagination && pagination.last_page > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-2 border rounded-lg disabled:opacity-50">
                  <ChevronLeft size={18} />
                </button>
                <span className="px-4 py-2 text-gray-700">Page {currentPage} of {pagination.last_page}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.last_page} className="px-3 py-2 border rounded-lg disabled:opacity-50">
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}