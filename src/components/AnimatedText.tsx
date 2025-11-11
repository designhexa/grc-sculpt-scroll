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
  const opacity = useTransform(
    scrollProgress,
    [startProgress - 0.1, startProgress, endProgress, endProgress + 0.1],
    [0, 1, 1, 0]
  );

  const getTransform = () => {
    switch (direction) {
      case "left":
        return useTransform(
          scrollProgress,
          [startProgress - 0.1, startProgress, endProgress, endProgress + 0.1],
          [100, 0, 0, -100]
        );
      case "right":
        return useTransform(
          scrollProgress,
          [startProgress - 0.1, startProgress, endProgress, endProgress + 0.1],
          [-100, 0, 0, 100]
        );
      case "up":
        return useTransform(
          scrollProgress,
          [startProgress - 0.1, startProgress, endProgress, endProgress + 0.1],
          [60, 0, 0, -60]
        );
      case "down":
        return useTransform(
          scrollProgress,
          [startProgress - 0.1, startProgress, endProgress, endProgress + 0.1],
          [-60, 0, 0, 60]
        );
    }
  };

  const transform = getTransform();

  return (
    <motion.div
      style={{
        opacity,
        [direction === "left" || direction === "right" ? "x" : "y"]: transform,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
