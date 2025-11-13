import { motion, useTransform, MotionValue, useSpring } from "framer-motion";
import ornamentImage from "@/assets/grc-ornament.jpg";

interface AnimatedProductCardProps {
  scrollProgress: MotionValue<number>;
  targets?: { x: number; y: number }[];
}

export const AnimatedProductCard = ({ scrollProgress, targets }: AnimatedProductCardProps) => {
  // Stable target mapping based on measured puzzle slot centers
  const t = targets ?? [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ];
  const safe = (i: number) => t[i] ?? { x: 0, y: 0 };
  const points = [0, 0.24, 0.26, 0.49, 0.51, 0.74, 0.76, 1.0];

  const xRaw = useTransform(scrollProgress, points, [
    safe(0).x,
    safe(0).x,
    safe(1).x,
    safe(1).x,
    safe(2).x,
    safe(2).x,
    safe(3).x,
    safe(3).x,
  ]);
  const yRaw = useTransform(scrollProgress, points, [
    safe(0).y,
    safe(0).y,
    safe(1).y,
    safe(1).y,
    safe(2).y,
    safe(2).y,
    safe(3).y,
    safe(3).y,
  ]);

  const x = useSpring(xRaw, { stiffness: 160, damping: 26, mass: 0.9 });
  const y = useSpring(yRaw, { stiffness: 160, damping: 26, mass: 0.9 });

  // Scale with smooth emphasis on section 3
  const scale = useTransform(
    scrollProgress,
    [0, 0.04, 0.08, 0.48, 0.5, 0.52, 0.54, 0.92],
    [0.85, 0.95, 1, 1, 1.05, 1.15, 1.05, 1]
  );

  // Smooth opacity
  const opacity = useTransform(
    scrollProgress,
    [0, 0.04, 0.08, 0.92, 0.96, 1.0],
    [0, 0.6, 1, 1, 0.6, 0]
  );

  return (
    <motion.div
      className="pointer-events-none fixed left-1/2 top-1/2 z-50 w-[500px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2"
      style={{
        x,
        y,
        scale,
        opacity,
      }}
      transition={{
        type: "spring",
        stiffness: 60,
        damping: 35,
        mass: 1,
      }}
    >
      <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={ornamentImage}
            alt="Premium GRC Wall Ornament"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="bg-gradient-to-br from-white to-neutral-50 p-6">
          <h3 className="mb-2 bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-2xl font-bold text-transparent">
            Venetian Collection
          </h3>
          <p className="text-neutral-600">
            Handcrafted GRC wall ornament with classical elegance
          </p>
        </div>
      </div>
    </motion.div>
  );
};
