"use client";

import { useState } from "react";

export default function Home() {
  return (
    <div>
      <nav>

      </nav>
      <main>
        <h1 className="text-3xl font-bold text-center text-zinc-700">Poll App</h1>
        <div className="flex justify-center items-center">
        <div className="md:w-60 border border-zinc-100 shadow-md p-6 ">
          <label>Which AI agent do your prefer?</label>
        <div className="w-100 shadow-sm ">
        <input type="radio"/>
        <label> Deepseek</label>
        </div>

        <div>
        <input type="radio"/>
        <label> Chat gpt</label>
        </div>

        <div>
        <input type="radio"/>
        <label> Cursor</label>
        </div>

        </div>
        </div>

      </main>
    </div>
    
  );
}
