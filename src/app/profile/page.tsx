"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    setUserName(name || "User");
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setEditForm({
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone || "",
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      const errorMsg = error.response?.data?.message || "Failed to load profile";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("email", editForm.email);
      if (editForm.phone) formData.append("phone", editForm.phone);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Backend returns { user: {...}, message }
      const updatedUser = res.data.user;
      setProfile(updatedUser);
      // Update local storage name
      localStorage.setItem("user_name", updatedUser.name);
      setUserName(updatedUser.name);
      // Update editForm in case we stay in edit mode (though we close it)
      setEditForm({
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || "",
      });
      setMessage({ type: "success", text: res.data.message || "Profile updated successfully!" });
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error: any) {
      console.error("Update error:", error);
      const errorMsg = error.response?.data?.message || "Update failed";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image must be less than 2MB" });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAvatarUrl = (avatarPath: string | null | undefined) => {
    if (!avatarPath) return null;
    // If already a full URL, return as is
    if (avatarPath.startsWith('http')) return avatarPath;
    // Otherwise, prepend the storage URL
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_FILE_URL || '';
    return `${baseUrl}/${avatarPath}`;
  };

  if (loading) {
    return (
      <RoleBasedLayout userName={userName} userRole="user">
        <div className="animate-pulse max-w-4xl mx-auto p-8">
          <div className="h-32 bg-gray-200 rounded-2xl mb-6"></div>
          <div className="h-96 bg-gray-200 rounded-2xl"></div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout userName={userName} userRole={profile?.role || "user"}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">View and edit your personal information</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="flex-1">{message.text}</span>
            <button onClick={() => setMessage(null)} className="hover:opacity-70">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header with Avatar */}
          <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-8 text-white">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {(avatarPreview || (profile?.avatar && !isEditing)) ? (
                    <img
                      src={avatarPreview || getAvatarUrl(profile?.avatar) || ""}
                      alt={profile?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                        // Optionally show a default icon
                      }}
                    />
                  ) : (
                    <User size={48} className="text-white" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full cursor-pointer shadow-md hover:bg-gray-100 transition-colors">
                    <Camera size={16} className="text-gray-700" />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile?.name}</h2>
                <p className="text-white/80 text-sm mt-1 capitalize">{profile?.role}</p>
                <div className="flex items-center gap-1 text-white/70 text-xs mt-2">
                  <Calendar size={12} />
                  <span>Joined {formatDate(profile?.created_at || "")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {!isEditing ? (
              // View Mode
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                      <User size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">Full Name</span>
                    </div>
                    <p className="text-gray-900 font-medium text-lg">{profile?.name}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                      <Mail size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">Email Address</span>
                    </div>
                    <p className="text-gray-900 font-medium">{profile?.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                      <Phone size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">Phone Number</span>
                    </div>
                    <p className="text-gray-900 font-medium">{profile?.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? "Saving..." : <><Save size={16} /> Save Changes</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setAvatarFile(null);
                      setAvatarPreview(null);
                      if (profile) {
                        setEditForm({
                          name: profile.name,
                          email: profile.email,
                          phone: profile.phone || "",
                        });
                      }
                    }}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}