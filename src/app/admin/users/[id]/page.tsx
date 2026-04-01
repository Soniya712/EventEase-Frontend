"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  Building2,
  Edit,
  Trash2,
  Key,
  User as UserIcon,
  Clock
} from "lucide-react";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    setUserName(name || 'Admin');
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      alert("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("User deleted successfully!");
      router.push('/admin/users');
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete user");
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch(roleName) {
      case 'admin': return <Shield className="text-purple-600" size={24} />;
      case 'owner': return <Building2 className="text-blue-600" size={24} />;
      default: return <UserIcon className="text-green-600" size={24} />;
    }
  };

  const getRoleBadge = (roleName: string) => {
    switch(roleName) {
      case 'admin':
        return <span className="px-4 py-2 bg-purple-100 text-purple-700 text-sm font-bold rounded-full">Administrator</span>;
      case 'owner':
        return <span className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-bold rounded-full">Venue Owner</span>;
      case 'staff':
        return <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-bold rounded-full">Staff Member</span>;
      default:
        return <span className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-full">User</span>;
    }
  };

  if (loading) {
    return (
      <RoleBasedLayout userName={userName} userRole="admin">
        <div className="animate-pulse p-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="bg-white rounded-3xl p-8 space-y-6">
            <div className="h-24 bg-gray-200 rounded-2xl"></div>
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </RoleBasedLayout>
    );
  }

  if (!user) {
    return (
      <RoleBasedLayout userName={userName} userRole="admin">
        <div className="text-center py-20">
          <p className="text-gray-400 font-bold">User not found</p>
        </div>
      </RoleBasedLayout>
    );
  }

  const userRole = user.roles?.[0]?.name || 'user';

  return (
    <RoleBasedLayout userName={userName} userRole="admin">
      <div className="mb-8">
        <Link 
          href="/admin/users" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4"
        >
          <ArrowLeft size={18} /> Back to Users
        </Link>
      </div>

      {/* User Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                {getRoleBadge(userRole)}
                <span className="text-sm text-gray-400 font-medium">ID: #{user.id}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Link
              href={`/admin/users/${userId}/edit`}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Edit size={18} /> Edit User
            </Link>
            <Link
              href={`/admin/users/${userId}/reset-password`}
              className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all flex items-center gap-2"
            >
              <Key size={18} /> Reset Password
            </Link>
            <button
              onClick={handleDelete}
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center gap-2"
              disabled={user.id === 1} // Prevent deleting super admin
            >
              <Trash2 size={18} /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* User Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <Mail className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Email Address</p>
                  <p className="font-bold text-gray-900">{user.email}</p>
                </div>
              </div>
              
              {user.phone && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <Phone className="text-gray-400" size={20} />
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Phone Number</p>
                    <p className="font-bold text-gray-900">{user.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Account Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <Calendar className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Member Since</p>
                  <p className="font-bold text-gray-900">
                    {new Date(user.created_at).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <Clock className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Last Updated</p>
                  <p className="font-bold text-gray-900">
                    {new Date(user.updated_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role & Permissions */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Role & Permissions</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                {getRoleIcon(userRole)}
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Current Role</p>
                  <p className="font-bold text-gray-900 capitalize">{userRole}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 font-bold uppercase mb-2">Permissions</p>
                <ul className="space-y-2">
                  {userRole === 'admin' && (
                    <>
                      <li className="text-sm text-gray-700">✓ Full system access</li>
                      <li className="text-sm text-gray-700">✓ User management</li>
                      <li className="text-sm text-gray-700">✓ Venue approvals</li>
                      <li className="text-sm text-gray-700">✓ All analytics</li>
                    </>
                  )}
                  {userRole === 'owner' && (
                    <>
                      <li className="text-sm text-gray-700">✓ Manage own venues</li>
                      <li className="text-sm text-gray-700">✓ View bookings</li>
                      <li className="text-sm text-gray-700">✓ Revenue analytics</li>
                      <li className="text-sm text-gray-700">✓ Staff management</li>
                    </>
                  )}
                  {userRole === 'staff' && (
                    <>
                      <li className="text-sm text-gray-700">✓ View assigned venues</li>
                      <li className="text-sm text-gray-700">✓ Manage bookings</li>
                      <li className="text-sm text-gray-700">✓ Respond to inquiries</li>
                      <li className="text-sm text-gray-700">✗ Cannot edit venues</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}