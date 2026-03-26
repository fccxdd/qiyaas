'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface QiyaasLogoProps {
  autoPlay?: boolean;
  loop?: boolean;
  onAnimationComplete?: () => void;
  className?: string;
}

const QiyaasLogoAnimated: React.FC<QiyaasLogoProps> = ({
  autoPlay = true,
  loop = false,
  onAnimationComplete,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(autoPlay);
  const [showPulse, setShowPulse] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // Detect Safari/iOS
    const ua = navigator.userAgent;
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(ua) || /iPad|iPhone|iPod/.test(ua);
    setIsSafari(isSafariBrowser);
  }, []);

  useEffect(() => {
    if (!isAnimating) return;

    const animationSequence = [
       { step: 1, duration: 1000 },   // Blue ball moves down
       { step: 2, duration: 1000 },   // Show final with text
    ];

    if (currentStep < animationSequence.length) {
      const timer = setTimeout(() => {
        if (currentStep === animationSequence.length - 1) {
          setShowPulse(true);
          setIsAnimating(false);
          
          if (onAnimationComplete) {
            onAnimationComplete();
          }

          if (loop) {
            setTimeout(() => {
              restartAnimation();
            }, 3000);
          }
        }
        setCurrentStep(currentStep + 1);
      }, animationSequence[currentStep].duration);

      return () => clearTimeout(timer);
    }
  }, [currentStep, isAnimating, loop, onAnimationComplete]);

  const restartAnimation = () => {
    setCurrentStep(1);
    setIsAnimating(true);
    setShowPulse(false);
  };

  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  };

  return (
    <div
      className={`relative ${className}`}
      style={{ width: 'clamp(180px, 20vw, 300px)', height: 'clamp(120px, 13vw, 200px)' }}
    >
      <div className="relative w-full h-full">

        {/* Logo 2 - Blue ball moved down */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${
            currentStep === 1 
              ? 'opacity-100' 
              : 'opacity-0'
          }`}
        >
          <div className={currentStep === 1 ? 'animate-ball-drop' : ''}>
            {isSafari ? (
              <img
                src="/qiyaas_logo/first_frame.png"
                alt="Qiyaas Logo Animation Step 2"
                style={imgStyle}
              />
            ) : (
              <Image
                src="/qiyaas_logo/first_frame.svg"
                alt="Qiyaas Logo Animation Step 2"
                width={300}
                height={300}
                style={imgStyle}
              />
            )}
          </div>
        </div>

        {/* Logo 3 - Final with individual ball glows */}
        <div
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            currentStep >= 2 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
        >
          {/* Glowing balls layer (behind) - disabled on Safari/iOS for crisp rendering */}
          {showPulse && !isSafari && (
            <>
              {/* Blue ball glow */}
              <div className="absolute inset-0 flex items-center justify-center animate-blue-glow-wrapper">
                <Image
                  src="/qiyaas_logo/orbs/blue_orb.svg"
                  alt="Blue Orb Glow"
                  width={300}
                  height={300}
                  style={imgStyle}
                />
              </div>
              
              {/* Green ball glow */}
              <div className="absolute inset-0 flex items-center justify-center animate-green-glow-wrapper">
                <Image
                  src="/qiyaas_logo/orbs/green_orb.svg"
                  alt="Green Orb Glow"
                  width={300}
                  height={300}
                  style={imgStyle}
                />
              </div>
              
              {/* Pink ball glow */}
              <div className="absolute inset-0 flex items-center justify-center animate-pink-glow-wrapper">
                <Image
                  src="/qiyaas_logo/orbs/pink_orb.svg"
                  alt="Pink Orb Glow"
                  width={300}
                  height={300}
                  style={imgStyle}
                />
              </div>
            </>
          )}
          
          {/* Static second_frame on top (no glow) */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isSafari ? (
              <img
                src="/qiyaas_logo/second_frame.png"
                alt="Qiyaas Logo Final"
                style={imgStyle}
              />
            ) : (
              <Image
                src="/qiyaas_logo/second_frame.svg"
                alt="Qiyaas Logo Final"
                width={300}
                height={300}
                style={imgStyle}
              />
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ball-drop {
          0% {
            transform: translateY(-30px);
          }
          60% {
            transform: translateY(0px);
          }
          75% {
            transform: translateY(-5px);
          }
          90% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        .animate-ball-drop {
          animation: ball-drop 1.2s cubic-bezier(0.36, 0, 0.66, -0.56);
        }

        @keyframes ball-drop-safari {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .animate-ball-drop-safari {
          animation: ball-drop-safari 1.2s ease-in-out;
        }

        /* Blue orb - #74A8DC */
        @keyframes blue-neon-glow {
          0% {
            -webkit-filter: drop-shadow(0 0 8px #fff)
                    drop-shadow(0 0 25px #74A8DC);
            filter: drop-shadow(0 0 8px #fff)
                    drop-shadow(0 0 25px #74A8DC);
            opacity: 0.6;
          }
          25% {
            -webkit-filter: drop-shadow(0 0 10px #fff)
                    drop-shadow(0 0 12px #74A8DC)
                    drop-shadow(0 0 30px #74A8DC);
            filter: drop-shadow(0 0 10px #fff)
                    drop-shadow(0 0 12px #74A8DC)
                    drop-shadow(0 0 30px #74A8DC);
            opacity: 0.75;
          }
          50% {
            -webkit-filter: drop-shadow(0 0 15px #fff)
                    drop-shadow(0 0 15px #74A8DC)
                    drop-shadow(0 0 25px #74A8DC);
            filter: drop-shadow(0 0 15px #fff)
                    drop-shadow(0 0 15px #74A8DC)
                    drop-shadow(0 0 25px #74A8DC);
            opacity: 0.9;
          }
          75% {
            -webkit-filter: drop-shadow(0 0 10px #fff)
                    drop-shadow(0 0 12px #74A8DC)
                    drop-shadow(0 0 30px #74A8DC);
            filter: drop-shadow(0 0 10px #fff)
                    drop-shadow(0 0 12px #74A8DC)
                    drop-shadow(0 0 30px #74A8DC);
            opacity: 0.75;
          }
          100% {
            -webkit-filter: drop-shadow(0 0 8px #fff)
                    drop-shadow(0 0 25px #74A8DC);
            filter: drop-shadow(0 0 8px #fff)
                    drop-shadow(0 0 25px #74A8DC);
            opacity: 0.6;
          }
        }

        /* Green orb - #6AA84F */
        @keyframes green-neon-glow {
          0% {
            -webkit-filter: drop-shadow(0 0 8px #fff)
                    drop-shadow(0 0 25px #6AA84F);
            filter: drop-shadow(0 0 8px #fff)
                    drop-shadow(0 0 25px #6AA84F);
            opacity: 0.6;
          }
          25% {
            -webkit-filter: drop-shadow(0 0 10px #fff)
                    drop-shadow(0 0 12px #6AA84F)
                    drop-shadow(0 0 30px #6AA84F);
            filter: drop-shadow(0 0 10px #fff)
                    drop-shadow(0 0 12px #6AA84F)
                    drop-shadow(0 0 30px #6AA84F);
            opacity: 0.75;
          }
          50% {
            -webkit-filter: drop-shadow(0 0 15px #fff)
                    drop-shadow(0 0 15px #6AA84F)
                    drop-shadow(0 0 25px #6AA84F);
            filter: drop-shadow(0 0 15px #fff)
                    drop-shadow(0 0 15px #6AA84F)
                    drop-shadow(0 0 25px #6AA84F);
            opacity: 0.9;
          }
          75% {
            -webkit-filter: drop-shadow(0 0 10px #fff)
                    drop-shadow(0 0 12px #6AA84F)
                    drop-shadow(0 0 30px #6AA84F);
            filter: drop-shadow(0 0 10px #fff)
                    drop-shadow(0 0 12px #6AA84F)
                    drop-shadow(0 0 30px #6AA84F);
            opacity: 0.75;
          }
          100% {
            -webkit-filter: drop-shadow(0 0 8px #fff)
                    drop-shadow(0 0 25px #6AA84F);
            filter: drop-shadow(0 0 8px #fff)
                    drop-shadow(0 0 25px #6AA84F);
            opacity: 0.6;
          }
        }

        /* Pink orb - #E06666 */
        @keyframes pink-neon-glow {
          0% {
            -webkit-filter: drop-shadow(0 0 8px #fff)
                    drop-shadow(0 0 25px #E06666);
            filter: drop-shadow(0 0 8px #fff)
                    drop-shadow(0 0 25px #E06666);
            opacity: 0.6;
          }
          25% {
            -webkit-filter: drop-shadow(0 0 10px #fff)
                    drop-shadow(0 0 12px #E06666)
                    drop-shadow(0 0 30px #E06666);
            filter: drop-shadow(0 0 10px #fff)
                    drop-shadow(0 0 12px #E06666)
                    drop-shadow(0 0 30px #E06666);
            opacity: 0.75;
          }
          50% {
            -webkit-filter: drop-shadow(0 0 15px #fff)
                    drop-shadow(0 0 15px #E06666)
                    drop-shadow(0 0 25px #E06666);
            filter: drop-shadow(0 0 15px #fff)
                    drop-shadow(0 0 15px #E06666)
                    drop-shadow(0 0 25px #E06666);
            opacity: 0.9;
          }
          75% {
            -webkit-filter: drop-shadow(0 0 10px #fff)
                    drop-shadow(0 0 12px #E06666)
                    drop-shadow(0 0 30px #E06666);
            filter: drop-shadow(0 0 10px #fff)
                    drop-shadow(0 0 12px #E06666)
                    drop-shadow(0 0 30px #E06666);
            opacity: 0.75;
          }
          100% {
            -webkit-filter: drop-shadow(0 0 8px #fff)
                    drop-shadow(0 0 25px #E06666);
            filter: drop-shadow(0 0 8px #fff)
                    drop-shadow(0 0 25px #E06666);
            opacity: 0.6;
          }
        }

        .animate-blue-glow-wrapper {
          animation: blue-neon-glow 8s ease-in-out infinite;
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          will-change: filter, opacity;
        }

        .animate-green-glow-wrapper {
          animation: green-neon-glow 8s ease-in-out infinite;
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          will-change: filter, opacity;
        }

        .animate-pink-glow-wrapper {
          animation: pink-neon-glow 8s ease-in-out infinite;
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          will-change: filter, opacity;
        }

        .animate-blue-glow-safari {
          animation: blue-neon-glow 8s ease-in-out infinite;
        }

        .animate-green-glow-safari {
          animation: green-neon-glow 8s ease-in-out infinite;
        }

        .animate-pink-glow-safari {
          animation: pink-neon-glow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default QiyaasLogoAnimated;