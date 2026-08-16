/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import Image from "next/image";

export default function SwipeCard({ look, onVote }: { look: any, onVote: (direction: "left" | "right") => void }) {
  const x = useMotionValue(0);
  const controls = useAnimation();
  
  // Psychological Design: The further you drag, the more the card tilts and fades
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = async (event: any, info: any) => {
    const threshold = 100; // Pixels needed to register a vote
    if (info.offset.x > threshold) {
      // Swiped Right
      // Trigger the haptic tap (50ms vibration on supported mobile browsers)
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50); 
      }
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.2 } });
      onVote("right");
    } else if (info.offset.x < -threshold) {
      // Swiped Left
      // Trigger the haptic tap
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.2 } });
      onVote("left");
    } else {
      // Snap back to center if user hesitated (reduces accidental votes)
      controls.start({ x: 0, opacity: 1, transition: { type: "spring", bounce: 0.4 } });
    }
  };

  return (
    <motion.div
      className="absolute w-full max-w-sm h-[70vh] rounded-2xl overflow-hidden shadow-glow touch-none cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
    >
      <div className="relative w-full h-full bg-surface">
        <Image 
          src={look.image_url} 
          alt="Celebrity Look" 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover pointer-events-none"
          priority
        />
        {/* Subtle gradient overlay to ensure text visibility if added later */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}
