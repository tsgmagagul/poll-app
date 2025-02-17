"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

interface Poll {
  id: number;
  title: string;
  options: string[];
  votes: { [key: string]: number }; // Track votes for each option
}

const ViewPoll = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);


  // Fetch all polls from the database
  useEffect(() => {
    const fetchPolls = async () => {
      const { data, error } = await supabase.from("quickpoll").select("*");

      if (error) {
        console.error("Error fetching polls:", error);
      } else {
        // Initialize votes if not present
        const pollsWithVotes = data.map((poll) => ({
          ...poll,
          votes: poll.votes || {},
        }));
        setPolls(pollsWithVotes);
      }
    };

    fetchPolls();
  }, []);

  // Function to handle voting
  const handleVote = async (option: string) => {
    if (!selectedPoll) {
      alert("Please select a poll before voting.");
      return;
    }

    try {
      // Update the vote count in the database
      const updatedVotes = {
        ...selectedPoll.votes,
        [option]: (selectedPoll.votes[option] || 0) + 1,
      };

      const { error } = await supabase
        .from("quickpoll")
        .update({ votes: updatedVotes })
        .eq("id", selectedPoll.id);

      if (error) {
        throw new Error(error.message);
      }

      // Update the local state
      setPolls((prevPolls) =>
        prevPolls.map((poll) =>
          poll.id === selectedPoll.id ? { ...poll, votes: updatedVotes } : poll
        )
      );

      alert(`You voted for: ${option}`);
    } catch (error) {
      console.error("Error submitting vote:", error);
      alert("Failed to submit vote. Please try again.");
    }
  };

  // Function to delete a poll
  const handleDeletePoll = async (pollId: number) => {
    try {
      const { error } = await supabase.from("quickpoll").delete().eq("id", pollId);

      if (error) {
        throw new Error(error.message);
      }

      // Update the local state
      setPolls((prevPolls) => prevPolls.filter((poll) => poll.id !== pollId));
      setSelectedPoll(null); // Clear the selected poll if it was deleted

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

        {/* Display poll titles */}
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
                  e.stopPropagation(); // Prevent the li onClick from firing
                  handleDeletePoll(poll.id);
                }}
                className="float-right text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {/* Show poll details when clicked */}
        {selectedPoll && (
          <div className="mt-6">
            <label className="block mb-4 text-zinc-700">
              {selectedPoll.title}
            </label>
            <div className="space-y-4">
              {selectedPoll.options.map((option, index) => (
                <div key={index} className="relative">
                  <button
                    onClick={() => handleVote(option)}
                    className="w-full text-left p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors duration-200 ease-in-out"
                  >
                    <span className="font-medium text-purple-900">{option}</span>
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-700">
                      {selectedPoll.votes[option] || 0} votes
                    </span>
                  </button>
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{
                      width: `${(selectedPoll.votes[option] || 0) * 10}%`,
                    }}
                    transition={{ duration: 0.5 }}
                    className="absolute left-0 top-0 h-full bg-purple-300 rounded-lg opacity-50 z-0"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPoll;