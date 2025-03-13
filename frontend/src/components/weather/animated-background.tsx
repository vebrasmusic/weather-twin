"use client";

import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasDimensions();
    window.addEventListener("resize", setCanvasDimensions);

    // Create topographic lines
    const lines: TopoLine[] = [];
    const lineCount = 12; // Increased from 8
    const lineSpacing = canvas.height / lineCount;

    class TopoLine {
      points: { x: number; y: number }[];
      baseY: number;
      amplitude: number;
      frequency: number;
      speed: number;
      opacity: number;
      phase: number;
      lineWidth: number;

      constructor(y: number) {
        this.baseY = y;
        this.points = [];
        this.amplitude = Math.random() * 30 + 15; // Increased amplitude
        this.frequency = Math.random() * 0.01 + 0.005;
        this.speed = Math.random() * 0.0005 + 0.0002;
        this.opacity = Math.random() * 0.08 + 0.04; // Increased opacity
        this.phase = Math.random() * Math.PI * 2;
        this.lineWidth = Math.random() * 1.5 + 0.8; // Thicker lines

        if (!canvas) return;
        // Create points along the line
        const pointCount = Math.ceil(canvas.width / 4); // More points for smoother lines
        for (let i = 0; i < pointCount; i++) {
          const x = (i / (pointCount - 1)) * canvas.width;
          const y = this.baseY;
          this.points.push({ x, y });
        }
      }

      update() {
        this.phase += this.speed;
        for (let i = 0; i < this.points.length; i++) {
          const x = this.points[i].x;
          const y =
            this.baseY +
            Math.sin(x * this.frequency + this.phase) * this.amplitude;
          this.points[i].y = y;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);

        for (let i = 1; i < this.points.length; i++) {
          ctx.lineTo(this.points[i].x, this.points[i].y);
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`; // Changed to white (from green)
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();
      }
    }

    // Initialize lines
    const init = () => {
      for (let i = 0; i < lineCount; i++) {
        lines.push(new TopoLine(i * lineSpacing + lineSpacing / 2));
      }
    };
    init();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw lines
      for (let i = 0; i < lines.length; i++) {
        lines[i].update();
        lines[i].draw();
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasDimensions);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
}
