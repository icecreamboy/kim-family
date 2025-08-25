"use client";

import { Vec2 } from "kaboom";
import { useEffect, useRef, useState } from "react";

/**
 * Rock Climber v2 with Debug Overlay
 */
export default function Climb() {
  const rootRef = useRef<HTMLDivElement>(null);
  const holdCounterTextRef = useRef<any>(null);
  const [debug, setDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [lastClick, setLastClick] = useState<{ x: number; y: number } | null>(null);
  const [fallCount, setFallCount] = useState(0);
  const [holdCount, setHoldCount] = useState(0);
  const [started, setStarted] = useState(false); // <-- Add started state

  // Helper to add debug logs (keeps last 10)
  const log = (msg: string) => {
    setDebugLogs((logs) => {
      const next = [...logs, msg];
      return next.length > 100 ? next.slice(next.length - 100) : next;
    });
  };

  useEffect(() => {
    let destroy: (() => void) | undefined;

    (async () => {
      const kaplay = (await import("kaboom")).default;

      const W = 360;
      const H = 480;
      const HOLD_RADIUS = 11;
      const SPAWN_VERTICAL_GAP = 90;
      const SAFE_X_MARGIN = 24;
      const CLICK_RADIUS = 30;

      if (!rootRef.current) return;
      rootRef.current.innerHTML = "";

      const k = kaplay({
        global: false,
        width: W,
        height: H,
        root: rootRef.current,
        background: [240, 247, 255],
      });

      // ---- Game state ----
      let holds: any[] = [];
      let nextHoldIndex = 0;
      let targetIndex = 0;
      let attachedHold: any | null = null;
      let grabbing = false;
      let falling = false; // <-- Add this flag
      let time = 0;
      let debugCircle: any = null;
      let debugClickMarker: any = null;
      let gameActive = false; // <-- Local flag for game running
      let climberFallVel = 0; // <-- Add this variable

      // Add this variable to track the fall start position
      let fallStartPos: { x: number; y: number } | null = null;

      // Add waitingForRestart flag
      let waitingForRestart = false;

      // Scrolling speed (pixels/sec)
      const BASE_SPEED = 35;
      const ACCEL_PER_SEC = 3;
      const MAX_SPEED = 160;

      // Add justReset flag to prevent double input after reset
      let justReset = false;

      const randX = () => k.randi(SAFE_X_MARGIN, W - SAFE_X_MARGIN);

      function spawnHold(x: number, y: number) {
        const tag = "hold";
        const hold = k.add([
          k.pos(x, y),
          k.circle(HOLD_RADIUS),
          k.color(0, 120, 255),
          k.area({ cursor: "pointer" }),
          { idx: nextHoldIndex },
          tag,
        ]);
        nextHoldIndex++;
        holds.push(hold);
        return hold;
      }

      function topMostHoldY() {
        if (!holds.length) return H;
        return Math.min(...holds.map((h) => h.pos.y));
      }

      function cleanupHolds() {
        holds = holds.filter((h) => {
          if (h.pos.y > H + 40) {
            h.destroy();
            return false;
          }
          return true;
        });
      }

      function ensureHoldsBuffer() {
        const bufferCount = 12;
        while (holds.length < bufferCount) {
          const topY = topMostHoldY();
          const newY = (holds.length ? topY : H - 80) - SPAWN_VERTICAL_GAP;
          let x = randX();
          if (holds.length) {
            const last = holds[holds.length - 1];
            if (Math.abs(last.pos.x - x) < 40) {
              x = Math.min(W - SAFE_X_MARGIN, Math.max(SAFE_X_MARGIN, x + (x < W / 2 ? 40 : -40)));
            }
          }
          spawnHold(x, newY);
        }
      }

      const climber = k.add([
        k.pos(W / 2, H - 30),
        k.rect(22, 22),
        k.area(),
        k.body({ gravityScale: 1 }),
        k.color(255, 100, 100),
        "climber",
      ]);

      function resetRun() {
        time = 0;
        targetIndex = 0;
        grabbing = false;
        attachedHold = null;
        holds.forEach((h) => h.destroy());
        holds = [];
        nextHoldIndex = 0;
        const startY = H - 90;
        spawnHold(W / 2 - 80, startY);
        spawnHold(W / 2 + 40, startY - SPAWN_VERTICAL_GAP);
        spawnHold(W / 2 - 50, startY - SPAWN_VERTICAL_GAP * 2);
        ensureHoldsBuffer();
        climber.pos = k.vec2(W / 2, H - 30);
        climber.vel = k.vec2(0, 0);
        setHoldCount(0);
        gameActive = false; // Pause game until first click
        setStarted(false);  // Pause game until first click (React state)
        if (debug) log("Run reset");
      }

      resetRun();

      // ---- Input: tap/click/touch to try grabbing a hold ----
      function handleInput(pos: { x: number; y: number }) {
        setLastClick({ x: pos.x, y: pos.y });
   
        // Start the game on first click
        if (!gameActive) {
          gameActive = true;
          setStarted(true);
          if (debug) log("Game started!");
        }

        if (!gameActive) return;

        // Draw debug click marker
        if (debug) {
          if (debugClickMarker) debugClickMarker.destroy();
          debugClickMarker = k.add([
            k.pos(pos.x, pos.y),
            k.circle(6),
            k.color(255, 0, 0),
            k.opacity(0.7),
            "debugClickMarker",
            k.lifespan(1),
          ]);
        }

        const nearest = holds
          .map((h) => ({ h, d: k.vec2(h.pos).dist(k.vec2(pos.x, pos.y)) }))
          .filter(({ d }) => d <= CLICK_RADIUS)
          .sort((a, b) => a.d - b.d)[0]?.h;

        if (debug) {
          log(
            `Input at (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}), nearest hold: ${
              nearest ? `idx=${nearest.idx}, dist=${k.vec2(nearest.pos).dist(k.vec2(pos.x, pos.y)).toFixed(1)}` : "none"
            }, targetIndex=${targetIndex}`
          );
        }

        if (!nearest) {
          if (debug) log("No hold within click radius.");
          fallStartPos = { x: pos.x, y: pos.y }; // <-- Set fall start position to click
          fall();
          return;
        }

        if (nearest.idx !== targetIndex) {
          if (debug) log(`Tried to grab idx=${nearest.idx}, but target is idx=${targetIndex}. FALL!`);
          fallStartPos = { x: pos.x, y: pos.y }; // <-- Set fall start position to click
          fall();
          return;
        }

        attachedHold = nearest;
        grabbing = true;
        climber.vel = k.vec2(0, 0);
        climber.pos = k.vec2(nearest.pos);
        targetIndex++;
        setHoldCount((c) => c + 1);
        if (debug) log(`Grabbed hold idx=${nearest.idx}. Next target: ${targetIndex}`);
      }

      let lastInputTime = 0;

      function processInputOnce(pos: { x: number; y: number }) {
        const now = Date.now();
        if (now - lastInputTime < 300) return; // Ignore if within 300ms of last input
        lastInputTime = now;

        if (waitingForRestart) {
          waitingForRestart = false;
          setHoldCount(0);
          resetRun();
          justReset = true;
          return;
        }
        if (justReset) {
          justReset = false;
          return;
        }
        if (!falling) handleInput(pos);
      }

      // Mouse/tap support
      k.onClick(() => {
        processInputOnce(k.mousePos());
      });

      // Touch support (for mobile/iPad)
      k.onTouchStart((id, touch) => {
        processInputOnce({ x: touch.clientX, y: touch.clientY });
      });

      function fall() {
        grabbing = false;
        attachedHold = null;
        falling = true;
        climberFallVel = 200; // pixels per second
        // Move climber to the fall start position if set
        if (fallStartPos) {
          climber.pos = k.vec2(fallStartPos.x, fallStartPos.y);
        }
        // Do NOT reset holdCount or start a new run here!
        setFallCount((c) => c + 1);
        gameActive = false;
        if (debug) log("FALL triggered.");
      }

      // Add holds grabbed counter as a separate text box (once)
      if (holdCounterTextRef.current) holdCounterTextRef.current.destroy();
      holdCounterTextRef.current = k.add([
        k.text(`Holds grabbed: 0`, {
          size: 18,
          width: W,
          align: "center",
        }),
        k.pos(W / 2, 12),
        k.anchor("top"),
        k.color(30, 60, 180),
        "holdCounterText",
      ]);

      // Add instructions as a separate text box (once)
      k.add([
        k.text(
          `Tap anywhere to start!\nTap holds in order!\nSkip = fall.\nSpeed increases over time.`,
          {
            size: 12,
            width: W - 16,
            align: "center",
          }
        ),
        k.pos(W / 2, 38),
        k.anchor("top"),
        k.color(60, 60, 60),
        "instructionsText",
      ]);

      // ---- Main loop ----
      k.onUpdate(() => {
        if ((!gameActive && !falling && !waitingForRestart)) return;

        const dt = k.dt();

        // Only scroll holds if not falling or waiting for restart
        if (!falling && !waitingForRestart) {
          time += dt;
          const speed = Math.min(MAX_SPEED, BASE_SPEED + ACCEL_PER_SEC * time);
          const dy = speed * dt;
          holds.forEach((h) => {
            h.pos.y += dy;
          });
        }

        // If attached to a hold, keep the climber locked to it
        if (!falling && !waitingForRestart && grabbing && attachedHold) {
          climber.pos = k.vec2(attachedHold.pos);
        }

        cleanupHolds();
        ensureHoldsBuffer();

        // If attachedHold was destroyed, fall
        if (!falling && !waitingForRestart && attachedHold && !holds.includes(attachedHold)) {
          if (debug) log("Attached hold destroyed. FALL!");
          fall();
        }

        // If the climber falls off screen, freeze at the bottom and wait for click
        if (falling && climber.pos.y > H - 20) {
          climber.pos.y = H - 20; // Freeze at bottom
          falling = false;
          waitingForRestart = true;
          if (debug) log("Climber at bottom. Waiting for restart.");
        }

        if (climber.pos.y < -20) {
          climber.pos.y = -20;
        }

        // Draw debug click radius on target hold
        if (debug) {
          if (debugCircle) debugCircle.destroy();
          const targetHold = holds.find((h) => h.idx === targetIndex);
          if (targetHold) {
            debugCircle = k.add([
              k.pos(targetHold.pos),
              k.circle(CLICK_RADIUS),
              k.color(0, 200, 0),
              k.opacity(0.18),
              "debugCircle",
              k.lifespan(0.2),
            ]);
          }
        }

        // Falling logic
        if (falling) {
          const dt = k.dt();
          climber.pos.y += climberFallVel * dt;
          climberFallVel += 600 * dt; // gravity acceleration (pixels/sec^2)
        }
      });

      // ---- Restart on click after fall ----
      k.onClick(() => {
        if (waitingForRestart) {
          waitingForRestart = false;
          setHoldCount(0);
          resetRun();
          justReset = true; // <-- Set flag
          return;
        }
        if (justReset) {
          justReset = false; // <-- Ignore this click for input
          return;
        }
        if (!falling) processInputOnce(k.mousePos());
      });

      k.onTouchStart((id, touch) => {
        if (waitingForRestart) {
          waitingForRestart = false;
          setHoldCount(0);
          resetRun();
          justReset = true; // <-- Set flag
          return;
        }
        if (justReset) {
          justReset = false; // <-- Ignore this tap for input
          return;
        }
        if (!falling) processInputOnce({ x: touch.clientX, y: touch.clientY });
      });

      destroy = () => {
        try {
          k.destroyAll?.("*");
        } catch {}
        if (rootRef.current) rootRef.current.innerHTML = "";
      };
    })();

    return () => destroy?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debug]);

  // Update the Kaboom counter text when holdCount changes
  useEffect(() => {
    if (holdCounterTextRef.current) {
      holdCounterTextRef.current.text = `Holds grabbed: ${holdCount}`;
    }
  }, [holdCount]);

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-bold mb-2">Rock Climber — Scroller</h1>
      <p className="text-sm text-gray-600 mb-3">
        Tap the <span className="font-semibold">next</span> hold only. Skipping a hold makes you fall. It gets faster…
      </p>
      <button
        className={`mb-2 px-3 py-1 rounded text-xs font-mono border ${debug ? "bg-green-100 border-green-400" : "bg-gray-100 border-gray-400"}`}
        onClick={() => setDebug((d) => !d)}
      >
        {debug ? "Debug ON" : "Debug OFF"}
      </button>
      {/* Prevent Safari gestures from interfering */}
      <div ref={rootRef} className="border rounded overflow-hidden [touch-action:none]" />
      {debug && (
        <div className="mt-2 p-2 bg-black/80 text-green-200 text-xs font-mono rounded max-h-40 overflow-y-auto">
          <div className="mb-1 font-bold text-green-300">Debug Log</div>
          {debugLogs.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
          {lastClick && (
            <div className="mt-1 text-yellow-200">
              Last click: ({lastClick.x.toFixed(1)}, {lastClick.y.toFixed(1)})
            </div>
          )}
          <div className="mt-1 text-blue-200">Click radius: {30}px</div>
          <div className="mt-1 text-red-300 font-bold">
            Falls this run: {fallCount}
          </div>
          {debugLogs[debugLogs.length - 1]?.includes("FALL") && (
            <div className="mt-2 p-2 bg-red-700/80 text-white rounded font-bold text-center">
              FALL OCCURRED!
            </div>
          )}
        </div>
      )}
    </div>
  );
}