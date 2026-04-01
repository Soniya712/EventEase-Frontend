"use client";

import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { MapPin, CheckCircle, Star, Users } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      
      {/* Popular Destinations Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Popular Wedding Hall Locations
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse the most sought-after locations for weddings in Nepal. We have verified party palaces in all major cities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="group relative rounded-xl overflow-hidden shadow-lg cursor-pointer h-64">
            <img src="https://images.unsplash.com/photo-1545063914-a1a6kcfa59cb?q=80&w=2069&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Kathmandu" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
              <h3 className="text-white text-xl font-bold flex items-center gap-2"><MapPin size={18} /> Kathmandu</h3>
              <p className="text-gray-200 text-sm">120+ Wedding Halls</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative rounded-xl overflow-hidden shadow-lg cursor-pointer h-64">
            <img src="https://images.unsplash.com/photo-1583253683056-11f8b1eb7285?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Lalitpur" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
              <h3 className="text-white text-xl font-bold flex items-center gap-2"><MapPin size={18} /> Lalitpur</h3>
              <p className="text-gray-200 text-sm">85+ Wedding Halls</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative rounded-xl overflow-hidden shadow-lg cursor-pointer h-64">
            <img src="https://images.unsplash.com/photo-1596484552993-9c59505c865a?q=80&w=1976&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Bhaktapur" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
              <h3 className="text-white text-xl font-bold flex items-center gap-2"><MapPin size={18} /> Bhaktapur</h3>
              <p className="text-gray-200 text-sm">40+ Wedding Halls</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="group relative rounded-xl overflow-hidden shadow-lg cursor-pointer h-64">
            <img src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2071&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Pokhara" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
              <h3 className="text-white text-xl font-bold flex items-center gap-2"><MapPin size={18} /> Pokhara</h3>
              <p className="text-gray-200 text-sm">60+ Wedding Halls</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Use EventEase (Simplified Features) */}
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
              <p className="text-gray-600">See the price per plate (veg/non-veg) before you book.</p>
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