"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import { 
  ArrowLeft, 
  Save,
  Mail,
  Phone,
  User,
  Shield,
  Lock
} from "lucide-react";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;
  
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: ''
  });

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    setUserName(name || 'Admin');
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = res.data;
      
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        password_confirmation: '',
        role: user.roles?.[0]?.name || 'staff'
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      alert("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    // Password confirmation validation only if password is provided
    if (formData.password && formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: ['Passwords do not match'] });
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      // Prepare data - only include password if provided
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        role: formData.role
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      alert("User updated successfully!");
      router.push('/admin/users');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || "Failed to update user");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <RoleBasedLayout userName={userName} userRole="admin">
        <div className="animate-pulse p-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout userName={userName} userRole="admin">
      <div className="mb-8">
        <Link 
          href="/admin/users" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4"
        >
          <ArrowLeft size={18} /> Back to Users
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
        <p className="text-gray-500 mt-1 font-medium">Update user information and role</p>
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
                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${errors.phone ? 'border-red-300' : 'border-none'} rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium`}
              />
            </div>
            {errors.phone && (
              <p className="mt-2 text-sm text-red-600">{errors.phone[0]}</p>
            )}
          </div>

          {/* Password Field - Optional for update */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              New Password <span className="text-gray-400 text-xs">(Leave blank to keep current)</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${errors.password ? 'border-red-300' : 'border-none'} rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium`}
                minLength={8}
              />
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password[0]}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          {formData.password && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="Re-enter new password"
                  className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${errors.password_confirmation ? 'border-red-300' : 'border-none'} rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium`}
                />
              </div>
              {errors.password_confirmation && (
                <p className="mt-2 text-sm text-red-600">{errors.password_confirmation[0]}</p>
              )}
            </div>
          )}

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
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save size={20} /> Update User
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