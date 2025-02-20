"use client"
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  user_id: string;
  poll_id: string;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch notifications for the logged-in user
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching notifications:", error);
      else setNotifications(data);
    };

    fetchNotifications();
  }, []);

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) console.error("Error marking notification as read:", error);
    else {
      // Update the local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <ul className="space-y-4">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className={`p-4 rounded-lg ${
              notification.is_read ? "bg-gray-100" : "bg-purple-50"
            }`}
          >
            <p>{notification.message}</p>
            <p className="text-sm text-gray-600">
              {new Date(notification.created_at).toLocaleString()}
            </p>
            {!notification.is_read && (
              <button
                onClick={() => markAsRead(notification.id)}
                className="mt-2 text-sm text-purple-700 hover:text-purple-900"
              >
                Mark as Read
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsPage;