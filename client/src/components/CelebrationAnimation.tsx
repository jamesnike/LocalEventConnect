import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, PartyPopper } from "lucide-react";

interface CelebrationAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

export default function CelebrationAnimation({ isVisible, onComplete }: CelebrationAnimationProps) {
  const [showHearts, setShowHearts] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Show hearts first
      setShowHearts(true);
      
      // Show text after a delay
      setTimeout(() => {
        setShowText(true);
      }, 500);
      
      // Complete animation after 3 seconds
      setTimeout(() => {
        console.log('🎊 CelebrationAnimation calling onComplete');
        onComplete();
      }, 3000);
    } else {
      setShowHearts(false);
      setShowText(false);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div className="relative">
            {/* Flying hearts */}
            <AnimatePresence>
              {showHearts && (
                <>
                  {[...Array(6)].map((_, i) => (
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
                        scale: [0, 1.5, 0.8],
                        x: Math.cos(i * 60 * Math.PI / 180) * 150,
                        y: Math.sin(i * 60 * Math.PI / 180) * 150,
                        rotate: 360
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.1,
                        ease: "easeOut"
                      }}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    >
                      <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Central celebration content */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm mx-4"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <PartyPopper className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              </motion.div>
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-bold text-gray-800 mb-2"
              >
                Congratulations!
              </motion.h2>
              
              <AnimatePresence>
                {showText && (
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="text-gray-600 text-base leading-relaxed"
                  >
                    You have successfully RSVP'd to this event!
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Sparkles */}
              <div className="absolute -top-2 -right-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </motion.div>
              </div>
              
              <div className="absolute -bottom-2 -left-2">
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-pink-400" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}