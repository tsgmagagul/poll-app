"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

interface Poll {
  id: number;
  title: string;
  options: string[]; // Ensure this is an array of strings
  votes: Record<string, number>;
  created_by: string;
}

const ViewPoll = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);


    useEffect(() => {
      const fetchPolls = async () => {
        const { data, error } = await supabase.from("quickpoll").select("*");
    
        if (error) {
          console.error("Error fetching polls:", error);
        } else {
          console.log("Fetched data:", data); // Debugging line
          const pollsWithVotes = data.map((poll) => ({
            ...poll,
            options: Array.isArray(poll.options) ? poll.options : JSON.parse(poll.options), // Parse if necessary
            votes: poll.votes || {},
          }));
          setPolls(pollsWithVotes);
        }
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
            prevPolls.map((poll) => (poll.id === updatedPoll.id ? updatedPoll : poll))
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
  
    try {
      // Increment the vote count for the selected option
      const updatedVotes = {
        ...selectedPoll.votes,
        [option]: (selectedPoll.votes[option] || 0) + 1,
      };
  
      // Update the poll in Supabase
      const { data: updatedPollData, error: pollError } = await supabase
        .from("quickpoll")
        .update({ votes: updatedVotes })
        .eq("id", selectedPoll.id)
        .select("*");
  
      if (pollError) throw new Error(pollError.message);
  
      // Create a notification for the poll creator
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert([
          {
            user_id: selectedPoll.created_by, // ID of the poll creator
            poll_id: selectedPoll.id,
            message: `You have a new vote on "${selectedPoll.title}".`,
          },
        ]);
  
      if (notificationError) throw new Error(notificationError.message);
  
      // Update the local state with the new poll data
      if (updatedPollData && updatedPollData.length > 0) {
        const updatedPoll = updatedPollData[0];
        setPolls((prevPolls) =>
          prevPolls.map((poll) => (poll.id === updatedPoll.id ? updatedPoll : poll))
        );
        setSelectedPoll(updatedPoll);
      }
  
      alert(`You voted for: ${option}`);
    } catch (error) {
      console.error("Error submitting vote:", error);
      alert("Failed to submit vote. Please try again.");
    }
  };

  // Handle deleting a poll
  const handleDeletePoll = async (pollId: number) => {
    try {
      const { error } = await supabase.from("quickpoll").delete().eq("id", pollId);

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
            <h2 className="text-lg font-semibold text-zinc-700 mb-2">{selectedPoll.title}</h2>
            <p className="text-sm text-gray-600">
              Total Votes: {Object.values(selectedPoll.votes).reduce((acc, v) => acc + v, 0)}
            </p>

            <div className="space-y-4">
              {Array.isArray(selectedPoll.options) ? (
                selectedPoll.options.map((option, index) => {
                  const totalVotes = Object.values(selectedPoll.votes).reduce((acc, v) => acc + v, 0);
                  const votePercentage = totalVotes > 0 ? ((selectedPoll.votes[option] || 0) / totalVotes) * 100 : 0;

                  return (
                    <div key={index} className="relative">
                      <button
                        onClick={() => handleVote(option)}
                        className="w-full text-left p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors duration-200 ease-in-out relative"
                      >
                        <span className="font-medium text-purple-900">{option}</span>
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