"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/imageHelper";

interface Location {
  city: string;
  venue_count: number;
  image: string;
}

export default function PopularLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [bestLocation, setBestLocation] = useState<Location | null>(null);

  useEffect(() => {
    api.getPopularLocations().then(res => {
      setLocations(res.locations);
      setBestLocation(res.best_location);
    }).catch(console.error);
  }, []);

  if (locations.length === 0) return null;

  return (
    <section className="container mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Popular Wedding Hall Locations
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Browse the most sought-after locations for weddings in Nepal.
          {bestLocation && (
            <span className="block mt-2 text-pink-600 font-semibold">
              ⭐ Best Pick: {bestLocation.city} with {bestLocation.venue_count}+ verified venues
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {locations.slice(0, 4).map((loc, idx) => (
          <Link
            key={loc.city}
            href={`/search?location=${encodeURIComponent(loc.city)}`}
            className="group relative rounded-xl overflow-hidden shadow-lg cursor-pointer h-64 block"
          >
           <img
  src={getImageUrl(loc.image)}
  alt={loc.city}
  className="..."
  onError={(e) => {
    // Prevent infinite loop by checking if already using fallback
    if (e.currentTarget.src !== '/placeholder.png') {
      e.currentTarget.src = '/placeholder.png';
    }
  }}
/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
              <h3 className="text-white text-xl font-bold flex items-center gap-2">
                <MapPin size={18} /> {loc.city}
                {idx === 0 && <span className="text-yellow-400 text-sm">⭐ Best</span>}
              </h3>
              <p className="text-gray-200 text-sm">{loc.venue_count}+ Wedding Halls</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}