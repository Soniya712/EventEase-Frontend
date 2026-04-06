"use client";
import { useState, useEffect } from "react";
import { Search, MapPin, Users, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/imageHelper";

interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  venue_id?: number;
}

export default function Hero() {
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [popularLocations, setPopularLocations] = useState<{ city: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slidesRes, locationsRes] = await Promise.all([
          api.getHeroSlides(),
          api.getPopularLocations(),
        ]);
        setSlides(slidesRes.slides);
        setPopularLocations(locationsRes.locations || []);
      } catch (error) {
        console.error("Hero data error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation) params.append("location", searchLocation);
    if (guestCount) params.append("guests", guestCount);
    router.push(`/search?${params.toString()}`);
  };

  const handleLocationClick = (location: string) => {
    router.push(`/search?location=${encodeURIComponent(location)}`);
  };

  if (loading || slides.length === 0) {
    return (
      <div className="relative h-[85vh] w-full bg-gray-200 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading amazing venues...</div>
      </div>
    );
  }

  return (
    <div className="relative h-[85vh] w-full overflow-hidden flex items-center justify-center">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img
            src={getImageUrl(slide.image)}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      <div className="relative z-20 text-center w-full max-w-5xl px-4 mt-10">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-xl">
          {slides[currentSlide].title}
        </h1>
        <p className="text-xl text-gray-100 mb-10 font-light drop-shadow-md">
          {slides[currentSlide].subtitle}
        </p>

        {/* Dashboard and Create Event links removed */}

        <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-3 md:p-6 max-w-4xl mx-auto flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-500" size={20} />
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Location (e.g., Kathmandu)"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="relative w-full md:w-1/3">
            <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-500" size={20} />
            <select
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-lg appearance-none cursor-pointer"
            >
              <option value="">Guests</option>
              <option value="100">100+ Guests</option>
              <option value="300">300+ Guests</option>
              <option value="500">500+ Guests</option>
              <option value="1000">1000+ Guests</option>
            </select>
          </div>
          <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center gap-2">
            <Search size={22} /> Search Halls
          </button>
        </form>

        <div className="mt-8 flex flex-wrap justify-center gap-4 text-white text-sm">
          {popularLocations.slice(0, 4).map((loc) => (
            <button
              key={loc.city}
              onClick={() => handleLocationClick(loc.city)}
              className="bg-black/30 px-4 py-1 rounded-full border border-white/20 hover:bg-pink-600 transition"
            >
              {loc.city}
            </button>
          ))}
        </div>

        {!isLoggedIn && (
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="bg-white text-pink-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 shadow-lg">
              Get Started
            </Link>
            <Link href="/register" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white/10">
              Create Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}