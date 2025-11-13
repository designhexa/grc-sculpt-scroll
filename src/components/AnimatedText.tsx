import { motion, useTransform, MotionValue } from "framer-motion";

interface AnimatedTextProps {
  children: React.ReactNode;
  scrollProgress: MotionValue<number>;
  startProgress: number;
  endProgress: number;
  direction?: "left" | "right" | "up" | "down";
  className?: string;
}

export const AnimatedText = ({
  children,
  scrollProgress,
  startProgress,
  endProgress,
  direction = "up",
  className = "",
}: AnimatedTextProps) => {
  // Enhanced opacity with smoother transitions
  const opacity = useTransform(
    scrollProgress,
    [startProgress - 0.15, startProgress - 0.05, startProgress + 0.05, endProgress - 0.05, endProgress + 0.05, endProgress + 0.15],
    [0, 0, 1, 1, 0, 0]
  );

  // Enhanced blur effect for depth
  const blur = useTransform(
    scrollProgress,
    [startProgress - 0.15, startProgress - 0.05, startProgress + 0.05, endProgress - 0.05, endProgress + 0.05],
    [10, 5, 0, 0, 5]
  );

  // Dynamic scale for emphasis
  const scale = useTransform(
    scrollProgress,
    [startProgress - 0.15, startProgress - 0.05, startProgress + 0.05, endProgress - 0.05, endProgress + 0.05],
    [0.85, 0.95, 1, 1, 0.95]
  );

  const getTransform = () => {
    switch (direction) {
      case "left":
        return useTransform(
          scrollProgress,
          [startProgress - 0.15, startProgress - 0.05, startProgress + 0.05, endProgress - 0.05, endProgress + 0.05, endProgress + 0.15],
          [150, 80, 0, 0, -80, -150]
        );
      case "right":
        return useTransform(
          scrollProgress,
          [startProgress - 0.15, startProgress - 0.05, startProgress + 0.05, endProgress - 0.05, endProgress + 0.05, endProgress + 0.15],
          [-150, -80, 0, 0, 80, 150]
        );
      case "up":
        return useTransform(
          scrollProgress,
          [startProgress - 0.15, startProgress - 0.05, startProgress + 0.05, endProgress - 0.05, endProgress + 0.05, endProgress + 0.15],
          [100, 50, 0, 0, -50, -100]
        );
      case "down":
        return useTransform(
          scrollProgress,
          [startProgress - 0.15, startProgress - 0.05, startProgress + 0.05, endProgress - 0.05, endProgress + 0.05, endProgress + 0.15],
          [-100, -50, 0, 0, 50, 100]
        );
    }
  };

  const transform = getTransform();

  return (
    <motion.div
      style={{
        opacity,
        scale,
        filter: blur.get() ? `blur(${blur.get()}px)` : "blur(0px)",
        [direction === "left" || direction === "right" ? "x" : "y"]: transform,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
