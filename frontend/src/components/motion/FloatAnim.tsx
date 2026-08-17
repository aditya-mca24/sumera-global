import { motion, Variants } from 'framer-motion';

interface FloatAnimProps {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  duration?: number;
}

const floatVariants = (distance: number, duration: number): Variants => ({
  animate: {
    y: [0, -distance, 0],
    transition: {
      duration,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
});

export default function FloatAnim({
  children,
  className = '',
  distance = 10,
  duration = 3,
}: FloatAnimProps) {
  return (
    <motion.div
      variants={floatVariants(distance, duration)}
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
}
