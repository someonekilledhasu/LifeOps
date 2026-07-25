"use client";

import { useEffect, useState } from "react";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    setEnabled(true);

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);

      const target = e.target as HTMLElement;
      const interactive = target.closest(
        "a, button, input, textarea, select, [role='button'], .cursor-pointer"
      );
      setIsPointer(Boolean(interactive));
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setVisible(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden md:block"
      style={{
        transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.2s ease",
      }}
    >
      <div
        className="rounded-full bg-primary shadow-md transition-all duration-150 ease-out"
        style={{
          width: isPointer ? 40 : 16,
          height: isPointer ? 40 : 16,
          transform: isClicking ? "scale(0.75)" : "scale(1)",
          opacity: isPointer ? 0.35 : 0.9,
        }}
      />
    </div>
  );
}