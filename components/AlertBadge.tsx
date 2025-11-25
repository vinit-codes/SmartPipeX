'use client';

import { useSensorStream } from '@/components';
import { motion, AnimatePresence } from 'framer-motion';

export function AlertBadge() {
  const { currentReading } = useSensorStream();

  const hasAlert = currentReading && currentReading.leakDetected;
  const isCritical =
    currentReading &&
    currentReading.waterLoss &&
    currentReading.waterLoss > 1.5;

  if (!hasAlert) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${
          isCritical ? 'bg-red-500' : 'bg-yellow-500'
        }`}
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`h-full w-full rounded-full ${
            isCritical ? 'bg-red-500' : 'bg-yellow-500'
          }`}
        />
      </motion.div>
    </AnimatePresence>
  );
}
