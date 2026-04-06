"use client";

import Navbar from "@/components/Navbar";
import { Mail, Phone, MapPin, Clock, Building2, Globe } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Contact Us</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We're here to help! Reach out to us through any of the channels below.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Contact Info Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Phone */}
              <div className="bg-white rounded-2xl shadow-md p-6 flex items-start gap-5 hover:shadow-lg transition-shadow">
                <div className="bg-pink-100 p-4 rounded-full">
                  <Phone className="text-pink-600" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Phone</h3>
                  <p className="text-gray-700 text-lg">+977 1-1234567</p>
                  <p className="text-gray-500 text-sm mt-1">Mon-Fri, 9am - 6pm</p>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white rounded-2xl shadow-md p-6 flex items-start gap-5 hover:shadow-lg transition-shadow">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Mail className="text-blue-600" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Email</h3>
                  <p className="text-gray-700">support@eventease.com</p>
                  <p className="text-gray-700">info@eventease.com</p>
                  <p className="text-gray-500 text-sm mt-1">We respond within 24 hours</p>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-2xl shadow-md p-6 flex items-start gap-5 hover:shadow-lg transition-shadow">
                <div className="bg-green-100 p-4 rounded-full">
                  <MapPin className="text-green-600" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Office Address</h3>
                  <p className="text-gray-700">Lazimpat, Kathmandu</p>
                  <p className="text-gray-700">Nepal</p>
                </div>
              </div>

              {/* Hours */}
              <div className="bg-white rounded-2xl shadow-md p-6 flex items-start gap-5 hover:shadow-lg transition-shadow">
                <div className="bg-purple-100 p-4 rounded-full">
                  <Clock className="text-purple-600" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Business Hours</h3>
                  <p className="text-gray-700">Monday - Friday: 9am - 6pm</p>
                  <p className="text-gray-700">Saturday: 10am - 2pm</p>
                  <p className="text-gray-500">Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">Find Us Here</h2>
                <p className="text-gray-600 mt-1">Visit our office in Lazimpat, Kathmandu</p>
              </div>
              <div className="h-80 w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.315477261618!2d85.32353031506123!3d27.717679982788688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb190c3b4b8b8b%3A0x5e8e8e8e8e8e8e8e!2sLazimpat%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1641234567890!5m2!1sen!2snp"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="EventEase Office Location"
                ></iframe>
              </div>
            </div>

            {/* Social Media Links (Optional) */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Connect With Us</h3>
              <div className="flex justify-center gap-6">
                <Link href="https://facebook.com" target="_blank" className="text-gray-600 hover:text-pink-600 transition">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </Link>
                <Link href="https://instagram.com" target="_blank" className="text-gray-600 hover:text-pink-600 transition">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zM12 16c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.441s.645 1.44 1.441 1.44c.795 0 1.44-.645 1.44-1.44s-.645-1.441-1.44-1.441z"/>
                  </svg>
                </Link>
                <Link href="https://twitter.com" target="_blank" className="text-gray-600 hover:text-pink-600 transition">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.683-11.79c0-.214-.005-.427-.015-.637A10.012 10.012 0 0023.953 4.57z"/>
                  </svg>
                </Link>
              </div>
            </div>

            {/* Note */}
            <div className="text-center mt-8 text-gray-500 text-sm">
              <p>For venue owners and business inquiries, please email us at <span className="font-semibold">partners@eventease.com</span></p>
              <p className="mt-2">© 2024 EventEase. All rights reserved.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}