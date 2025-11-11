import { motion } from "framer-motion";
import ornamentImage from "@/assets/grc-ornament.jpg";

interface AnimatedProductCardProps {
  scrollProgress: number;
}

export const AnimatedProductCard = ({ scrollProgress }: AnimatedProductCardProps) => {
  // Calculate position and scale based on scroll progress
  const getCardStyle = () => {
    if (scrollProgress < 0.25) {
      // Section 1: Center
      return {
        x: "0%",
        y: `${Math.max(0, 100 - scrollProgress * 400)}%`,
        scale: 1,
        opacity: Math.min(1, scrollProgress * 4),
      };
    } else if (scrollProgress < 0.5) {
      // Section 2: Move to bottom left
      const localProgress = (scrollProgress - 0.25) / 0.25;
      return {
        x: `${-30 * localProgress}%`,
        y: `${20 * localProgress}%`,
        scale: 1,
        opacity: 1,
      };
    } else if (scrollProgress < 0.75) {
      // Section 3: Move to bottom right with zoom
      const localProgress = (scrollProgress - 0.5) / 0.25;
      return {
        x: `${-30 + 60 * localProgress}%`,
        y: `${20 + 10 * localProgress}%`,
        scale: 1 + 0.15 * localProgress,
        opacity: 1,
      };
    } else {
      // Section 4: Center bottom and fade out
      const localProgress = (scrollProgress - 0.75) / 0.25;
      return {
        x: `${30 - 30 * localProgress}%`,
        y: `${30 + 10 * localProgress}%`,
        scale: 1.15,
        opacity: Math.max(0, 1 - localProgress * 1.5),
      };
    }
  };

  const cardStyle = getCardStyle();

  return (
    <motion.div
      className="fixed left-1/2 top-1/2 z-10 w-[500px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2"
      style={{
        x: cardStyle.x,
        y: cardStyle.y,
        scale: cardStyle.scale,
        opacity: cardStyle.opacity,
      }}
      transition={{
        type: "spring",
        stiffness: 50,
        damping: 20,
      }}
    >
      <div className="overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-elegant)]">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={ornamentImage}
            alt="Premium GRC Wall Ornament"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-6">
          <h3 className="mb-2 text-2xl font-semibold text-foreground">
            Venetian Collection
          </h3>
          <p className="text-muted-foreground">
            Handcrafted GRC wall ornament with classical elegance
          </p>
        </div>
      </div>
    </motion.div>
  );
};
