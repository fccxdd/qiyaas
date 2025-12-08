// components/game_assets/game_walkthrough/Loading.tsx

"use client"

import React, { useEffect, useState } from 'react';
import { FaSpinner } from "react-icons/fa";
import { GameConfig } from '@/lib/gameConfig';

const Loading = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, GameConfig.duration.tutorialLoadingDelay);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`loading-screen ${isLoading ? 'fade-in' : 'fade-out'}`}>
      <div className="spinner-icon"><FaSpinner/></div>
    </div>
  );
};

export default Loading;
