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
  // Smooth opacity transitions
  const opacity = useTransform(
    scrollProgress,
    [startProgress - 0.1, startProgress, endProgress, endProgress + 0.1],
    [0, 1, 1, 0]
  );

  // Dynamic scale for emphasis
  const scale = useTransform(
    scrollProgress,
    [startProgress - 0.1, startProgress, startProgress + 0.05, endProgress - 0.05, endProgress],
    [0.9, 1, 1.02, 1.02, 0.95]
  );

  // Rotation effect for more dynamic movement
  const rotate = useTransform(
    scrollProgress,
    [startProgress - 0.1, startProgress, endProgress, endProgress + 0.1],
    direction === "left" ? [8, 0, 0, -8] : 
    direction === "right" ? [-8, 0, 0, 8] : 
    [0, 0, 0, 0]
  );

  const getTransform = () => {
    switch (direction) {
      case "left":
        return useTransform(
          scrollProgress,
          [startProgress - 0.1, startProgress, endProgress, endProgress + 0.1],
          [120, 0, 0, -120]
        );
      case "right":
        return useTransform(
          scrollProgress,
          [startProgress - 0.1, startProgress, endProgress, endProgress + 0.1],
          [-120, 0, 0, 120]
        );
      case "up":
        return useTransform(
          scrollProgress,
          [startProgress - 0.1, startProgress, endProgress, endProgress + 0.1],
          [80, 0, 0, -80]
        );
      case "down":
        return useTransform(
          scrollProgress,
          [startProgress - 0.1, startProgress, endProgress, endProgress + 0.1],
          [-80, 0, 0, 80]
        );
    }
  };

  const transform = getTransform();

  return (
    <motion.div
      style={{
        opacity,
        scale,
        rotate,
        [direction === "left" || direction === "right" ? "x" : "y"]: transform,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
