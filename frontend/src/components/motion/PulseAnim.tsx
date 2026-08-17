import { motion, Variants } from 'framer-motion';

interface PulseAnimProps {
  children: React.ReactNode;
  className?: string;
  scale?: [number, number];
}

const pulseVariants = (scale: [number, number]): Variants => ({
  animate: {
    scale: [scale[0], scale[1], scale[0]],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
});

export default function PulseAnim({
  children,
  className = '',
  scale = [1, 1.1],
}: PulseAnimProps) {
  return (
    <motion.div
      variants={pulseVariants(scale)}
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
}
