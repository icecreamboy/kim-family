"use client";
import { useEffect, useRef } from "react";
import kaboom from "kaboom";

const holds = [
	{ x: 150, y: 200 },
	{ x: 250, y: 150 },
	{ x: 350, y: 100 },
];

const WIDTH = 400;
const HEIGHT = 300;

const ClimbPage = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const kaboomRef = useRef<ReturnType<typeof kaboom> | null>(null);
	const playerRef = useRef<any>(null);

	useEffect(() => {
		if (!canvasRef.current) return;

		// Init kaboom with the canvas
		const k = kaboom({
			canvas: canvasRef.current,
			width: WIDTH,
			height: HEIGHT,
			background: [240, 240, 255],
		});
		kaboomRef.current = k;

		// Add holds
		holds.forEach((hold) => {
			k.add([
				k.rect(20, 20),
				k.pos(hold.x, hold.y),
				k.area(),
				k.color(0, 0, 0),
				"hold",
			]);
		});

		// Add player (simple circle)
		const player = k.add([
			k.pos(100, 250),
			k.area(),
			k.circle(12),
			k.color(30, 144, 255),
			"player",
			{ stamina: 100, hanging: false },
		]);
		playerRef.current = player;

		// Simple gravity
		let vy = 0;
		const gravity = 400;

		k.onUpdate("player", (p) => {
			if (!p.hanging) {
				vy += gravity * k.dt();
				p.move(0, vy);

				// Floor
				if (p.pos.y > 280) {
					p.pos.y = 280;
					vy = 0;
				}
			} else {
				vy = 0;
			}
		});

		return () => {
			// Kaboom doesn't have a destroy method, but you can clear the canvas
			canvasRef.current?.getContext("2d")?.clearRect(0, 0, WIDTH, HEIGHT);
		};
	}, []);

	// Add click handler to canvas
	const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const rect = canvasRef.current!.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const k = kaboomRef.current;
		const player = playerRef.current;
		if (!k || !player) return;

		// Always move the player to the click position
		player.pos = k.vec2(x, y);

		// Check if close to a hold
		let isHanging = false;
		k.get("hold").forEach((h: any) => {
			const d = Math.hypot(h.pos.x - x, h.pos.y - y);
			if (d < 60) {
				player.pos = h.pos.clone();
				isHanging = true;
			}
		});
		player.hanging = isHanging;
	};

	return (
		<div className="flex justify-center items-center h-screen">
			<canvas
				ref={canvasRef}
				width={WIDTH}
				height={HEIGHT}
				onClick={handleCanvasClick}
				style={{ touchAction: "manipulation" }}
			/>
		</div>
	);
};

export default ClimbPage;