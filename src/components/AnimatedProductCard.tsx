import { motion, useTransform, MotionValue } from "framer-motion";
import ornamentImage from "@/assets/grc-ornament.jpg";

interface AnimatedProductCardProps {
  scrollProgress: MotionValue<number>;
}

export const AnimatedProductCard = ({ scrollProgress }: AnimatedProductCardProps) => {
  // Section transitions: 0-0.25, 0.25-0.5, 0.5-0.75, 0.75-1.0
  
  // X position (horizontal movement)
  const x = useTransform(
    scrollProgress,
    [0, 0.25, 0.5, 0.75, 1.0],
    ["0%", "-30%", "30%", "0%", "0%"]
  );

  // Y position (vertical movement)
  const y = useTransform(
    scrollProgress,
    [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0],
    ["100%", "0%", "15%", "25%", "35%", "40%", "100%"]
  );

  // Scale
  const scale = useTransform(
    scrollProgress,
    [0, 0.1, 0.5, 0.6, 0.75, 0.9],
    [0.8, 1, 1, 1.1, 1.1, 1]
  );

  // Opacity
  const opacity = useTransform(
    scrollProgress,
    [0, 0.05, 0.1, 0.85, 0.95, 1.0],
    [0, 0.5, 1, 1, 0.5, 0]
  );

  // Rotation for added dynamism
  const rotate = useTransform(
    scrollProgress,
    [0, 0.25, 0.5, 0.75, 1.0],
    [0, -2, 2, 0, 0]
  );

  return (
    <motion.div
      className="pointer-events-none fixed left-1/2 top-1/2 z-50 w-[500px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2"
      style={{
        x,
        y,
        scale,
        opacity,
        rotate,
      }}
    >
      <motion.div
        className="overflow-hidden rounded-2xl bg-white shadow-2xl"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="aspect-[4/3] overflow-hidden">
          <motion.img
            src={ornamentImage}
            alt="Premium GRC Wall Ornament"
            className="h-full w-full object-cover"
            style={{
              scale: useTransform(scrollProgress, [0.5, 0.6], [1, 1.1]),
            }}
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
      </motion.div>
    </motion.div>
  );
};
