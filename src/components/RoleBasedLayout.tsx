// components/RoleBasedLayout.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  Building2, 
  Calendar, 
  MessageCircle,
  Heart, 
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Settings,
  Shield,
  Users as UsersIcon,
  FileText,
  Package,
  MessageSquare,
  CreditCard,
  HelpCircle,
  CheckCircle,
  Clock as ClockIcon
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { 
  fetchUnreadCount, 
  fetchNotifications, 
  markAsRead, 
  markAllAsRead, 
  Notification 
} from '@/lib/notifications';
import { formatDateTime } from '@/lib/helpers';

type UserRole = 'admin' | 'owner' | 'user';

interface RoleBasedLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userRole?: UserRole;
}

export default function RoleBasedLayout({ 
  children, 
  userName = 'User',
  userRole = 'user'
}: RoleBasedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [pendingEnquiries, setPendingEnquiries] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Poll unread count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const count = await fetchUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch unread count', error);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load notifications when dropdown opens
  const loadNotifications = async () => {
    if (loadingNotifs) return;
    setLoadingNotifs(true);
    try {
      const { data } = await fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleOpenNotifications = () => {
    if (!notificationsOpen) {
      loadNotifications();
    }
    setNotificationsOpen(!notificationsOpen);
  };

  const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  // Fetch pending enquiries count
  useEffect(() => {
    if (userRole === 'owner' || userRole === 'admin') {
      fetchPendingEnquiries();
      const interval = setInterval(fetchPendingEnquiries, 30000);
      return () => clearInterval(interval);
    }
  }, [userRole]);

  const fetchPendingEnquiries = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      let totalPending = 0;
      
      if (userRole === 'owner') {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/owner/inquiries`,
          { headers: { Authorization: `Bearer ${token}` }, params: { per_page: 100 } }
        );
        if (response.data.success && response.data.data.data) {
          totalPending = response.data.data.data.filter((inquiry: any) => inquiry.status === 'pending').length;
        }
      } else if (userRole === 'admin') {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/inquiries/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          totalPending = response.data.data.pending;
        }
      }
      setPendingEnquiries(totalPending);
    } catch (error) {
      console.error("Error fetching pending enquiries:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    router.push('/login');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_update':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'venue_approved':
        return <Building2 size={16} className="text-blue-500" />;
      case 'payment_received':
        return <ClockIcon size={16} className="text-purple-500" />;
      case 'new_booking':
        return <Bell size={16} className="text-yellow-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  // Role-specific navigation – updated profile links to /profile
  const adminNavLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Users Management', href: '/admin/users', icon: UsersIcon },
    { name: 'Venues Management', href: '/admin/venues', icon: Building2 },
    { name: 'Profile', href: '/profile', icon: User }, // ✅ added profile
  ];

  const ownerNavLinks = [
    { name: 'Dashboard', href: '/owner/dashboard', icon: Home },
    { name: 'My Venues', href: '/owner/venues', icon: Building2 },
    { name: 'Booking Requests', href: '/owner/bookings', icon: Calendar },
    { name: 'Calendar View', href: '/owner/calendar', icon: Calendar },
    { name: 'Enquiries', href: '/owner/enquiries', icon: MessageCircle },
    { name: 'Payments', href: '/owner/payments', icon: CreditCard },
    { name: 'Profile', href: '/profile', icon: User }, // ✅ changed from /owner/profile to /profile
  ];

  const userNavLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Browse Venues', href: '/venues', icon: Building2 },
    { name: 'My Bookings', href: '/my-bookings', icon: Calendar },
    { name: 'My Enquiries', href: '/my-enquiries', icon: MessageCircle },
    { name: 'Saved Venues', href: '/my-saved', icon: Heart },
    { name: 'Payments', href: '/payments', icon: CreditCard },
    { name: 'Profile', href: '/profile', icon: User }, // ✅ added profile link
  ];

  const getNavLinks = () => {
    switch(userRole) {
      case 'admin': return adminNavLinks;
      case 'owner': return ownerNavLinks;
      default: return userNavLinks;
    }
  };

  const navLinks = getNavLinks();

  const getRoleColors = () => {
    switch(userRole) {
      case 'admin': return {
        primary: 'from-purple-600 to-indigo-600',
        secondary: 'purple',
        badge: 'bg-purple-100 text-purple-800'
      };
      case 'owner': return {
        primary: 'from-blue-600 to-cyan-600',
        secondary: 'blue',
        badge: 'bg-blue-100 text-blue-800'
      };
      default: return {
        primary: 'from-pink-600 to-purple-600',
        secondary: 'pink',
        badge: 'bg-pink-100 text-pink-800'
      };
    }
  };

  const roleColors = getRoleColors();

  const getQuickStats = () => {
    switch(userRole) {
      case 'admin':
        return { label: 'Total Pending Enquiries', value: pendingEnquiries.toString(), change: pendingEnquiries > 0 ? `${pendingEnquiries} new` : 'No new' };
      case 'owner':
        return { label: 'Pending Enquiries', value: pendingEnquiries.toString(), change: pendingEnquiries > 0 ? `${pendingEnquiries} new` : 'No new' };
      default:
        return { label: 'Upcoming Events', value: '3', change: '+1' };
    }
  };

  const quickStats = getQuickStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 mr-2"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link href={userRole === 'admin' ? '/admin/dashboard' : userRole === 'owner' ? '/owner/dashboard' : '/dashboard'} className="flex items-center">
                <div className={`bg-gradient-to-r ${roleColors.primary} w-8 h-8 rounded-lg flex items-center justify-center`}>
                  {userRole === 'admin' ? <Shield className="text-white" size={20} /> : <Building2 className="text-white" size={20} />}
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">
                  Event<span className={`text-${roleColors.secondary}-600`}>Ease</span>
                </span>
                <span className={`ml-2 px-2 py-1 ${roleColors.badge} text-xs font-semibold rounded-full capitalize`}>
                  {userRole}
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={handleOpenNotifications}
                  className="p-2 rounded-full hover:bg-gray-100 relative"
                >
                  <Bell size={20} className="text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-pink-600 hover:text-pink-700"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {loadingNotifs ? (
                        <div className="px-4 py-3 text-center text-gray-500">Loading...</div>
                      ) : notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 transition-colors ${!notif.is_read ? 'bg-blue-50' : ''}`}
                          >
                            <div className="flex items-start gap-2">
                              {getNotificationIcon(notif.type)}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                <p className="text-xs text-gray-600 mt-0.5">{notif.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{formatDateTime(notif.created_at)}</p>
                              </div>
                              {!notif.is_read && (
                                <button
                                  onClick={(e) => handleMarkAsRead(notif.id, e)}
                                  className="text-xs text-pink-600 hover:underline whitespace-nowrap"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-100 text-center">
                        <Link href="/notifications" className="text-xs text-pink-600 hover:text-pink-700">
                          View all notifications
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Menu – profile link updated */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className={`w-8 h-8 bg-gradient-to-r ${roleColors.primary} rounded-full flex items-center justify-center text-white font-semibold`}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500 capitalize">{userRole} Account</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-500 capitalize">{userRole} Account</p>
                    </div>
                    {/* ✅ Profile link now uses `/profile` for all roles */}
                    <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <User size={16} className="mr-3" /> Your Profile
                    </Link>
                    {/* Removed the separate Settings link – profile page handles editing */}
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={handleLogout} className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                      <LogOut size={16} className="mr-3" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar – unchanged but uses updated navLinks */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
          <div className="flex flex-col flex-1 min-h-0 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="flex-1 px-4 space-y-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const isEnquiries = item.name === 'Enquiries' || item.name === 'My Enquiries';
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? `bg-gradient-to-r ${roleColors.primary.replace('600', '50')} text-${roleColors.secondary}-700 border-l-4 border-${roleColors.secondary}-600`
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center"><Icon size={18} className="mr-3" />{item.name}</div>
                      {isEnquiries && pendingEnquiries > 0 && (
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingEnquiries}</span>
                      )}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-auto mx-4 mb-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2">{quickStats.label}</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900">{quickStats.value}</span>
                    <span className={`text-xs font-semibold ${quickStats.change.includes('+') || quickStats.change === 'No new' ? 'text-green-600' : 'text-red-600'}`}>{quickStats.change}</span>
                  </div>
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${roleColors.primary} transition-all duration-700 ease-out`} style={{ width: userRole === 'admin' ? '98%' : userRole === 'owner' ? `${Math.min((pendingEnquiries / 10) * 100, 100)}%` : '60%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar – same changes reflected */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
            <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs pt-5 pb-4 bg-white shadow-xl">
              <div className="flex items-center justify-between px-4 mb-8">
                <div className="flex items-center">
                  <div className={`bg-gradient-to-r ${roleColors.primary} w-8 h-8 rounded-lg flex items-center justify-center`}>
                    {userRole === 'admin' ? <Shield className="text-white" size={20} /> : <Building2 className="text-white" size={20} />}
                  </div>
                  <span className="ml-3 text-xl font-bold text-gray-900">Event<span className={`text-${roleColors.secondary}-600`}>Ease</span></span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"><X size={24} /></button>
              </div>
              <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const isEnquiries = item.name === 'Enquiries' || item.name === 'My Enquiries';
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-3 text-base font-medium rounded-lg ${
                        isActive
                          ? `bg-gradient-to-r ${roleColors.primary.replace('600', '50')} text-${roleColors.secondary}-700 border-l-4 border-${roleColors.secondary}-600`
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center"><Icon size={20} className="mr-3" />{item.name}</div>
                      {isEnquiries && pendingEnquiries > 0 && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingEnquiries}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        <main className="md:pl-64 flex-1">
          <div className="py-6">
            <div className="mx-auto px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}