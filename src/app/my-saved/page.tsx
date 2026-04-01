// app/my-saved/page.tsx
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RoleBasedLayout from "@/components/RoleBasedLayout";
import { 
  MapPin, 
  Star, 
  Heart, 
  Users, 
  Filter,
  Search,
  Trash2,
  Calendar,
  MessageSquare,
  Building2,
  ChevronRight,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  Share2,
  AlertCircle,
  X
} from "lucide-react";

interface SavedVenue {
  id: number;
  venue_id: number;
  name: string;
  description: string;
  city: string;
  address: string;
  capacity: number;
  price_per_plate: number;
  rating: number;
  review_count: number;
  primary_image: string;
  amenities: string[];
  saved_at: string;
  venue: {
    id: number;
    name: string;
    city: string;
    price_per_plate: number;
    capacity: number;
    rating: number;
  };
}

export default function MySavedVenuesPage() {
  const router = useRouter();
  const [savedVenues, setSavedVenues] = useState<SavedVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [selectedVenues, setSelectedVenues] = useState<number[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [venuesToCompare, setVenuesToCompare] = useState<SavedVenue[]>([]);

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    setUserName(name || 'User');
    fetchSavedVenues();
  }, []);

  const fetchSavedVenues = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/saved-venues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedVenues(res.data);
    } catch (error) {
      console.error("Error fetching saved venues:", error);
      // Mock data for demonstration
      const mockData = generateMockData();
      setSavedVenues(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (): SavedVenue[] => {
    return [
      {
        id: 1,
        venue_id: 101,
        name: "Grand Palace Wedding Hall",
        description: "Luxurious wedding hall with modern amenities and spacious garden area",
        city: "Kathmandu",
        address: "New Baneshwor, Kathmandu",
        capacity: 500,
        price_per_plate: 2500,
        rating: 4.8,
        review_count: 124,
        primary_image: "https://images.unsplash.com/photo-1545063914-a1a6kcfa59cb",
        amenities: ["Parking", "AC", "Garden", "Sound System", "Catering"],
        saved_at: "2024-01-15T10:30:00Z",
        venue: {
          id: 101,
          name: "Grand Palace Wedding Hall",
          city: "Kathmandu",
          price_per_plate: 2500,
          capacity: 500,
          rating: 4.8
        }
      },
      {
        id: 2,
        venue_id: 102,
        name: "Royal Garden Resort",
        description: "Beautiful garden resort perfect for outdoor weddings",
        city: "Lalitpur",
        address: "Patan, Lalitpur",
        capacity: 300,
        price_per_plate: 1800,
        rating: 4.5,
        review_count: 89,
        primary_image: "https://images.unsplash.com/photo-1583253683056-11f8b1eb7285",
        amenities: ["Garden", "Parking", "Decoration", "Music System"],
        saved_at: "2024-01-14T14:20:00Z",
        venue: {
          id: 102,
          name: "Royal Garden Resort",
          city: "Lalitpur",
          price_per_plate: 1800,
          capacity: 300,
          rating: 4.5
        }
      },
      {
        id: 3,
        venue_id: 103,
        name: "Heritage Banquet Hall",
        description: "Traditional banquet hall with heritage architecture",
        city: "Bhaktapur",
        address: "Durbar Square, Bhaktapur",
        capacity: 400,
        price_per_plate: 2200,
        rating: 4.7,
        review_count: 67,
        primary_image: "https://images.unsplash.com/photo-1596484552993-9c59505c865a",
        amenities: ["Heritage Building", "AC", "Parking", "Traditional Decor"],
        saved_at: "2024-01-10T09:15:00Z",
        venue: {
          id: 103,
          name: "Heritage Banquet Hall",
          city: "Bhaktapur",
          price_per_plate: 2200,
          capacity: 400,
          rating: 4.7
        }
      },
      {
        id: 4,
        venue_id: 104,
        name: "Modern Convention Center",
        description: "State-of-the-art convention center with latest facilities",
        city: "Pokhara",
        address: "Lakeside, Pokhara",
        capacity: 1000,
        price_per_plate: 3000,
        rating: 4.9,
        review_count: 203,
        primary_image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa",
        amenities: ["AC", "Parking", "VIP Lounge", "Projector", "WiFi"],
        saved_at: "2024-01-12T16:45:00Z",
        venue: {
          id: 104,
          name: "Modern Convention Center",
          city: "Pokhara",
          price_per_plate: 3000,
          capacity: 1000,
          rating: 4.9
        }
      },
    ];
  };

  const handleRemoveSaved = async (venueId: number, venueName: string) => {
    if (!window.confirm(`Remove "${venueName}" from your saved venues?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/user/saved-venues/${venueId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from state
      setSavedVenues(savedVenues.filter(venue => venue.id !== venueId));
      setSelectedVenues(selectedVenues.filter(id => id !== venueId));
      
      // Remove from comparison if selected
      setVenuesToCompare(venuesToCompare.filter(venue => venue.id !== venueId));
    } catch (error) {
      console.error("Error removing saved venue:", error);
      alert("Failed to remove venue. Please try again.");
    }
  };

  const handleSelectVenue = (venueId: number) => {
    setSelectedVenues(prev => 
      prev.includes(venueId) 
        ? prev.filter(id => id !== venueId)
        : [...prev, venueId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVenues.length === savedVenues.length) {
      setSelectedVenues([]);
    } else {
      setSelectedVenues(savedVenues.map(venue => venue.id));
    }
  };

  const handleCompare = () => {
    const selected = savedVenues.filter(venue => selectedVenues.includes(venue.id));
    if (selected.length >= 2) {
      setVenuesToCompare(selected.slice(0, 4)); // Max 4 venues for comparison
      setShowCompareModal(true);
    } else {
      alert("Please select at least 2 venues to compare");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Remove all saved venues? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/user/saved-venues/clear-all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSavedVenues([]);
      setSelectedVenues([]);
      setVenuesToCompare([]);
    } catch (error) {
      console.error("Error clearing saved venues:", error);
    }
  };

  const getCities = () => {
    const cities = [...new Set(savedVenues.map(venue => venue.city))];
    return cities;
  };

  const getDaysAgo = (dateString: string) => {
    const savedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - savedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 'Today' : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const filteredVenues = savedVenues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venue.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = cityFilter === 'all' || venue.city === cityFilter;
    const matchesPrice = priceFilter === 'all' || 
      (priceFilter === 'low' && venue.price_per_plate < 2000) ||
      (priceFilter === 'medium' && venue.price_per_plate >= 2000 && venue.price_per_plate <= 3000) ||
      (priceFilter === 'high' && venue.price_per_plate > 3000);
    
    return matchesSearch && matchesCity && matchesPrice;
  });

  if (loading) {
    return (
      <RoleBasedLayout userName={userName} userRole="user">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded-xl mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout userName={userName} userRole="user">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Saved Venues</h1>
            <p className="text-gray-600 mt-2">Your personalized collection of wedding venues</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedVenues.length > 0 && (
              <>
                <button
                  onClick={handleCompare}
                  className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <TrendingUp size={18} />
                  Compare ({selectedVenues.length})
                </button>
                <button
                  onClick={() => {
                    selectedVenues.forEach(id => {
                      const venue = savedVenues.find(v => v.id === id);
                      if (venue) handleRemoveSaved(id, venue.name);
                    });
                  }}
                  className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Remove Selected
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-pink-50 to-white rounded-xl border border-pink-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Saved</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{savedVenues.length}</p>
            </div>
            <div className="p-3 bg-pink-100 rounded-lg">
              <Heart className="text-pink-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cities</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{getCities().length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <MapPin className="text-blue-600" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">Different locations</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Price</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ₹{Math.round(savedVenues.reduce((sum, venue) => sum + venue.price_per_plate, 0) / savedVenues.length)}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <DollarSign className="text-amber-600" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">Per plate</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Rating</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {savedVenues.length > 0 
                  ? (savedVenues.reduce((sum, venue) => sum + venue.rating, 0) / savedVenues.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Star className="text-green-600" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">Across all saved</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search saved venues by name or location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
              <select 
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white min-w-[140px]"
              >
                <option value="all">All Cities</option>
                {getCities().map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <DollarSign className="absolute left-3 top-3 text-gray-400" size={20} />
              <select 
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white min-w-[140px]"
              >
                <option value="all">All Prices</option>
                <option value="low">Under ₹2,000</option>
                <option value="medium">₹2,000 - ₹3,000</option>
                <option value="high">Above ₹3,000</option>
              </select>
            </div>

            {savedVenues.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <Trash2 size={18} />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {savedVenues.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={selectedVenues.length === savedVenues.length && savedVenues.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-600">
                {selectedVenues.length > 0 
                  ? `${selectedVenues.length} venue${selectedVenues.length > 1 ? 's' : ''} selected`
                  : 'Select all venues'
                }
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredVenues.length} of {savedVenues.length} saved venues
            </div>
          </div>
        )}
      </div>

      {/* Saved Venues Grid */}
      {filteredVenues.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Heart className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || cityFilter !== 'all' || priceFilter !== 'all' 
              ? "No saved venues match your filters"
              : "No venues saved yet"
            }
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            {searchTerm || cityFilter !== 'all' || priceFilter !== 'all' 
              ? "Try adjusting your search filters or browse venues to save your favorites."
              : "Start exploring wedding venues and save your favorites for later comparison."
            }
          </p>
          <Link 
            href="/venues" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <Building2 size={18} />
            Browse Venues
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <div 
              key={venue.id}
              className={`bg-white rounded-xl shadow-sm border ${
                selectedVenues.includes(venue.id) 
                  ? 'border-pink-500 ring-2 ring-pink-100' 
                  : 'border-gray-200 hover:border-pink-300'
              } overflow-hidden transition-all duration-300`}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-4 left-4 z-10">
                <input 
                  type="checkbox" 
                  checked={selectedVenues.includes(venue.id)}
                  onChange={() => handleSelectVenue(venue.id)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500 w-5 h-5"
                />
              </div>

              {/* Venue Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={venue.primary_image} 
                  alt={venue.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => handleRemoveSaved(venue.id, venue.name)}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                  title="Remove from saved"
                >
                  <Heart className="text-pink-600 fill-pink-600" size={20} />
                </button>
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span>{venue.rating}</span>
                  </div>
                  <div className="bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{venue.city}</span>
                  </div>
                </div>
              </div>

              {/* Venue Details */}
              <div className="p-5">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Link 
                      href={`/venues/${venue.venue_id}`}
                      className="text-lg font-bold text-gray-900 hover:text-pink-600 transition-colors line-clamp-1"
                    >
                      {venue.name}
                    </Link>
                    <span className="text-xl font-bold text-gray-900">
                      ₹{venue.price_per_plate}
                      <span className="text-sm text-gray-500 font-normal ml-1">/plate</span>
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{venue.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Users size={16} />
                      {venue.capacity} guests
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      Saved {getDaysAgo(venue.saved_at)}
                    </span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Key Amenities</p>
                  <div className="flex flex-wrap gap-1">
                    {venue.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {amenity}
                      </span>
                    ))}
                    {venue.amenities.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{venue.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link 
                    href={`/venues/${venue.venue_id}`}
                    className="flex-1 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-center"
                  >
                    View Details
                  </Link>
                  <Link 
                    href={`/venues/${venue.venue_id}/inquiry`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                    title="Send Inquiry"
                  >
                    <MessageSquare size={18} />
                  </Link>
                  <Link 
                    href={`/venues/${venue.venue_id}/book`}
                    className="px-4 py-2 border border-green-300 text-green-700 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center justify-center"
                    title="Book Now"
                  >
                    <Calendar size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips for Choosing */}
      <div className="mt-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-pink-100 rounded-lg">
            <AlertCircle className="text-pink-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tips for Choosing Your Venue</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Compare pricing:</strong> Consider both per-plate cost and additional charges</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Check capacity:</strong> Ensure the venue can comfortably accommodate your guest count</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Review amenities:</strong> Look for essential amenities like parking, AC, and in-house catering</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Read reviews:</strong> Pay attention to recent reviews from real couples</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Comparison Modal */}
      {showCompareModal && venuesToCompare.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Compare Venues</h2>
                  <p className="text-gray-600">Side-by-side comparison of your selected venues</p>
                </div>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">Features</th>
                      {venuesToCompare.map((venue) => (
                        <th key={venue.id} className="px-4 py-3 text-center min-w-[250px]">
                          <div className="flex flex-col items-center">
                            <img 
                              src={venue.primary_image} 
                              alt={venue.name}
                              className="w-20 h-20 rounded-lg mb-2 object-cover"
                            />
                            <h3 className="font-bold text-gray-900">{venue.name}</h3>
                            <p className="text-sm text-gray-600">{venue.city}</p>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50">Price per Plate</td>
                      {venuesToCompare.map((venue) => (
                        <td key={venue.id} className="px-4 py-3 text-center">
                          <span className="text-xl font-bold text-gray-900">₹{venue.price_per_plate}</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50">Capacity</td>
                      {venuesToCompare.map((venue) => (
                        <td key={venue.id} className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users size={16} className="text-gray-400" />
                            <span>{venue.capacity} guests</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50">Rating</td>
                      {venuesToCompare.map((venue) => (
                        <td key={venue.id} className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                            <span>{venue.rating}</span>
                            <span className="text-gray-500">({venue.review_count})</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50">Amenities</td>
                      {venuesToCompare.map((venue) => (
                        <td key={venue.id} className="px-4 py-3">
                          <div className="space-y-1">
                            {venue.amenities.slice(0, 5).map((amenity, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-green-500" />
                                <span className="text-sm">{amenity}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50">Actions</td>
                      {venuesToCompare.map((venue) => (
                        <td key={venue.id} className="px-4 py-3 text-center">
                          <div className="flex flex-col gap-2">
                            <Link 
                              href={`/venues/${venue.venue_id}`}
                              className="py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
                            >
                              View Details
                            </Link>
                            <Link 
                              href={`/venues/${venue.venue_id}/book`}
                              className="py-2 border border-pink-600 text-pink-600 rounded-lg font-medium hover:bg-pink-50 transition-colors"
                            >
                              Book Now
                            </Link>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      // Share comparison functionality
                      alert('Share feature coming soon!');
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Share2 size={18} />
                    Share Comparison
                  </button>
                  <Link 
                    href="/venues"
                    className="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Browse More Venues
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </RoleBasedLayout>
  );
}