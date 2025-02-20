"use client"; // Mark this as a client component

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

const Navbar = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch the current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("User:", user); // Debugging line
      if (!user) {
        router.push("/login"); // Redirect to login page if no user is logged in
      } else {
        setUser(user);
      }
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    } else {
      router.push("/login"); // Redirect to the login page after logout
    }
  };
  
  
  // Fetch unread notifications count (only for logged-in users)
  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      if (!user) return; // Only fetch if the user is logged in

      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id) // Ensure user.id is defined
        .eq("is_read", false);

      if (error) console.error("Error fetching notifications:", error);
      else setUnreadCount(count || 0);
    };

    fetchUnreadNotifications();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading spinner
  }
  return (
<nav className="flex justify-between items-center p-4 bg-purple-50">
      <Link href="/" className={buttonVariants({ variant: "ghost" })}>
        Home
      </Link>
      <div className="flex gap-4">
        {user ? (
          // Show these buttons if the user is logged in
          <>
            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/createpoll"
            >
              Create poll
            </Link>
            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/viewpoll"
            >
              View Polls
            </Link>
            <Link
              href="/notifications"
              className={buttonVariants({ variant: "outline" }) + " relative"}
            >
              Notifications
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2">
                  {unreadCount}
                </span>
              )}
            </Link>
            <button onClick={handleLogout} className={buttonVariants({ variant: "outline" })}>
    Logout
  </button>
          </>
        ) : (
          // Show these buttons if the user is not logged in
          <>
            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/login"
            >
              Login
            </Link>
            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/signup"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;