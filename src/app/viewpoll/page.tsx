"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const ViewPoll = () => {
  const [polls, setPolls] = useState<{ id: number; title: string; options: string[] }[]>([]);
  const [selectedPoll, setSelectedPoll] = useState<{ id: number; title: string; options: string[] } | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Fetch all polls from the database
  useEffect(() => {
    const fetchPolls = async () => {
      const { data, error } = await supabase.from("quickpoll").select("*");

      if (error) {
        console.error("Error fetching polls:", error);
      } else {
        setPolls(data);
      }
    };

    fetchPolls();
  }, []);

  // Function to handle voting
  const handleVote = async () => {
    if (!selectedPoll || !selectedOption) {
      alert("Please select an option before voting.");
      return;
    }

    try {
      const { error } = await supabase.from("quickpoll").update({}).eq("id", selectedPoll.id);

      if (error) {
        throw new Error(error.message);
      }

      alert(`You voted for: ${selectedOption}`);
      setSelectedPoll(null);
      setSelectedOption(null);
    } catch (error) {
      console.error("Error submitting vote:", error);
      alert("Failed to submit vote. Please try again.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-center text-xl font-bold">Polls</h1>

      {/* Display poll titles */}
      <ul className="mt-4">
        {polls.map((poll) => (
          <li
            key={poll.id}
            className="cursor-pointer text-blue-500 underline mb-2"
            onClick={() => setSelectedPoll(poll)}
          >
            {poll.title}
          </li>
        ))}
      </ul>

      {/* Show poll details when clicked */}
      {selectedPoll && (
        <div className="mt-6 p-4 border border-gray-300 rounded">
          <h2 className="text-lg font-semibold">{selectedPoll.title}</h2>
          <ul className="mt-2">
            {selectedPoll.options.map((option, index) => (
              <li key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="vote"
                  value={option}
                  onChange={() => setSelectedOption(option)}
                />
                {option}
              </li>
            ))}
          </ul>
          <button onClick={handleVote} className="mt-4 p-2 bg-zinc-950 text-white">
            Vote
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewPoll;
