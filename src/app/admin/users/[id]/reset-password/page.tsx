"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import { ArrowLeft, Key, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;
  
  const [userName, setUserName] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});
  
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
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
      setUser(res.data);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: ['Passwords do not match'] });
      setSaving(false);
      return;
    }

    if (formData.password.length < 8) {
      setErrors({ password: ['Password must be at least 8 characters'] });
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`,
        {
          password: formData.password
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      alert("Password reset successfully!");
      router.push(`/admin/admin/users/${userId}`);
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || "Failed to reset password");
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
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout userName={userName} userRole="admin">
      <div className="mb-8">
        <Link 
          href={`/admin/users/${userId}`} 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4"
        >
          <ArrowLeft size={18} /> Back to User Details
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
        <p className="text-gray-500 mt-1 font-medium">
          {user ? `Set new password for ${user.name}` : ''}
        </p>
      </div>

      <div className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              New Password <span className="text-red-500">*</span>
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

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Confirm New Password <span className="text-red-500">*</span>
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
                required
              />
            </div>
            {errors.password_confirmation && (
              <p className="mt-2 text-sm text-red-600">{errors.password_confirmation[0]}</p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>Resetting...</>
              ) : (
                <>
                  <Key size={20} /> Reset Password
                </>
              )}
            </button>
            <Link
              href={`/admin/users/${userId}`}
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