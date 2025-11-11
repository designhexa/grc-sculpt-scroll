import { motion, useTransform, MotionValue } from "framer-motion";
import ornamentImage from "@/assets/grc-ornament.jpg";

interface AnimatedProductCardProps {
  scrollProgress: MotionValue<number>;
}

export const AnimatedProductCard = ({ scrollProgress }: AnimatedProductCardProps) => {
  // Smooth X position - moving to specific puzzle slots
  const x = useTransform(
    scrollProgress,
    [0, 0.2, 0.25, 0.45, 0.5, 0.7, 0.75, 1.0],
    ["0%", "0%", "-50%", "-50%", "50%", "50%", "0%", "0%"]
  );

  // Smooth Y position - entering from bottom, settling at each section
  const y = useTransform(
    scrollProgress,
    [0, 0.08, 0.2, 0.25, 0.45, 0.5, 0.7, 0.75, 0.9, 1.0],
    ["80%", "0%", "0%", "0%", "0%", "0%", "0%", "0%", "0%", "80%"]
  );

  // Subtle scale - only slight zoom on section 3
  const scale = useTransform(
    scrollProgress,
    [0, 0.08, 0.5, 0.55, 0.7, 0.75],
    [0.85, 1, 1, 1.08, 1.08, 1]
  );

  // Smooth opacity
  const opacity = useTransform(
    scrollProgress,
    [0, 0.05, 0.08, 0.9, 0.95, 1.0],
    [0, 0.3, 1, 1, 0.3, 0]
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
        stiffness: 80,
        damping: 30,
        mass: 0.8,
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
