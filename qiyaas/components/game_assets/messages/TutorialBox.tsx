// components/game_assets/messages/TutorialBox.tsx

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSound } from '@/hooks/audio/useSound';

interface TutorialStep {
  id: number;
  title: string;
  content: string;
  spotlight?: string[] | null;
  requiresAction?: boolean;
  noBack?: boolean;
}

interface TutorialBoxProps {
  steps: TutorialStep[];
  onComplete?: () => void;
  onBackFromDone?: () => void;
  onStepChange?: (index: number) => void;
  onSpotlightChange?: (spotlight: string[] | null) => void;
  initialStep?: number;
  actionCompleted?: Record<number, boolean>;
  onActionComplete?: (stepId: number) => number | null;
  backOverride?: Record<number, number>;
  nextOverride?: Record<number, number>;
  stepOverrides?: Record<number, Partial<TutorialStep>>;
  message?: string | null;
  messagePersist?: boolean;
  onMessageDismiss?: () => void;
  ready?: boolean;
  collapsible?: boolean;
  forceCollapsed?: boolean;
}

function RichText({ html }: { html: string }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function TutorialBox({
  steps,
  onComplete,
  onBackFromDone,
  onStepChange,
  onSpotlightChange,
  initialStep = 0,
  actionCompleted = {},
  onActionComplete,
  backOverride = {},
  nextOverride = {},
  stepOverrides = {},
  message = null,
  messagePersist = false,
  onMessageDismiss,
  ready = true,
  collapsible = false,
  forceCollapsed = false,
}: TutorialBoxProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(true);
  const [done, setDone] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [consumedActionStepIds, setConsumedActionStepIds] = useState<Set<number>>(new Set());
  const [visibleMessage, setVisibleMessage] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!message) {
      setVisibleMessage(null);
      return;
    }
    setVisibleMessage(message);
    if (messagePersist) return;
    const t = setTimeout(() => {
      setVisibleMessage(null);
      onMessageDismiss?.();
    }, 2000);
    return () => clearTimeout(t);
  }, [message, messagePersist]);

  // Clear persisted messages once gameStarted (step 19 action) completes
  useEffect(() => {
    if (actionCompleted[19]) setVisibleMessage(null);
  }, [actionCompleted[19]]);

  const rawStep = steps[currentStep];
  const step = rawStep ? { ...rawStep, ...stepOverrides[rawStep.id] } : rawStep;
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const isCollapsed = forceCollapsed || collapsed;
  const isActionPending = !!step?.requiresAction && !consumedActionStepIds.has(step?.id ?? -1);
  const isCurrentActionCompleted = step ? !!actionCompleted[step.id] : false;

  const playSpotlight = useSound('/match_lighting_candle_sound_effect.mp3', 0.5);

  const transitionTo = useCallback((nextIndex: number) => {
    setAnimating(true);
    if (steps[nextIndex]?.spotlight) playSpotlight();
    setTimeout(() => {
      setCurrentStep(nextIndex);
      onStepChange?.(nextIndex);
      onSpotlightChange?.(steps[nextIndex]?.spotlight ?? null);
      setAnimating(false);
    }, 180);
  }, [onStepChange, onSpotlightChange, steps, playSpotlight]);

  // Un-consume when landing on a requiresAction step so it re-arms
  useEffect(() => {
    if (step?.requiresAction) {
      setConsumedActionStepIds(prev => {
        if (!prev.has(step.id)) return prev;
        const next = new Set(prev);
        next.delete(step.id);
        return next;
      });
    }
  }, [currentStep]);

  useEffect(() => {
    if (isCurrentActionCompleted && isActionPending) {
      setConsumedActionStepIds(prev => new Set(prev).add(step.id));
      const targetId = onActionComplete?.(step.id) ?? null;
      if (targetId !== null) {
        const targetIndex = steps.findIndex(s => s.id === targetId);
        if (targetIndex !== -1) {
          transitionTo(targetIndex);
          return;
        }
      }
      transitionTo(currentStep + 1);
    }
  }, [isCurrentActionCompleted, currentStep]);

  const handleNext = useCallback(() => {
    if (isActionPending) return;
    if (step?.id !== undefined && nextOverride[step.id] !== undefined) {
      const targetIndex = steps.findIndex(s => s.id === nextOverride[step.id]);
      if (targetIndex !== -1) { transitionTo(targetIndex); return; }
    }
    if (isLast) {
      onComplete?.();
      if (onBackFromDone) {
        setDone(true);
      } else {
        setVisible(false);
      }
    } else {
      transitionTo(currentStep + 1);
    }
  }, [isLast, isActionPending, currentStep, step, nextOverride, steps, transitionTo, onComplete, onBackFromDone]);

  const handleBack = useCallback(() => {
    if (isFirst) return;
    // Use backOverride if defined for this step
    if (step?.id !== undefined && backOverride[step.id] !== undefined) {
      const targetIndex = steps.findIndex(s => s.id === backOverride[step.id]);
      if (targetIndex !== -1) {
        transitionTo(targetIndex);
        return;
      }
    }
    transitionTo(currentStep - 1);
  }, [isFirst, currentStep, step, backOverride, steps, transitionTo]);

  const handleCollapse = useCallback(() => {
    setCollapsed(true);
    onComplete?.();
  }, [onComplete]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handleBack();
    }
    touchStartX.current = null;
  };

  if (!visible || !step) return null;

  if (done && onBackFromDone) {
    return (
      <div className={`transition-all duration-500 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        <div className="w-full px-4 py-2 flex justify-center">
          <button
            onClick={onBackFromDone}
            className="px-3 py-1.5 rounded-lg border border-purple-700 text-purple-400 text-sm sm:text-[0.6875rem] font-semibold hover:bg-purple-900/30 transition-colors"
          >
            ← Back to tutorial
          </button>
        </div>
      </div>
    );
  }

  if (collapsible && isCollapsed) {
    return (
      <div className="w-full px-4 py-1 flex justify-center">
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600 text-white text-[11px] sm:text-xs font-semibold hover:bg-purple-700 transition-colors shadow-md"
        >
          <span>Tutorial</span>
          <span className="text-purple-200">?</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-500 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
      <div
        className="w-full px-4 py-2 flex justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full max-w-[260px] sm:max-w-[350px] flex flex-col gap-2 sm:gap-3 rounded-xl bg-gray-50 backdrop-blur-sm p-2 sm:p-3">

          {collapsible && !forceCollapsed && (
            <div className="flex justify-end">
              <button
                onClick={handleCollapse}
                className="text-gray-400 hover:text-gray-600 text-[11px] sm:text-xs transition-colors"
                aria-label="Collapse tutorial"
              >
                Hide ↑
              </button>
            </div>
          )}

          <div className={`flex flex-col items-center gap-1.5 transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
            {step.title && (
              <h3 className="text-black font-bold text-[clamp(0.875rem,3.8vw,1rem)] text-center leading-snug">
                <RichText html={step.title} />
              </h3>
            )}
            {step.content && (
              <p className="text-black text-[clamp(0.875rem,3.5vw,1rem)] text-center leading-relaxed whitespace-pre-line">
                <RichText html={step.content} />
              </p>
            )}
            {visibleMessage && (
              <p className="text-red-500 text-[1rem] text-center font-medium mt-1">
                {visibleMessage}
              </p>
            )}
          </div>

          <div className="flex flex-row items-center gap-2">
            {!isFirst && !step?.noBack && (
              <button
                onClick={handleBack}
                className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-purple-700 text-purple-400 text-[0.6875rem] sm:text-xs font-semibold hover:bg-purple-900/30 transition-colors"
              >
                ← Back
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={isActionPending}
              className={`ml-auto px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[0.6875rem] sm:text-xs font-bold tracking-wide transition-colors
                ${isActionPending
                  ? 'bg-purple-300 text-white cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer'
                }`}
            >
              {isLast ? 'Done ✓' : 'Next →'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}