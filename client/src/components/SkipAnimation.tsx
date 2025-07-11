import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, ArrowRight } from "lucide-react";

interface SkipAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

export default function SkipAnimation({ isVisible, onComplete }: SkipAnimationProps) {
  const [showEffect, setShowEffect] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Show effect first
      setShowEffect(true);
      
      // Show text after a delay
      setTimeout(() => {
        setShowText(true);
      }, 300);
      
      // Complete animation after 0.5 seconds (much faster for responsive UI)
      setTimeout(() => {
        onComplete();
      }, 500);
    } else {
      setShowEffect(false);
      setShowText(false);
    }
  }, [isVisible]); // Remove onComplete from dependencies to prevent multiple timeouts

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div className="relative">
            {/* Flying X marks */}
            <AnimatePresence>
              {showEffect && (
                <>
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        opacity: 0,
                        scale: 0,
                        x: 0,
                        y: 0,
                        rotate: 0
                      }}
                      animate={{ 
                        opacity: [0, 1, 0],
                        scale: [0, 1.2, 0.6],
                        x: Math.cos(i * 90 * Math.PI / 180) * 100,
                        y: Math.sin(i * 90 * Math.PI / 180) * 100,
                        rotate: 180
                      }}
                      transition={{
                        duration: 1.2,
                        delay: i * 0.1,
                        ease: "easeOut"
                      }}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    >
                      <X className="w-6 h-6 text-red-500" />
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Central skip content */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="bg-white rounded-2xl p-6 shadow-xl text-center max-w-xs mx-4"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.4, repeat: 1 }}
                className="inline-block"
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-red-500" />
                </div>
              </motion.div>
              
              <AnimatePresence>
                {showText && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      Skipped!
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Moving to next event...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Arrow indicating next */}
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-1 -right-1"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}