"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { User, Building2, Eye, EyeOff, Calendar } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "owner" ? "owner" : "customer";

  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        ...formData,
        role: role,
      });

      // If registration is successful, automatically log them in
      const loginResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        login: formData.email,
        password: formData.password,
      });

      const { token, role: userRole, user } = loginResponse.data;

      // Save user data
      localStorage.setItem("token", token);
      localStorage.setItem("user_role", userRole);
      localStorage.setItem("user_name", user.name);
      localStorage.setItem("user_email", formData.email);

      alert(`Welcome to EventEase, ${user.name}! Your account has been created successfully.`);

      // Redirect based on role (same logic as login)
      if (userRole === 'admin') {
        router.push("/admin/dashboard");
      } else if (userRole === 'owner') {
        router.push("/owner/dashboard");
      } else {
        router.push("/dashboard");
      }

    } catch (error: any) {
      alert("Error: " + (error.response?.data?.message || "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Left Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 md:p-8">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="text-white" size={32} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                EventEase
              </h1>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Join EventEase Today
            </h2>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              Start your journey to perfect event planning or venue management
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <button
              onClick={() => setRole("customer")}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                role === "customer"
                  ? "border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg transform scale-105"
                  : "border-gray-200 bg-white hover:border-pink-200 hover:shadow-md"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center ${
                  role === "customer" ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-600"
                }`}>
                  <User size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Customer</h3>
                <p className="text-gray-500 text-sm">
                  Book venues, plan events, and manage celebrations
                </p>
                {role === "customer" && (
                  <div className="mt-4 text-pink-600 font-semibold flex items-center gap-2">
                    <div className="w-3 h-3 bg-pink-600 rounded-full"></div>
                    Selected
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => setRole("owner")}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                role === "owner"
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg transform scale-105"
                  : "border-gray-200 bg-white hover:border-blue-200 hover:shadow-md"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center ${
                  role === "owner" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                }`}>
                  <Building2 size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Venue Owner</h3>
                <p className="text-gray-500 text-sm">
                  List your venue, manage bookings, and grow your business
                </p>
                {role === "owner" && (
                  <div className="mt-4 text-blue-600 font-semibold flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    Selected
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {role === "customer" ? "Customer Registration" : "Business Registration"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-3">
                    <span className="text-pink-600">*</span> Full Name
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    onChange={handleChange}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-3">
                    <span className="text-pink-600">*</span> Phone Number
                  </label>
                  <input 
                    type="tel" 
                    name="phone" 
                    onChange={handleChange}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    placeholder="+977 98XXXXXXXX"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-3">
                  <span className="text-pink-600">*</span> Email Address
                </label>
                <input 
                  type="email" 
                  name="email" 
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-3">
                    <span className="text-pink-600">*</span> Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent pr-12 transition-all duration-200"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">At least 8 characters</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-3">
                    <span className="text-pink-600">*</span> Confirm Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      name="password_confirmation" 
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent pr-12 transition-all duration-200"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Must match password</p>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="mt-1 h-5 w-5 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link href="/terms" className="text-pink-600 hover:underline font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-pink-600 hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed ${
                  role === "customer"
                    ? "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </span>
                ) : (
                  role === "customer" ? "Create Customer Account" : "Register Business"
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-pink-600 font-semibold hover:text-pink-800 hover:underline transition-colors">
                  Sign In Now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Benefits & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-pink-600 to-purple-600 text-white p-8 md:p-12 flex-col justify-center">
        <div className="max-w-lg mx-auto">
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Join EventEase?
            </h2>
            <p className="text-xl opacity-90 leading-relaxed">
              Discover the perfect venue or showcase your space to thousands of event planners.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 gap-6 mb-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Seamless Booking</h3>
                  <p className="opacity-90">
                    Book venues instantly with transparent pricing and real-time availability.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Grow Your Business</h3>
                  <p className="opacity-90">
                    Reach more customers and manage bookings efficiently with our platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Verified Listings</h3>
                  <p className="opacity-90">
                    All venues are verified for quality, capacity, and amenities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="opacity-90">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="opacity-90">Verified Venues</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="opacity-90">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="opacity-90">Support</div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <p className="italic text-lg mb-4">
              "As a venue owner, EventEase helped me increase bookings by 300% in just 3 months!"
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <span className="font-bold text-lg">RS</span>
              </div>
              <div>
                <div className="font-semibold text-lg">Rajesh Sharma</div>
                <div className="opacity-80">Venue Owner, Kathmandu</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-xl opacity-90 mb-6">
              Ready to start your event planning journey?
            </p>
            <Link href="/browse-venues">
              <button className="w-full bg-white text-pink-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl">
                Explore Venues
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}