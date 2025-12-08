import { motion } from "framer-motion";

interface PuzzleSlotProps {
  isActive: boolean;
  accentColor?: string;
}

export const PuzzleSlot = ({ isActive, accentColor = "hsl(38 65% 55%)" }: PuzzleSlotProps) => {
  return (
    <div className="relative">
      {/* Puzzle outline */}
      <motion.div
        className="relative h-[400px] w-[500px] max-w-[90vw]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: isActive ? 1 : 0.3,
          scale: isActive ? 1 : 0.95,
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Dashed border with animated glow */}
        <div
          className="absolute inset-0 rounded-2xl border-4 border-dashed"
          style={{
            borderColor: accentColor,
            opacity: isActive ? 0.6 : 0.3,
          }}
        />
        
        {/* Corner indicators */}
        <div className="absolute -left-3 -top-3 h-6 w-6 rounded-full" style={{ backgroundColor: accentColor }} />
        <div className="absolute -right-3 -top-3 h-6 w-6 rounded-full" style={{ backgroundColor: accentColor }} />
        <div className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full" style={{ backgroundColor: accentColor }} />
        <div className="absolute -bottom-3 -right-3 h-6 w-6 rounded-full" style={{ backgroundColor: accentColor }} />
        
        {/* Pulsing effect when active */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              border: `2px solid ${accentColor}`,
              boxShadow: `0 0 30px ${accentColor}40`,
            }}
            animate={{
              scale: [1, 1.02, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
        
        {/* Center text placeholder */}
        <div className="flex h-full items-center justify-center">
          <motion.div
            className="text-center"
            animate={{
              opacity: isActive ? 0 : 0.5,
            }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="text-6xl font-bold"
              style={{ color: accentColor, opacity: 0.2 }}
            >
              ?
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
