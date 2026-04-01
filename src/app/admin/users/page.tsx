"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import { 
  Users, 
  Mail, 
  Phone, 
  Edit, 
  Trash2, 
  Building2,
  Eye, 
  Search,
  Plus,
  Shield,
  UserCircle,
  Calendar,
  Key
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    owners: 0,
    staff: 0,
    admins: 0,
    newThisMonth: 0
  });

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    setUserName(name || 'Admin');
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      setUsers(data);

      // Calculate stats based on roles
      const owners = data.filter((u: any) => u.roles?.some((r: any) => r.name === 'owner')).length;
      const staff = data.filter((u: any) => u.roles?.some((r: any) => r.name === 'staff')).length;
      const admins = data.filter((u: any) => u.roles?.some((r: any) => r.name === 'admin')).length;
      
      // Users created in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newThisMonth = data.filter((u: any) => new Date(u.created_at) > thirtyDaysAgo).length;

      setStats({
        total: data.length,
        owners,
        staff,
        admins,
        newThisMonth
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(user => user.id !== userId));
      alert("User deleted successfully!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete user.");
    }
  };

  const getRoleBadge = (roles: any[]) => {
    const roleName = roles?.[0]?.name || 'user';
    
    switch(roleName) {
      case 'admin':
        return <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full"><Shield size={14} /> Admin</span>;
      case 'owner':
        return <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full"><Building2 size={14} /> Owner</span>;
      case 'staff':
        return <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full"><Users size={14} /> Staff</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-bold">User</span>;
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.roles?.some((r: any) => r.name === roleFilter);
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <RoleBasedLayout userName={userName} userRole="admin">
        <div className="animate-pulse p-8 space-y-8">
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout userName={userName} userRole="admin">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage system users and their roles</p>
        </div>
        <Link href="/admin/users/create" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100">
          <Plus size={20} /> Add New User
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Users</p><p className="text-3xl font-black mt-2">{stats.total}</p></div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Users size={24} /></div>
          </div>
          <p className="text-xs text-green-600 mt-4 font-bold">+{stats.newThisMonth} this month</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Admins</p><p className="text-3xl font-black mt-2">{stats.admins}</p></div>
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Shield size={24} /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Owners</p><p className="text-3xl font-black mt-2">{stats.owners}</p></div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><Building2 size={24} /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Staff</p><p className="text-3xl font-black mt-2">{stats.staff}</p></div>
            <div className="p-3 bg-green-50 rounded-xl text-green-600"><Users size={24} /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-gray-500 font-bold uppercase tracking-wider">New Users</p><p className="text-3xl font-black mt-2">{stats.newThisMonth}</p></div>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><UserCircle size={24} /></div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" 
          />
        </div>
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)} 
          className="w-full md:w-48 p-3 bg-gray-50 border-none rounded-xl outline-none font-bold text-gray-700"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Contact</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Joined</th>
              <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">ID: #{user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <Mail size={14} className="text-gray-400" />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <Phone size={14} className="text-gray-400" />
                        {user.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getRoleBadge(user.roles)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <Calendar size={14} className="text-gray-400" />
                    {new Date(user.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <Link 
                      href={`/admin/users/${user.id}`} 
                      className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" 
                      title="View Details"
                    >
                      <Eye size={20} />
                    </Link>
                    <Link 
                      href={`/admin/users/${user.id}/edit`} 
                      className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all" 
                      title="Edit User"
                    >
                      <Edit size={20} />
                    </Link>
                    <Link 
                      href={`/admin/users/${user.id}/reset-password`} 
                      className="p-2.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all" 
                      title="Reset Password"
                    >
                      <Key size={20} />
                    </Link>
                    <button 
                      onClick={() => handleDeleteUser(user.id, user.name)} 
                      className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" 
                      title="Delete User"
                      disabled={user.id === 1} // Optional: Prevent deleting super admin
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </RoleBasedLayout>
  );
}