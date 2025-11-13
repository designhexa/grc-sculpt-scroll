import { motion, useTransform, MotionValue } from "framer-motion";
import ornamentImage from "@/assets/grc-ornament.jpg";

interface AnimatedProductCardProps {
  scrollProgress: MotionValue<number>;
}

export const AnimatedProductCard = ({ scrollProgress }: AnimatedProductCardProps) => {
  // X positioning - smooth movement across sections
  const x = useTransform(
    scrollProgress,
    [0, 0.08, 0.23, 0.25, 0.27, 0.48, 0.5, 0.52, 0.73, 0.75, 0.77, 0.92, 1.0],
    ["0vw", "0vw", "0vw", "-18vw", "-18vw", "-18vw", "18vw", "18vw", "18vw", "0vw", "0vw", "0vw", "0vw"]
  );

  // Y positioning - smooth entrance and exit with proper centering
  const y = useTransform(
    scrollProgress,
    [0, 0.04, 0.08, 0.92, 0.96, 1.0],
    ["120vh", "60vh", "0vh", "0vh", "60vh", "120vh"]
  );

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
