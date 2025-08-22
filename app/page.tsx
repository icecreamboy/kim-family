"use client";
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const dayEmojis: Record<number, string> = {
  0: "🌮", // Sunday: tacos
  1: "🍗", // Monday: chicken
  2: "🍛", // Tuesday: curry
  3: "🥩", // Wednesday: steak
  4: "🍝", // Thursday: spaghetti
  5: "🍔", // Friday: burgers
  6: "🍕", // Saturday: pizza
};

const dayNames = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const NUM_EMOJIS = 18;

const FallingEmojis = ({ day }: { day: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const emoji = dayEmojis[day] || "🍕";

  useEffect(() => {
    const emojis: HTMLSpanElement[] = [];
    const container = containerRef.current;
    if (!container) return;

    for (let i = 0; i < NUM_EMOJIS; i++) {
      const span = document.createElement('span');
      span.textContent = emoji;
      span.style.position = 'absolute';
      span.style.left = `${Math.random() * 100}%`;
      span.style.top = `${-Math.random() * 100}px`;
      span.style.fontSize = `${28 + Math.random() * 24}px`;
      span.style.opacity = `${0.7 + Math.random() * 0.3}`;
      span.style.pointerEvents = 'none';
      span.style.userSelect = 'none';
      span.style.transition = 'none';
      container.appendChild(span);
      emojis.push(span);
    }

    let running = true;
    function animate() {
      emojis.forEach((span) => {
        let top = parseFloat(span.style.top || '0');
        top += 1.2 + Math.random() * 1.2;
        if (top > window.innerHeight + 40) {
          top = -40;
          span.style.left = `${Math.random() * 100}%`;
        }
        span.style.top = `${top}px`;
      });
      if (running) requestAnimationFrame(animate);
    }
    animate();

    return () => {
      running = false;
      emojis.forEach(span => container.removeChild(span));
    };
  }, [emoji]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  );
};

const HomePage = () => {
  // Debugging: allow selecting the day
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 relative overflow-hidden">
      <FallingEmojis day={selectedDay} />
      <div className="absolute top-4 right-4 z-20 bg-white/80 rounded shadow px-3 py-2 flex items-center gap-2">
        <label htmlFor="day-select" className="text-sm font-medium">Day:</label>
        <select
          id="day-select"
          value={selectedDay}
          onChange={e => setSelectedDay(Number(e.target.value))}
          className="rounded border px-2 py-1 text-sm"
        >
          {dayNames.map((name, idx) => (
            <option key={idx} value={idx}>{name}</option>
          ))}
        </select>
        <span className="text-xl">{dayEmojis[selectedDay]}</span>
      </div>
      <h1 className="text-4xl font-bold mb-8 z-10">Welcome to the Kim Family App!</h1>
      <p className="text-lg mb-6 z-10">Jeremy, Emily, Josephine, Eleanor</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 z-10">
        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">Trivia Generator</h2>
          <p className="mt-2">Test your knowledge with fun trivia questions!</p>
          <Link href="/trivia" className="mt-4 inline-block text-blue-500 hover:underline">Start Trivia
          </Link>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">Kim Family Site</h2>
          <p className="mt-2">Learn more about our family!</p>
          <Link href="/about" className="mt-4 inline-block text-blue-500 hover:underline">About Us
          </Link>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">Rock Climber Game</h2>
          <p className="mt-2">Join the adventure and climb to the top!</p>
          <Link href="/climb" className="mt-4 inline-block text-blue-500 hover:underline">Play Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;