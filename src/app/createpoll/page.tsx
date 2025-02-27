"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "../components/ui/card";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

const CreatePoll = () => {
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [currentOption, setCurrentOption] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  // Check if the user is logged in and get user ID
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login"); // Redirect to login if not logged in
      } else {
        setUserId(user.id); // Store user ID
      }
    };

    checkUser();
  }, [router]);

  const addOption = () => {
    const trimmedOption = currentOption.trim();
    if (!trimmedOption) {
      alert("Option cannot be empty!");
      return;
    }
    if (options.includes(trimmedOption)) {
      alert("Option already exists!");
      return;
    }
    setOptions([...options, trimmedOption]);
    setCurrentOption("");
  };

  const deleteOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const submitPoll = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!question.trim()) {
      alert("Please enter a question.");
      setIsSubmitting(false);
      return;
    }
    if (options.length === 0) {
      alert("Please add at least one option.");
      setIsSubmitting(false);
      return;
    }
    if (!userId) {
      alert("User not authenticated. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("quickpoll")
        .insert([{ title: question, options, user_id: userId }])
        .select("id");

      if (error) throw error;

      alert("Poll submitted successfully!");
      setQuestion("");
      setOptions([]);
    } catch (error) {
      console.error("Error submitting poll:", error);
      alert("Failed to submit poll. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 min-h-screen bg-zinc-100 flex flex-col items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-center text-xl font-bold mb-6">Create New Poll</h1>

        <input
          placeholder="Add title"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="p-2 border rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="flex gap-2 mb-4">
          <input
            placeholder="Enter option"
            value={currentOption}
            onChange={(e) => setCurrentOption(e.target.value)}
            className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={addOption}
            className="bg-purple-600 text-white p-2 rounded hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Add
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
            disabled={isSubmitting}
            className="mt-4 p-2 bg-purple-600 text-white rounded w-full hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Poll"}
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