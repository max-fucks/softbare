"use client";

import { motion, useAnimation, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { actorName, haptic } from "@/lib/utils";
import type { Look } from "@/lib/types";

export default function SwipeCard({
  look,
  onVote,
  disabled,
}: {
  look: Look;
  onVote: (direction: "left" | "right") => void;
  disabled?: boolean;
}) {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const rotate = useTransform(x, [-220, 220], [-14, 14]);
  const opacity = useTransform(x, [-260, -80, 0, 80, 260], [0.35, 1, 1, 1, 0.35]);
  const leftStamp = useTransform(x, [-160, -40, 0], [1, 0.4, 0]);
  const rightStamp = useTransform(x, [0, 40, 160], [0, 0.4, 1]);

  const handleDragEnd = async (_event: unknown, info: { offset: { x: number } }) => {
    if (disabled) return;
    const threshold = 110;
    if (info.offset.x > threshold) {
      haptic([12, 30, 40]);
      await controls.start({ x: 520, opacity: 0, transition: { duration: 0.18 } });
      onVote("right");
    } else if (info.offset.x < -threshold) {
      haptic([12, 30, 40]);
      await controls.start({ x: -520, opacity: 0, transition: { duration: 0.18 } });
      onVote("left");
    } else {
      controls.start({ x: 0, opacity: 1, transition: { type: "spring", bounce: 0.38 } });
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab overflow-hidden rounded-[1.75rem] shadow-glow touch-none active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag={disabled ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
    >
      <div className="relative h-full w-full bg-surface">
        <Image
          src={look.image_url}
          alt={actorName(look.actors)}
          fill
          sizes="(max-width: 768px) 100vw, 420px"
          className="pointer-events-none object-cover"
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <motion.div
          style={{ opacity: leftStamp }}
          className="absolute left-5 top-8 rounded-md border-4 border-accent px-3 py-1 text-2xl font-black uppercase tracking-widest text-accent"
        >
          Left
        </motion.div>
        <motion.div
          style={{ opacity: rightStamp }}
          className="absolute right-5 top-8 rounded-md border-4 border-emerald-400 px-3 py-1 text-2xl font-black uppercase tracking-widest text-emerald-400"
        >
          Right
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-[10px] font-bold uppercase tracking-[.28em] text-neon">Live index</p>
          <h3 className="font-display text-3xl font-black tracking-tight">{actorName(look.actors)}</h3>
          <p className="mt-1 font-mono text-sm text-gray-300">ELO {Math.round(look.elo_rating)}</p>
        </div>
      </div>
    </motion.div>
  );
}
