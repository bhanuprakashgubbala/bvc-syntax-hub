"use client";

import { useEffect, useRef } from "react";

export default function HackerMatrixBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Tactical cyber nodes
    const nodeCount = Math.min(50, Math.floor((width * height) / 22000));
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.5 + 1,
        alpha: Math.random() * 0.5 + 0.3,
      });
    }

    // Floating cyber telemetry packets
    const telemetryStrings = [
      "SYN_SENT [10.11.0.1:443]",
      "TLS_1.3 // X25519",
      "PKI_VERIFIED // ED25519",
      "ZERO_TRUST: ADMITTED",
      "SEC_OPS // NODE_4",
      "0x7F000001",
      "SHA-512_HASH_OK",
      "PACKET_INSPECT: CLEAN",
      "FIREWALL: PASS",
      "BVC_SOC_GATEWAY",
    ];

    const streams = [];
    const streamCount = Math.min(10, Math.floor(width / 140));
    for (let i = 0; i < streamCount; i++) {
      streams.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.3 + Math.random() * 0.5,
        text: telemetryStrings[Math.floor(Math.random() * telemetryStrings.length)],
        alpha: 0.15 + Math.random() * 0.2,
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const render = () => {
      // Clear with deep tactical carbon black
      ctx.fillStyle = "#07080a";
      ctx.fillRect(0, 0, width, height);

      // Subtle tactical grid dots
      ctx.fillStyle = "rgba(16, 185, 129, 0.035)";
      const gridSize = 40;
      for (let gx = gridSize / 2; gx < width; gx += gridSize) {
        for (let gy = gridSize / 2; gy < height; gy += gridSize) {
          ctx.fillRect(gx, gy, 1, 1);
        }
      }

      // Draw faint telemetry data streams
      ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
      for (let s of streams) {
        ctx.fillStyle = `rgba(16, 185, 129, ${s.alpha})`;
        ctx.fillText(s.text, s.x, s.y);
        s.y += s.speed;
        if (s.y > height + 20) {
          s.y = -20;
          s.x = Math.random() * width;
          s.text = telemetryStrings[Math.floor(Math.random() * telemetryStrings.length)];
        }
      }

      // Update & render cyber nodes & vector connections
      const maxDist = 140;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Draw node
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52, 211, 153, ${n.alpha})`;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.16;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full block bg-[#07080a]"
      />

      {/* Subtle tactical scanline grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.5) 50%)",
          backgroundSize: "100% 3px",
        }}
      />

      {/* Dark vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, transparent 35%, rgba(7, 8, 10, 0.8) 75%, #07080a 100%)",
        }}
      />
    </div>
  );
}
