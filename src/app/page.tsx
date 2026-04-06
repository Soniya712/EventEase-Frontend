"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsBanner from "@/components/StatsBanner";
import PopularLocations from "@/components/PopularLocations";
import { CheckCircle, Star, Users } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      <StatsBanner />
      <PopularLocations />

      {/* Features Section (static but can be made dynamic) */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-pink-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="text-pink-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Verified Listings</h3>
              <p className="text-gray-600">Every wedding hall is verified for capacity and amenities.</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-pink-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <Star className="text-pink-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Transparent Pricing</h3>
              <p className="text-gray-600">See the price per plate before you book.</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-pink-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <Users className="text-pink-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Direct Owner Access</h3>
              <p className="text-gray-600">Chat directly with venue owners to customize your event.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}