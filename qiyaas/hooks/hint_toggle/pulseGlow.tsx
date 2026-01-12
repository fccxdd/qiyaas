"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { GameConfig } from '@/lib/gameConfig';

interface PulseGlowProps {
	enabled?: boolean;
	onInteraction?: () => void;
	children: ReactNode;
	className?: string;
	style?: React.CSSProperties;
}

const PulseGlow: React.FC<PulseGlowProps> = ({ 
	enabled = true,
	onInteraction,
	children,
	className = '',
	style = {}
}) => {
	const [shouldPulse, setShouldPulse] = useState(false);
	const [hasInteracted, setHasInteracted] = useState(false);

	const handleInteraction = () => {
		// Always allow interaction - enabled only controls pulsing, not clickability
		setHasInteracted(true);
		setShouldPulse(false);
		
		if (onInteraction) {
			onInteraction();
		}
	};

	// Trigger pulse animation repeatedly: repeat
	useEffect(() => {
		if (enabled && !hasInteracted) {
			let pulseInterval: NodeJS.Timeout;
			
			// Initial delay before first pulse
			const initialTimer = setTimeout(() => {
				setShouldPulse(true);
				
				// Turn off after pulse duration
				setTimeout(() => setShouldPulse(false), GameConfig.duration.hintToggleDuration);
				
				// Set up repeating cycle:
				pulseInterval = setInterval(() => {
					setShouldPulse(true);
					setTimeout(() => setShouldPulse(false), GameConfig.duration.hintToggleDuration);
				}, GameConfig.duration.hintToggleDelay + GameConfig.duration.hintToggleDuration);
				
			}, GameConfig.duration.hintToggleDelay);
			
			return () => {
				clearTimeout(initialTimer);
				clearInterval(pulseInterval);
			};
		} else {
			setShouldPulse(false);
		}
	}, [enabled, hasInteracted]);

	// Reset interaction state when enabled changes
	useEffect(() => {
		if (!enabled) {
			setHasInteracted(false);
			setShouldPulse(false);
		}
	}, [enabled]);

	return (
		<span 
			onClick={handleInteraction}
			className={`${className} ${shouldPulse ? 'animate-pulse-glow' : ''}`}
			style={{
				...style,
				animationDuration: shouldPulse ? `${GameConfig.duration.hintToggleDuration}ms` : undefined
			}}
		>
			{children}
		</span>
	);
};

export default PulseGlow;