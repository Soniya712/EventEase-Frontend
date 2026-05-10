"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import { Notification, fetchNotifications, markAsRead, markAllAsRead } from "@/lib/notifications";
import { formatDateTime } from "@/lib/helpers";
import { Bell, CheckCircle, Building2, Clock, Eye } from "lucide-react";
import Link from "next/link";

type UserRole = "admin" | "owner" | "user";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("user");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Load user info
  useEffect(() => {
    const name = localStorage.getItem("user_name");
    const role = localStorage.getItem("user_role") as UserRole;
    setUserName(name || "User");
    setUserRole(role === "admin" || role === "owner" ? role : "user");
  }, []);

  const loadNotifications = useCallback(async (reset: boolean = true) => {
    if (!userName) return;
    setLoading(true);
    try {
      const { data, total: totalCount } = await fetchNotifications(reset ? 1 : page);
      if (reset) {
        setNotifications(data);
        setPage(1);
        setTotal(totalCount);
        setHasMore(data.length < totalCount);
      } else {
        setNotifications(prev => [...prev, ...data]);
        setHasMore(notifications.length + data.length < totalCount);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  }, [userName, page, notifications.length]);

  useEffect(() => {
    if (userName) {
      loadNotifications(true);
    }
  }, [userName, loadNotifications]);

  useEffect(() => {
    if (page > 1) {
      loadNotifications(false);
    }
  }, [page, loadNotifications]);

  const handleMarkAsRead = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "booking_update":
        return <CheckCircle className="text-green-500" size={20} />;
      case "venue_approved":
        return <Building2 className="text-blue-500" size={20} />;
      case "payment_received":
        return <Clock className="text-purple-500" size={20} />;
      case "new_booking":
        return <Bell className="text-yellow-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  const getBookingLink = (bookingId: number) => {
    switch (userRole) {
      case "owner":
        return `/owner/bookings?booking=${bookingId}`;
      case "admin":
        return `/admin/bookings?booking=${bookingId}`;
      default:
        return `/my-bookings?booking=${bookingId}`;
    }
  };

  // 🧭 REDIRECT ON NOTIFICATION CLICK
  const handleNotificationClick = (notif: Notification) => {
    // Mark as read automatically when clicked
    if (!notif.is_read) {
      handleMarkAsRead(notif.id);
    }
    let data = notif.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        data = {};
      }
    }
    if (notif.type === 'new_inquiry' && data?.role === 'owner') {
      router.push(`/owner/enquiries?inquiry=${data.inquiry_id}`);
    } else if (notif.type === 'inquiry_reply' && data?.role === 'customer') {
      router.push(`/my-enquiries?inquiry=${data.inquiry_id}`);
    } else if (notif.type === 'booking_update' && data?.booking_id) {
      router.push(getBookingLink(data.booking_id));
    }
  };

  const hasUnread = notifications.some(n => !n.is_read);

  if (loading && notifications.length === 0) {
    return (
      <RoleBasedLayout userName={userName} userRole={userRole}>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout userName={userName} userRole={userRole}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Stay updated with your activity</p>
        </div>
        {hasUnread && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No notifications</h3>
          <p className="mt-1 text-gray-500">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            let isClickable = false;
            let data = notif.data;
            if (typeof data === 'string') {
              try { data = JSON.parse(data); } catch(e) { data = {}; }
            }
            isClickable = (notif.type === 'new_inquiry' && data?.role === 'owner') ||
                          (notif.type === 'inquiry_reply' && data?.role === 'customer') ||
                          (notif.type === 'booking_update' && data?.booking_id);
            return (
              <div
                key={notif.id}
                onClick={isClickable ? () => handleNotificationClick(notif) : undefined}
                className={`bg-white rounded-xl border p-5 transition-all ${
                  !notif.is_read ? "border-l-4 border-l-pink-500 shadow-md" : "border-gray-200"
                } ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">{getIcon(notif.type)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                      {!notif.is_read && (
                        <button
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          className="text-xs text-pink-600 flex items-center gap-1 hover:underline"
                        >
                          <Eye size={14} /> Mark read
                        </button>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDateTime(notif.created_at)}</p>
                    {notif.data?.booking_id && (
                      <Link
                        href={getBookingLink(notif.data.booking_id)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-pink-600 hover:underline mt-2 inline-block"
                      >
                        View booking →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-6 py-2 text-pink-600 font-medium hover:underline"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}
    </RoleBasedLayout>
  );
}