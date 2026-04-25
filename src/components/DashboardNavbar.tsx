"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  Building2, 
  Calendar, 
  Heart, 
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon
} from "lucide-react";
import Link from "next/link";
import { fetchUnreadCount, fetchNotifications, markAsRead, markAllAsRead, Notification } from '@/lib/notifications';
import { formatDateTime } from '@/lib/helpers';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userType?: 'user' | 'owner' | 'admin';
}

export default function DashboardLayout({ 
  children, 
  userName = 'User',
  userType = 'user'
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);

  // Poll unread count every 30 seconds
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const count = await fetchUnreadCount();
        setUnreadCount(count);
        setNotifError(null);
      } catch (error) {
        console.error('Failed to fetch unread count', error);
        setNotifError('Could not load notifications');
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
    setNotifError(null);
    try {
      const { data } = await fetchNotifications(1);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications', error);
      setNotifError('Failed to load notifications');
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_name');
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
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const userNavLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Browse Venues', href: '/venues', icon: Building2 },
    { name: 'My Bookings', href: '/my-bookings', icon: Calendar },
    { name: 'Saved Venues', href: '/my-saved', icon: Heart },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const ownerNavLinks = [
    { name: 'Dashboard', href: '/owner/dashboard', icon: Home },
    { name: 'My Venues', href: '/owner/venues', icon: Building2 },
    { name: 'Bookings', href: '/owner/bookings', icon: Calendar },
    { name: 'Analytics', href: '/owner/analytics', icon: Settings },
    { name: 'Profile', href: '/owner/profile', icon: User },
  ];

  const navLinks = userType === 'owner' ? ownerNavLinks : userNavLinks;
  const isOwner = userType === 'owner';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
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
              <Link href={isOwner ? "/owner/dashboard" : "/dashboard"} className="flex items-center">
                <div className="bg-gradient-to-r from-pink-600 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center">
                  <Building2 className="text-white" size={20} />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">
                  Event<span className="text-pink-600">Ease</span>
                </span>
                {isOwner && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                    Owner
                  </span>
                )}
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
                      ) : notifError ? (
                        <div className="px-4 py-3 text-center text-red-500 text-sm">{notifError}</div>
                      ) : notifications.length === 0 ? (
                        <div className="px-4 py-3 text-center text-gray-500">No notifications</div>
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
                                  className="text-xs text-pink-600 hover:underline"
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
                        <Link
                          href="/notifications"
                          className="text-xs text-pink-600 hover:text-pink-700"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Menu (unchanged) */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">
                      {isOwner ? 'Venue Owner' : 'User Account'}
                    </p>
                  </div>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10">
                    <Link
                      href={isOwner ? "/owner/profile" : "/profile"}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={16} className="mr-3" />
                      Your Profile
                    </Link>
                    <Link
                      href={isOwner ? "/owner/settings" : "/settings"}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings size={16} className="mr-3" />
                      Settings
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-3" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar (unchanged) */}
      <div className="flex">
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
          <div className="flex flex-col flex-1 min-h-0 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="flex-1 px-4 space-y-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 border-l-4 border-pink-600'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={18} className="mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              {isOwner && (
                <div className="mt-auto mx-4 mb-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">Quick Stats</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">This Week</span>
                      <span className="text-xs font-semibold text-green-600">+12%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Revenue</span>
                      <span className="text-xs font-semibold text-gray-900">₹45.2K</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="md:pl-64 flex-1">
          <div className="py-6">
            <div className="mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}