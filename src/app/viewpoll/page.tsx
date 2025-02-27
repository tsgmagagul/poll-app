"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Poll {
  id: number; // or string if using UUID
  title: string;
  options: string[]; // Ensure this is an array of strings
  votes: Record<string, number>;
  created_by: string; // user_id of the poll creator
}

const ViewPoll = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);


  const router = useRouter();
  
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
        router.push("/login"); // Redirect to login page
        return;
      }
  
      console.log("Logged-in User ID:", user.id); // Debugging
    };
  
    fetchUser();
  }, [router]); // ✅ Include router in the dependency array
  
  
  
  // Fetch polls and votes
  useEffect(() => {
    const fetchPolls = async () => {
      const { data: polls, error: pollError } = await supabase
        .from("quickpoll")
        .select("*");

      if (pollError) {
        console.error("Error fetching polls:", pollError);
        return;
      }

      // Fetch votes separately
      const { data: votes, error: votesError } = await supabase
        .from("votes")
        .select("*");

      if (votesError) {
        console.error("Error fetching votes:", votesError);
        return;
      }

      // Aggregate votes per poll
      const voteCounts: Record<number, Record<string, number>> = {};
      votes.forEach((vote) => {
        if (!voteCounts[vote.poll_id]) {
          voteCounts[vote.poll_id] = {};
        }
        voteCounts[vote.poll_id][vote.selected_option] =
          (voteCounts[vote.poll_id][vote.selected_option] || 0) + 1;
      });

      // Combine poll data with vote counts
      const pollsWithVotes = polls.map((poll) => ({
        ...poll,
        options: Array.isArray(poll.options) ? poll.options : JSON.parse(poll.options),
        votes: voteCounts[poll.id] || {},
      }));

      setPolls(pollsWithVotes);
    };

    fetchPolls();
  }, []);

  // Subscribe to Realtime updates
  useEffect(() => {
    const subscription = supabase
      .channel("quickpoll")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "quickpoll" },
        (payload) => {
          const updatedPoll = payload.new as Poll;
          setPolls((prevPolls) =>
            prevPolls.map((poll) =>
              poll.id === updatedPoll.id ? updatedPoll : poll
            )
          );

          // Notify the poll creator (if selectedPoll is the updated poll)
          if (selectedPoll && selectedPoll.id === updatedPoll.id) {
            alert(`New vote in your poll: ${updatedPoll.title}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [selectedPoll]);

  // Handle voting
  const handleVote = async (option: string) => {
    if (!selectedPoll) {
      alert("Please select a poll before voting.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to vote.");
      return;
    }

    try {
      // Insert the vote into the 'votes' table
      const { error: voteError } = await supabase.from("votes").insert([
        {
          poll_id: selectedPoll.id, // Ensure this matches the database type (number or UUID)
          user_id: user.id,
          selected_option: option,
        },
      ]);

      if (voteError) throw voteError;

      // Retrieve the updated votes for this poll
      const { data: votesData, error: fetchVotesError } = await supabase
        .from("votes")
        .select("selected_option")
        .eq("poll_id", selectedPoll.id);

      if (fetchVotesError) throw fetchVotesError;

      // Calculate updated vote counts
      const updatedVotes = votesData.reduce((acc, vote) => {
        acc[vote.selected_option] = (acc[vote.selected_option] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Update local state with the new vote count
      setPolls((prevPolls) =>
        prevPolls.map((poll) =>
          poll.id === selectedPoll.id ? { ...poll, votes: updatedVotes } : poll
        )
      );
      setSelectedPoll({ ...selectedPoll, votes: updatedVotes });

      // Notify poll creator
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert([
          {
            user_id: selectedPoll.created_by, // Notify poll creator
            poll_id: selectedPoll.id,
            message: `You have a new vote on "${selectedPoll.title}".`,
          },
        ]);

      if (notificationError) throw notificationError;

      alert(`You voted for: ${option}`);
    } catch (error) {
      console.error("Error submitting vote:", error);
      alert("Failed to submit vote. Please try again.");
    }
  };

  // Handle deleting a poll
  const handleDeletePoll = async (pollId: number) => {
    try {
      const { error } = await supabase
        .from("quickpoll")
        .delete()
        .eq("id", pollId);

      if (error) throw new Error(error.message);

      setPolls((prevPolls) => prevPolls.filter((poll) => poll.id !== pollId));
      setSelectedPoll(null);

      alert("Poll deleted successfully.");
    } catch (error) {
      console.error("Error deleting poll:", error);
      alert("Failed to delete poll. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-center text-xl font-bold mb-4">Polls</h1>

        {/* Poll List */}
        <ul className="space-y-4">
          {polls.map((poll) => (
            <li
              key={poll.id}
              className="cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors duration-200 ease-in-out p-4 rounded-lg"
              onClick={() => setSelectedPoll(poll)}
            >
              <span className="font-medium text-purple-900">{poll.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePoll(poll.id);
                }}
                className="float-right text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {/* Poll Details */}
        {selectedPoll && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-zinc-700 mb-2">
              {selectedPoll.title}
            </h2>
            <p className="text-sm text-gray-600">
              Total Votes:{" "}
              {Object.values(selectedPoll.votes).reduce((acc, v) => acc + v, 0)}
            </p>

            <div className="space-y-4">
              {Array.isArray(selectedPoll.options) ? (
                selectedPoll.options.map((option, index) => {
                  const totalVotes = Object.values(selectedPoll.votes).reduce(
                    (acc, v) => acc + v,
                    0
                  );
                  const votePercentage =
                    totalVotes > 0
                      ? ((selectedPoll.votes[option] || 0) / totalVotes) * 100
                      : 0;

                  return (
                    <div key={index} className="relative">
                      <button
                        onClick={() => handleVote(option)}
                        className="w-full text-left p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors duration-200 ease-in-out relative"
                      >
                        <span className="font-medium text-purple-900">
                          {option}
                        </span>
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-700">
                          {selectedPoll.votes[option] || 0} votes
                        </span>
                      </button>

                      {/* Progress Bar */}
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: `${votePercentage}%` }}
                        transition={{ duration: 0.5 }}
                        className="absolute left-0 top-0 h-full bg-purple-300 rounded-lg opacity-50 z-0"
                      />
                    </div>
                  );
                })
              ) : (
                <p>No options available for this poll.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPoll;