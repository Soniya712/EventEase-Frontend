"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import { 
  UserPlus, 
  ArrowLeft, 
  Save,
  Mail,
  Phone,
  Lock,
  User,
  Shield
} from "lucide-react";

export default function CreateUserPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: 'staff' // Default role
  });

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    setUserName(name || 'Admin');
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Password confirmation validation
    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: ['Passwords do not match'] });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users`,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          password: formData.password,
          role: formData.role
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      alert("User created successfully!");
      router.push('/admin/users');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || "Failed to create user");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleBasedLayout userName={userName} userRole="admin">
      <div className="mb-8">
        <Link 
          href="/admin/users" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4"
        >
          <ArrowLeft size={18} /> Back to Users
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
        <p className="text-gray-500 mt-1 font-medium">Add a new user to the system</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${errors.name ? 'border-red-300' : 'border-none'} rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium`}
                required
              />
            </div>
            {errors.name && (
              <p className="mt-2 text-sm text-red-600">{errors.name[0]}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-300' : 'border-none'} rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium`}
                required
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email[0]}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${errors.phone ? 'border-red-300' : 'border-none'} rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium`}
              />
            </div>
            {errors.phone && (
              <p className="mt-2 text-sm text-red-600">{errors.phone[0]}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${errors.password ? 'border-red-300' : 'border-none'} rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium`}
                required
                minLength={8}
              />
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password[0]}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${errors.password_confirmation ? 'border-red-300' : 'border-none'} rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium`}
                required
              />
            </div>
            {errors.password_confirmation && (
              <p className="mt-2 text-sm text-red-600">{errors.password_confirmation[0]}</p>
            )}
          </div>

          {/* Role Selection */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              User Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Shield className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${errors.role ? 'border-red-300' : 'border-none'} rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 appearance-none`}
                required
              >
                <option value="staff">Staff</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {errors.role && (
              <p className="mt-2 text-sm text-red-600">{errors.role[0]}</p>
            )}
            <p className="mt-2 text-xs text-gray-400 font-medium">
              Staff: Can manage bookings and inquiries<br/>
              Owner: Can manage venues and view analytics<br/>
              Admin: Full system access
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>Creating...</>
              ) : (
                <>
                  <Save size={20} /> Create User
                </>
              )}
            </button>
            <Link
              href="/admin/users"
              className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </RoleBasedLayout>
  );
}