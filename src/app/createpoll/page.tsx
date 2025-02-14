"use client";
import { useState } from "react";
import { Card, CardContent, CardTitle } from "../components/ui/card";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

const CreatePoll = () => {
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [currentOption, setCurrentOption] = useState<string>("");

  const addOption = () => {
    if (currentOption.trim()) {
      setOptions([...options, currentOption]);
      setCurrentOption("");
    }
  };

  const deleteOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const submitPoll = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!question.trim() || options.length === 0) {
      alert("Please enter a question and at least one option.");
      return;
    }

    try {
      const { error } = await supabase.from("quickpoll").insert([
        {
          title: question,
          options,
        },
      ]);

      if (error) throw error;

      alert("Poll submitted successfully!");
      setQuestion("");
      setOptions([]);
    } catch (error) {
      console.error("Error submitting poll:", error);
      alert("Failed to submit poll. Please try again.");
    }
  };

  return (
    <div className="p-4 min-h-screen bg-zinc-100 flex flex-col items-center justify-center">
      <Link href={"/viewpoll"}>View Poll</Link>
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-center text-xl font-bold mb-6">Create New Poll</h1>
        
        <input
          placeholder="Add title"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="p-2 border rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-2 mb-4">
          <input
            placeholder="Enter option"
            value={currentOption}
            onChange={(e) => setCurrentOption(e.target.value)}
            className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addOption}
            className="bg-zinc-950 text-white p-2 rounded hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Option
          </button>
        </div>

        <form onSubmit={submitPoll} className="w-full">
          <Card>
            <CardTitle className="p-4 text-lg font-semibold">
              {question || "Your Poll"}
            </CardTitle>
            <CardContent>
              <ul className="space-y-2">
                {options.map((option, index) => (
                  <OptionItem
                    key={index}
                    option={option}
                    onDelete={() => deleteOption(index)}
                  />
                ))}
              </ul>
            </CardContent>
          </Card>

          <button
            type="submit"
            className="mt-4 p-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >

            Submit Poll
          </button>
        </form>
      </div>
    </div>
  );
};

// Reusable OptionItem Component
const OptionItem = ({ option, onDelete }: { option: string; onDelete: () => void }) => (
  <div className="flex items-center justify-between p-2 border rounded">
    <li>{option}</li>
    <button
      type="button"
      onClick={onDelete}
      className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      Delete
    </button>
  </div>
);

export default CreatePoll;