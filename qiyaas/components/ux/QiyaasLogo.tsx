// qiyaas/components/ux/QiyaasLogo.tsx

"use client"

import React from 'react';
import Image from 'next/image';
import { GameConfig } from '@/lib/gameConfig';

export default function QiyaasLogo() {
  return (
    <div className="relative w-[500px] h-[180px]">
      <style jsx>{`
        .blue-glow {
          animation: pulseGlowBlue 5s ease-in-out infinite;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          display: inline-block;
        }
        .green-glow {
          animation: pulseGlowGreen 5s ease-in-out infinite;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          display: inline-block;
        }
        .pink-glow {
          animation: pulseGlowPink 5s ease-in-out infinite;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          display: inline-block;
        }
        
        .blue-glow-wrapper {
          animation: boxShadowGlowBlue 5s ease-in-out infinite;
          border-radius: 40px;
        }
        .green-glow-wrapper {
          animation: boxShadowGlowGreen 5s ease-in-out infinite;
          border-radius: 40px;
        }
        .pink-glow-wrapper {
          animation: boxShadowGlowPink 5s ease-in-out infinite;
          border-radius: 40px;
        }
        
        /* Box shadow animations for wrappers */
        @keyframes boxShadowGlowBlue {
          0%, 60% {
            box-shadow: 0 0 0px #74A8DC;
          }
          40% {
            box-shadow: 0 0 20px #74A8DC,
                        0 0 30px #74A8DC,
                        0 0 40px #74A8DC,
                        0 0 50px #74A8DC;
          }
          100% {
            box-shadow: 0 0 0px #74A8DC;
          }
        }
        
        @keyframes boxShadowGlowGreen {
          0%, 60% {
            box-shadow: 0 0 0px #6AA84F;
          }
          40% {
            box-shadow: 0 0 20px #6AA84F,
                        0 0 30px #6AA84F,
                        0 0 40px #6AA84F,
                        0 0 50px #6AA84F;
          }
          100% {
            box-shadow: 0 0 0px #6AA84F;
          }
        }
        
        @keyframes boxShadowGlowPink {
          0%, 60% {
            box-shadow: 0 0 0px #E06666;
          }
          40% {
            box-shadow: 0 0 20px #E06666,
                        0 0 30px #E06666,
                        0 0 40px #E06666,
                        0 0 50px #E06666;
          }
          100% {
            box-shadow: 0 0 0px #E06666;
          }
        }
        
        /* Light mode */
        @keyframes pulseGlowBlue {
          0%, 60% { 
            filter: drop-shadow(0 0 0px #74A8DC) brightness(1);
          }
          40% { 
            filter: drop-shadow(0 0 20px #74A8DC) 
                    drop-shadow(0 0 30px #74A8DC) 
                    drop-shadow(0 0 40px #74A8DC) 
                    brightness(1.2);
          }
          100% { 
            filter: drop-shadow(0 0 0px #74A8DC) brightness(1);
          }
        }
        
        @keyframes pulseGlowGreen {
          0%, 60% { 
            filter: drop-shadow(0 0 0px #6AA84F) brightness(1);
          }
          40% { 
            filter: drop-shadow(0 0 20px #6AA84F) 
                    drop-shadow(0 0 30px #6AA84F) 
                    drop-shadow(0 0 40px #6AA84F) 
                    brightness(1.2);
          }
          100% { 
            filter: drop-shadow(0 0 0px #6AA84F) brightness(1);
          }
        }
        
        @keyframes pulseGlowPink {
          0%, 60% { 
            filter: drop-shadow(0 0 0px #E06666) brightness(1);
          }
          40% { 
            filter: drop-shadow(0 0 20px #E06666) 
                    drop-shadow(0 0 30px #E06666) 
                    drop-shadow(0 0 40px #E06666) 
                    brightness(1.2);
          }
          100% { 
            filter: drop-shadow(0 0 0px #E06666) brightness(1);
          }
        }
        
        /* Dark mode - stronger box shadows */
        @media (prefers-color-scheme: dark) {
          @keyframes boxShadowGlowBlue {
            0%, 60% {
              box-shadow: 0 0 0px #74A8DC;
            }
            40% {
              box-shadow: 0 0 30px #74A8DC,
                          0 0 40px #74A8DC,
                          0 0 50px #74A8DC,
                          0 0 60px #74A8DC,
                          0 0 70px #74A8DC,
                          0 0 80px #74A8DC;
            }
            100% {
              box-shadow: 0 0 0px #74A8DC;
            }
          }
          
          @keyframes boxShadowGlowGreen {
            0%, 60% {
              box-shadow: 0 0 0px #6AA84F;
            }
            40% {
              box-shadow: 0 0 30px #6AA84F,
                          0 0 40px #6AA84F,
                          0 0 50px #6AA84F,
                          0 0 60px #6AA84F,
                          0 0 70px #6AA84F,
                          0 0 80px #6AA84F;
            }
            100% {
              box-shadow: 0 0 0px #6AA84F;
            }
          }
          
          @keyframes boxShadowGlowPink {
            0%, 60% {
              box-shadow: 0 0 0px #E06666;
            }
            40% {
              box-shadow: 0 0 30px #E06666,
                          0 0 40px #E06666,
                          0 0 50px #E06666,
                          0 0 60px #E06666,
                          0 0 70px #E06666,
                          0 0 80px #E06666;
            }
            100% {
              box-shadow: 0 0 0px #E06666;
            }
          }
          
          @keyframes pulseGlowBlue {
            0%, 60% { 
              filter: drop-shadow(0 0 0px #74A8DC) brightness(1);
            }
            40% { 
              filter: drop-shadow(0 0 30px #74A8DC) 
                      drop-shadow(0 0 40px #74A8DC) 
                      drop-shadow(0 0 50px #74A8DC) 
                      drop-shadow(0 0 60px #74A8DC) 
                      drop-shadow(0 0 70px #74A8DC) 
                      brightness(1.4);
            }
            100% { 
              filter: drop-shadow(0 0 0px #74A8DC) brightness(1);
            }
          }
          
          @keyframes pulseGlowGreen {
            0%, 60% { 
              filter: drop-shadow(0 0 0px #6AA84F) brightness(1);
            }
            40% { 
              filter: drop-shadow(0 0 30px #6AA84F) 
                      drop-shadow(0 0 40px #6AA84F) 
                      drop-shadow(0 0 50px #6AA84F) 
                      drop-shadow(0 0 60px #6AA84F) 
                      drop-shadow(0 0 70px #6AA84F) 
                      brightness(1.4);
            }
            100% { 
              filter: drop-shadow(0 0 0px #6AA84F) brightness(1);
            }
          }
          
          @keyframes pulseGlowPink {
            0%, 60% { 
              filter: drop-shadow(0 0 0px #E06666) brightness(1);
            }
            40% { 
              filter: drop-shadow(0 0 30px #E06666) 
                      drop-shadow(0 0 40px #E06666) 
                      drop-shadow(0 0 50px #E06666) 
                      drop-shadow(0 0 60px #E06666) 
                      drop-shadow(0 0 70px #E06666) 
                      brightness(1.4);
            }
            100% { 
              filter: drop-shadow(0 0 0px #E06666) brightness(1);
            }
          }
        }
        
        /* Safari/WebKit specific */
        @supports (-webkit-touch-callout: none) {
          @keyframes pulseGlowBlue {
            0%, 60% { 
              -webkit-filter: drop-shadow(0 0 0px #74A8DC) brightness(1);
              filter: drop-shadow(0 0 0px #74A8DC) brightness(1);
            }
            40% { 
              -webkit-filter: drop-shadow(0 0 20px #74A8DC) 
                              drop-shadow(0 0 30px #74A8DC) 
                              drop-shadow(0 0 40px #74A8DC) 
                              brightness(1.2);
              filter: drop-shadow(0 0 20px #74A8DC) 
                      drop-shadow(0 0 30px #74A8DC) 
                      drop-shadow(0 0 40px #74A8DC) 
                      brightness(1.2);
            }
            100% { 
              -webkit-filter: drop-shadow(0 0 0px #74A8DC) brightness(1);
              filter: drop-shadow(0 0 0px #74A8DC) brightness(1);
            }
          }
          
          @keyframes pulseGlowGreen {
            0%, 60% { 
              -webkit-filter: drop-shadow(0 0 0px #6AA84F) brightness(1);
              filter: drop-shadow(0 0 0px #6AA84F) brightness(1);
            }
            40% { 
              -webkit-filter: drop-shadow(0 0 20px #6AA84F) 
                              drop-shadow(0 0 30px #6AA84F) 
                              drop-shadow(0 0 40px #6AA84F) 
                              brightness(1.2);
              filter: drop-shadow(0 0 20px #6AA84F) 
                      drop-shadow(0 0 30px #6AA84F) 
                      drop-shadow(0 0 40px #6AA84F) 
                      brightness(1.2);
            }
            100% { 
              -webkit-filter: drop-shadow(0 0 0px #6AA84F) brightness(1);
              filter: drop-shadow(0 0 0px #6AA84F) brightness(1);
            }
          }
          
          @keyframes pulseGlowPink {
            0%, 60% { 
              -webkit-filter: drop-shadow(0 0 0px #E06666) brightness(1);
              filter: drop-shadow(0 0 0px #E06666) brightness(1);
            }
            40% { 
              -webkit-filter: drop-shadow(0 0 20px #E06666) 
                              drop-shadow(0 0 30px #E06666) 
                              drop-shadow(0 0 40px #E06666) 
                              brightness(1.2);
              filter: drop-shadow(0 0 20px #E06666) 
                      drop-shadow(0 0 30px #E06666) 
                      drop-shadow(0 0 40px #E06666) 
                      brightness(1.2);
            }
            100% { 
              -webkit-filter: drop-shadow(0 0 0px #E06666) brightness(1);
              filter: drop-shadow(0 0 0px #E06666) brightness(1);
            }
          }
          
          @media (prefers-color-scheme: dark) {
            @keyframes pulseGlowBlue {
              0%, 60% { 
                -webkit-filter: drop-shadow(0 0 0px #74A8DC) brightness(1);
                filter: drop-shadow(0 0 0px #74A8DC) brightness(1);
              }
              40% { 
                -webkit-filter: drop-shadow(0 0 30px #74A8DC) 
                                drop-shadow(0 0 40px #74A8DC) 
                                drop-shadow(0 0 50px #74A8DC) 
                                drop-shadow(0 0 60px #74A8DC) 
                                drop-shadow(0 0 70px #74A8DC) 
                                brightness(1.4);
                filter: drop-shadow(0 0 30px #74A8DC) 
                        drop-shadow(0 0 40px #74A8DC) 
                        drop-shadow(0 0 50px #74A8DC) 
                        drop-shadow(0 0 60px #74A8DC) 
                        drop-shadow(0 0 70px #74A8DC) 
                        brightness(1.4);
              }
              100% { 
                -webkit-filter: drop-shadow(0 0 0px #74A8DC) brightness(1);
                filter: drop-shadow(0 0 0px #74A8DC) brightness(1);
              }
            }
            
            @keyframes pulseGlowGreen {
              0%, 60% { 
                -webkit-filter: drop-shadow(0 0 0px #6AA84F) brightness(1);
                filter: drop-shadow(0 0 0px #6AA84F) brightness(1);
              }
              40% { 
                -webkit-filter: drop-shadow(0 0 30px #6AA84F) 
                                drop-shadow(0 0 40px #6AA84F) 
                                drop-shadow(0 0 50px #6AA84F) 
                                drop-shadow(0 0 60px #6AA84F) 
                                drop-shadow(0 0 70px #6AA84F) 
                                brightness(1.4);
                filter: drop-shadow(0 0 30px #6AA84F) 
                        drop-shadow(0 0 40px #6AA84F) 
                        drop-shadow(0 0 50px #6AA84F) 
                        drop-shadow(0 0 60px #6AA84F) 
                        drop-shadow(0 0 70px #6AA84F) 
                        brightness(1.4);
              }
              100% { 
                -webkit-filter: drop-shadow(0 0 0px #6AA84F) brightness(1);
                filter: drop-shadow(0 0 0px #6AA84F) brightness(1);
              }
            }
            
            @keyframes pulseGlowPink {
              0%, 60% { 
                -webkit-filter: drop-shadow(0 0 0px #E06666) brightness(1);
                filter: drop-shadow(0 0 0px #E06666) brightness(1);
              }
              40% { 
                -webkit-filter: drop-shadow(0 0 30px #E06666) 
                                drop-shadow(0 0 40px #E06666) 
                                drop-shadow(0 0 50px #E06666) 
                                drop-shadow(0 0 60px #E06666) 
                                drop-shadow(0 0 70px #E06666) 
                                brightness(1.4);
                filter: drop-shadow(0 0 30px #E06666) 
                        drop-shadow(0 0 40px #E06666) 
                        drop-shadow(0 0 50px #E06666) 
                        drop-shadow(0 0 60px #E06666) 
                        drop-shadow(0 0 70px #E06666) 
                        brightness(1.4);
              }
              100% { 
                -webkit-filter: drop-shadow(0 0 0px #E06666) brightness(1);
                filter: drop-shadow(0 0 0px #E06666) brightness(1);
              }
            }
          }
        }
      `}</style>
      
      {/* Background shapes layer */}
      <div className="absolute inset-0 flex items-center justify-center -space-x-4">
        
        {/* Blue - Left */}
        <div className="w-[150px] h-[150px] blue-glow-wrapper">
          <Image 
            src="/qiyaas_logo/blue_rectangle.svg" 
            alt="blue-rectangle" 
            width={150} 
            height={150}
            className="w-full h-full blue-glow"
          />
        </div>
        
        {/* Green - Middle */}
        <div className="w-[150px] h-[150px] green-glow-wrapper">
          <Image 
            src="/qiyaas_logo/green_rectangle.svg" 
            alt="green-rectangle" 
            width={150} 
            height={150}
            className="w-full h-full green-glow"
          />
        </div>
        
        {/* Pink - Right */}
        <div className="w-[150px] h-[150px] pink-glow-wrapper">
          <Image 
            src="/qiyaas_logo/pink_rectangle.svg" 
            alt="pink-rectangle" 
            width={150} 
            height={150}
            className="w-full h-full pink-glow"
          />
        </div>
      </div>
      
      {/* Text overlay - centered on top */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Image 
          src="/qiyaas_logo/qiyaas_text.svg" 
          alt="qiyaas-text" 
          width={450} 
          height={150}
          className="w-[450px] h-auto"
        />
      </div>
    </div>
  );
}