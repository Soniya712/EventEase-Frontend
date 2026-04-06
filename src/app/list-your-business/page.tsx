"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { 
  Shield, 
  Users, 
  BarChart, 
  Calendar, 
  MessageSquare, 
  CheckCircle,
  ArrowRight,
  Star,
  Clock,
  TrendingUp
} from "lucide-react";

export default function ListYourBusinessPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">List Your Venue on EventEase</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              Join Nepal's fastest-growing event marketplace. Reach thousands of customers looking for the perfect wedding hall or party palace.
            </p>
            <div className="mt-8">
              <Link href="/register?role=owner" className="inline-flex items-center bg-white text-pink-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg">
                Get Started as Owner <ArrowRight size={18} className="ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Why List With Us?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              EventEase helps venue owners attract more clients, streamline bookings, and grow their business.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-pink-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Reach More Customers</h3>
              <p className="text-gray-600">
                Get your venue in front of thousands of active couples and event planners searching daily.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Manage Bookings Easily</h3>
              <p className="text-gray-600">
                Receive booking requests, track availability, and communicate directly with clients.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Grow Your Business</h3>
              <p className="text-gray-600">
                Increase visibility with featured listings, analytics, and promotional tools.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">How to List Your Venue</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                <h3 className="font-bold text-lg mb-2">Create Account</h3>
                <p className="text-gray-600 text-sm">Sign up as a venue owner with your email and basic details.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                <h3 className="font-bold text-lg mb-2">Add Your Venue</h3>
                <p className="text-gray-600 text-sm">Fill in venue details: name, location, capacity, price, amenities, and photos.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                <h3 className="font-bold text-lg mb-2">Get Verified</h3>
                <p className="text-gray-600 text-sm">Our team reviews and verifies your listing to ensure quality.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
                <h3 className="font-bold text-lg mb-2">Start Receiving Inquiries</h3>
                <p className="text-gray-600 text-sm">Appear in search results and start getting booking requests.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="py-16 container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Listing Requirements</h2>
            <div className="bg-white rounded-2xl shadow-md p-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 shrink-0 mt-1" size={20} />
                  <p><span className="font-semibold">Valid Business License</span> – Your venue must be legally registered.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 shrink-0 mt-1" size={20} />
                  <p><span className="font-semibold">High-Quality Photos</span> – At least 5 clear images of the venue (hall, outdoor space, etc.).</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 shrink-0 mt-1" size={20} />
                  <p><span className="font-semibold">Accurate Capacity & Pricing</span> – Provide real guest capacity and price per plate.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 shrink-0 mt-1" size={20} />
                  <p><span className="font-semibold">Amenities List</span> – Specify available facilities (parking, Wi-Fi, catering, etc.).</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 shrink-0 mt-1" size={20} />
                  <p><span className="font-semibold">Contact Information</span> – Valid phone and email for customer inquiries.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-2">Is there a fee to list my venue?</h3>
              <p className="text-gray-600">Basic listing is free! We offer premium features for enhanced visibility (optional paid plans).</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-2">How long does verification take?</h3>
              <p className="text-gray-600">Typically 1-2 business days. We'll review your submission and notify you once approved.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-2">Can I edit my listing after it's live?</h3>
              <p className="text-gray-600">Yes, you can update photos, pricing, capacity, and availability anytime from your owner dashboard.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-2">How do I receive booking requests?</h3>
              <p className="text-gray-600">Customers will send inquiries via your listing. You'll get email notifications and can respond directly.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join EventEase today and start connecting with thousands of customers looking for venues like yours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register?role=owner" className="bg-white text-pink-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition">
                Create Owner Account
              </Link>
              <Link href="/contact" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition">
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}