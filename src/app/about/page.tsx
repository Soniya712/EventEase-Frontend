"use client";

import Navbar from "@/components/Navbar";
import { Calendar, Users, Star, Heart, Shield, Award, MapPin, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">About EventEase</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              Nepal's premier platform for discovering and booking the perfect wedding venues and event spaces.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Founded in 2026, EventEase was born from a simple idea: planning your special day should be joyful, not stressful. 
              We saw how difficult it was for couples and event planners in Nepal to find reliable, high-quality venues with transparent pricing.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Today, EventEase connects thousands of happy customers with the finest wedding halls, party palaces, and event spaces 
              across Kathmandu, Lalitpur, Bhaktapur, Pokhara, and beyond. We personally verify every venue to ensure quality, 
              capacity, and amenities meet your expectations.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-pink-600 mb-2">200+</div>
                <div className="text-gray-600 font-semibold">Verified Venues</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-pink-600 mb-2">10k+</div>
                <div className="text-gray-600 font-semibold">Happy Customers</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-pink-600 mb-2">15+</div>
                <div className="text-gray-600 font-semibold">Cities Covered</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-pink-600 mb-2">98%</div>
                <div className="text-gray-600 font-semibold">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-pink-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Our Mission</h3>
              <p className="text-gray-600">
                To simplify event planning by providing a trusted, transparent platform where people can easily discover, compare, 
                and book the perfect venue for their celebrations.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-purple-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Our Vision</h3>
              <p className="text-gray-600">
                To become Nepal's most trusted event planning ecosystem, empowering venue owners and delighting customers 
                with seamless experiences from discovery to celebration.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-gray-100 py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">Why Choose EventEase?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Shield className="text-green-500 mb-4" size={40} />
                <h3 className="text-xl font-bold mb-2">Verified Listings</h3>
                <p className="text-gray-600">Every venue is personally verified for capacity, amenities, and pricing transparency.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Star className="text-yellow-500 mb-4" size={40} />
                <h3 className="text-xl font-bold mb-2">Real Reviews</h3>
                <p className="text-gray-600">Authentic feedback from real customers to help you make informed decisions.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Users className="text-blue-500 mb-4" size={40} />
                <h3 className="text-xl font-bold mb-2">Direct Owner Access</h3>
                <p className="text-gray-600">Chat directly with venue owners to customize packages and get the best deals.</p>
              </div>
            </div>
          </div>
        </section>

       

        {/* CTA */}
        <section className="bg-pink-600 text-white py-16">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Plan Your Dream Event?</h2>
            <p className="text-lg mb-8">Join thousands of happy customers who found their perfect venue on EventEase.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/venues" className="bg-white text-pink-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition">
                Browse Venues
              </Link>
              <Link href="/contact" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}