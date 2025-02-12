"use client";

import { useState } from "react";
import { motion } from "framer-motion"

type Option = {
  id: string;
  label: string;
  votes: number;
};

export default function Home() {
  const [options, setOptions] = useState<Option[]>([
    { id: "deepseek", label: "Deepseek", votes: 0 },
    { id: "chatgpt", label: "ChatGPT", votes: 0 },
    { id: "cursor", label: "Cursor", votes: 0 },
  ]);
  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0)

  const handleVote = (id: string) => {
    setOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.id === id
          ? { ...option, votes: option.votes + 1 }
          : option
      )
    );
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
      {/* eslint-disable-next-line react/no-unescaped-entities */}
<label className="block mb-4 text-zinc-700">
  Which AI agent do you prefer?
</label>
        <div className="space-y-4">
          {options.map((option) => (
            <div key={option.id} className="relative">
              <button
                onClick={() => handleVote(option.id)}
                className="w-full text-left p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors duration-200 ease-in-out"
              >
                <span className="font-medium text-purple-900">{option.label}</span>
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-700">
                  {option.votes} votes
                </span>
              </button>
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${(option.votes / totalVotes) * 100 || 0}%` }}
                transition={{ duration: 0.5 }}
                className="absolute left-0 top-0 h-full bg-purple-300 rounded-lg opacity-50 z-0"
              />
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-purple-600 font-medium">Total votes: {totalVotes}</p>
      </div>
    </div>
  )
}
