"use client";

import Image from "next/image";


export default function Home() {
 

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center">
     

<Image
  src="/images/background.jpg"
  alt="AI Background"
  layout="fill"
  objectFit="cover"
  className="z-0"
/>;
        <div className="z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Welcome to Quick Poll Website!
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8">
          This is a simple polling application.
          </p>
          <a
            href="/createpoll"
            className="bg-purple-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors duration-300"
          >
            Vote Now
          </a>
        </div>
      </div>
      <div className="flex justify-between gap-4 p-6 bg-purple-50">
  {/* Card 1 */}
  <div className="border border-zinc-500 shadow-sm rounded-lg p-4 w-1/4">
    
    <Image
     src="/images/picture1.jpg"
     alt="Placeholder"
     className="w-full h-48 object-cover rounded-md"
    />
    <h3 className="mt-2 text-lg font-semibold text-center">Create Poll</h3>
    
  </div>

  {/* Card 2 */}
  <div className="border border-zinc-500 shadow-sm rounded-lg p-4 w-1/4">
    <Image
      src="/images/picture2.jpg"
      alt="Placeholder"
      className="w-full h-48 object-cover rounded-md"
    />
    <h3 className="mt-2 text-lg font-semibold text-center">Vote</h3>
   
  </div>

  {/* Card 3 */}
  <div className="border border-zinc-500 shadow-sm rounded-lg p-4 w-1/4">
    <Image
      src="/images/picture3.jpg"
      alt="Placeholder"
      className="w-full h-48 object-cover rounded-md"
    />
    <h3 className="mt-2 text-lg font-semibold text-center">View Visuals</h3>
   
  </div>
</div>
     
    </div>
  );
}