"use client";
import { useState, useEffect } from "react";
import { Search, MapPin, Users, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Images focused strictly on Wedding Halls / Party Palaces
const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2069&auto=format&fit=crop",
    title: "Find the Perfect Wedding Hall",
    subtitle: "Discover the most elegant party palaces in Nepal for your special day.",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1505236858274-0959ac156d0f?q=80&w=2070&auto=format&fit=crop",
    title: "Celebrate in Style",
    subtitle: "Book spacious venues with premium amenities and catering.",
  },
];

export default function Hero() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [guestCount, setGuestCount] = useState("");

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    // Check login status
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchLocation) queryParams.append("location", searchLocation);
    if (guestCount) queryParams.append("guests", guestCount);
    router.push(`/search?${queryParams.toString()}`);
  };

  const handleLocationClick = (location: string) => {
    setSearchLocation(location);
    router.push(`/search?location=${encodeURIComponent(location)}`);
  };

  return (
    <div className="relative h-[85vh] w-full overflow-hidden flex items-center justify-center">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Overlay - Slightly darker to make text pop */}
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Hero Content */}
      <div className="relative z-20 text-center w-full max-w-5xl px-4 mt-10">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-xl tracking-tight">
          {slides[currentSlide].title}
        </h1>
        <p className="text-xl text-gray-100 mb-10 font-light tracking-wide drop-shadow-md">
          {slides[currentSlide].subtitle}
        </p>

        {/* Conditional CTA for logged-in users */}
        {isLoggedIn && (
          <div className="mb-6 flex justify-center gap-4">
            <Link 
              href="/dashboard"
              className="bg-white/20 backdrop-blur-md border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all flex items-center gap-2 group"
            >
              <Calendar size={20} />
              Go to Dashboard
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/create-event"
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2"
            >
              Create New Event
            </Link>
          </div>
        )}

        {/* Search Box - Single Focus (Wedding Halls) */}
        <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-3 md:p-6 max-w-4xl mx-auto flex flex-col md:flex-row gap-3 items-center transform transition-all hover:scale-[1.01]">
          
          {/* Location Input */}
          <div className="relative flex-grow w-full md:w-auto group">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-500 group-focus-within:text-pink-600" size={20} />
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Location (e.g., Kathmandu, Lalitpur)"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-700 font-medium transition-all"
            />
          </div>

          {/* Guest Count Dropdown (Crucial for Wedding Halls) */}
          <div className="relative w-full md:w-1/3 group">
            <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-500 group-focus-within:text-pink-600" size={20} />
            <select
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-700 font-medium appearance-none cursor-pointer transition-all"
            >
              <option value="">Guests</option>
              <option value="100-300">100 - 300 Guests</option>
              <option value="300-500">300 - 500 Guests</option>
              <option value="500-1000">500 - 1000 Guests</option>
              <option value="1000+">1000+ Guests</option>
            </select>
          </div>

          {/* Search Button */}
          <button 
            type="submit"
            className="w-full md:w-auto bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all text-lg"
          >
            <Search size={22} />
            Search Halls
          </button>
        </form>
        
        {/* Quick Links below search */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-white text-sm font-medium opacity-90">
          {['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara'].map((location) => (
            <button
              key={location}
              onClick={() => handleLocationClick(location)}
              className="bg-black/30 px-4 py-1 rounded-full border border-white/20 hover:bg-pink-600 transition cursor-pointer"
            >
              {location}
            </button>
          ))}
        </div>

        {/* Additional CTA for non-logged in users */}
        {!isLoggedIn && (
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="bg-white text-pink-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Get Started
            </Link>
            <Link 
              href="/register" 
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}