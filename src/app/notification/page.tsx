"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

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
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error);
        return;
      }

      const user = data?.session?.user;
      if (!user) {
        console.log("No user session found. Redirecting to login...");
        router.push("/login");
        return;
      }

      console.log("Logged-in User ID:", user.id);
      setUserId(user.id);
    };

    fetchUser();
  }, [router]);

  // Fetch notifications based on quickpoll entries
  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      // Get poll IDs where the logged-in user is the owner
      const { data: quickpolls, error: quickpollError } = await supabase
        .from("quickpoll")
        .select("id")
        .eq("user_id", userId);

      if (quickpollError) {
        console.error("Error fetching quickpolls:", quickpollError);
        return;
      }

      const pollIds = quickpolls.map((poll) => poll.id);

      if (pollIds.length === 0) {
        console.log("No polls found for this user.");
        return;
      }

      console.log("Poll IDs associated with user:", pollIds);

      // Fetch notifications where poll_id is in the list of poll IDs or matches the user_id
      const { data: notifications, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .or(
          `poll_id.in.(${pollIds.join(",")}),user_id.eq.${userId}` // Match notifications related to the polls or user
        )
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error fetching notifications:", fetchError);
      } else {
        setNotifications(notifications);
      }
    };

    fetchNotifications();
  }, [userId]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!userId) {
      console.error("User not authenticated. Cannot update notification.");
      return;
    }

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error marking notification as read:", error);
    } else {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <ul className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
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
          ))
        ) : (
          <p>No notifications found.</p>
        )}
      </ul>
    </div>
  );
};

export default NotificationsPage;
