"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Calendar, Eye, EyeOff } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Pre-fill remembered email if exists
  useEffect(() => {
    const remembered = localStorage.getItem("remembered_email");
    if (remembered) {
      setFormData(prev => ({ ...prev, login: remembered }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Regular login with email/phone
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/login`,
        formData
      );
      
      const { token, role, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user_role", role);
      localStorage.setItem("user_name", user.name);
      localStorage.setItem("user_email", formData.login);

      if (rememberMe) {
        localStorage.setItem("remembered_email", formData.login);
      } else {
        localStorage.removeItem("remembered_email");
      }

      alert(`Welcome back, ${user.name}!`);
      
      if (returnUrl) {
        router.push(decodeURIComponent(returnUrl));
      } else {
        if (role === 'admin') router.push("/admin/dashboard");
        else if (role === 'owner') router.push("/owner/dashboard");
        else router.push("/dashboard");
      }
      
    } catch (error: any) {
      alert("Error: " + (error.response?.data?.message || "Invalid credentials"));
    } finally {
      setLoading(false);
    }
  };

  // Google login using the hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
          access_token: tokenResponse.access_token,
        });

        const { token, user, role, redirect_to } = res.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user_role", role);
        localStorage.setItem("user_name", user.name);
        localStorage.setItem("user_email", user.email);

        alert(`Welcome, ${user.name}!`);
        router.push(redirect_to);
      } catch (error) {
        console.error("Google login failed", error);
        alert("Google login failed. Please try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      alert("Google login failed. Please try again.");
    },
  });

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 md:p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Calendar className="text-white" size={28} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">EventEase</h1>
            </div>
            <p className="text-gray-600 text-lg font-medium">
              Welcome Back to EventEase!
            </p>
            <p className="text-gray-500 mt-2">
              Sign in to manage your venue, events, and bookings seamlessly
            </p>
          </div>

          {/* Regular Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Re-enter your account
              </label>
              <div className="space-y-1">
                <label className="block text-gray-500 text-sm mb-1">Your Email or Phone</label>
                <input 
                  type="text" 
                  name="login" 
                  value={formData.login}
                  placeholder="Enter email or phone" 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                  required 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-500 text-sm mb-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={formData.password}
                  placeholder="Enter your password" 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent pr-10" 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            

            {/* Login Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </span>
              ) : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-sm text-gray-500">Or continue with</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-1 gap-4">
            <button
              type="button"
              onClick={() => googleLogin()}
              disabled={googleLoading}
              className="border border-gray-300 rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Google</span>
                </>
              )}
            </button>
            
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-black font-semibold hover:text-pink-800 hover:underline">
                Sign Up Now
              </Link>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-black hover:underline">Terms</Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-black hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Statistics (unchanged) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-pink-600 to-purple-600 text-white p-8 md:p-12 flex-col justify-center">
        <div className="max-w-lg mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Simplify Your Event Planning</h2>
            <p className="text-lg md:text-xl opacity-90 leading-relaxed">
              From wedding halls to corporate venues, find the perfect space for your celebration. Manage bookings, guest lists, and payments all in one place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 md:gap-8 mb-10">
            <div className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-xl">
              <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
              <div className="text-sm md:text-base opacity-90">Events Managed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-xl">
              <div className="text-3xl md:text-4xl font-bold mb-2">98%</div>
              <div className="text-sm md:text-base opacity-90">Client Satisfaction</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-xl">
              <div className="text-3xl md:text-4xl font-bold mb-2">200+</div>
              <div className="text-sm md:text-base opacity-90">Verified Venues</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-xl">
              <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
              <div className="text-sm md:text-base opacity-90">Customer Support</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
            <p className="italic text-lg mb-4">
              "EventEase made planning our wedding so much easier. Found the perfect venue in just 2 days!"
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <span className="font-bold">SS</span>
              </div>
              <div>
                <div className="font-semibold">Saman & Riya</div>
                <div className="text-sm opacity-80">Recently Married</div>
              </div>
            </div>
          </div>
          <Link href="/venues">
            <button className="w-full bg-white text-black font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl">
              Browse Venues
            </button>
          </Link>
          <div className="mt-10 pt-6 border-t border-white/20">
            <h3 className="text-xl font-bold mb-2">EventEase Venue Management</h3>
            <p className="opacity-90">Premium Event Planning & Booking Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}