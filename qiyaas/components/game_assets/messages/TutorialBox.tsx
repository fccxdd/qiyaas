// components/game_assets/messages/TutorialBox.tsx

'use client';

import { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useSound } from '@/hooks/audio/useSound';

export interface TutorialBoxHandle {
  goNext: () => void;
  goToStepId: (id: number) => void;
}

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
  onStepChange?: (index: number, isBack: boolean) => void;
  onSpotlightChange?: (spotlight: string[] | null) => void;
  initialStep?: number;
  nextDisabled?: boolean;
  actionCompleted?: Record<number, boolean>;
  onActionComplete?: (stepId: number) => number | null;
  nextOverride?: Record<number, number>;
  backOverride?: Record<number, number>;
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

const TutorialBox = forwardRef<TutorialBoxHandle, TutorialBoxProps>(function TutorialBox({
  steps,
  onComplete,
  onBackFromDone,
  onStepChange,
  onSpotlightChange,
  initialStep = 0,
  nextDisabled = false,
  actionCompleted = {},
  onActionComplete,
  nextOverride = {},
  backOverride = {},
  stepOverrides = {},
  message = null,
  messagePersist = false,
  onMessageDismiss,
  ready = true,
  collapsible = false,
  forceCollapsed = false,
}: TutorialBoxProps, ref) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(true);
  const [done, setDone] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [visibleMessage, setVisibleMessage] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);

  const historyRef = useRef<number[]>([]);

  const hasAutoAdvanced = useRef<Set<number>>(new Set());
  const transitionToRef = useRef<(nextIndex: number, isBack?: boolean) => void>(() => {});
  const onActionCompleteRef = useRef(onActionComplete);
  onActionCompleteRef.current = onActionComplete;
  const backOverrideRef = useRef(backOverride);
  backOverrideRef.current = backOverride;

  useImperativeHandle(ref, () => ({
    goNext: () => transitionToRef.current(currentStep + 1),
    goToStepId: (id: number) => {
      const idx = steps.findIndex(s => s.id === id);
      if (idx !== -1) transitionToRef.current(idx);
    },
  }));

  const rawStep = steps[currentStep];
  const step = rawStep ? { ...rawStep, ...stepOverrides[rawStep.id] } : rawStep;
  const isLast = currentStep === steps.length - 1;
  const isCollapsed = forceCollapsed || collapsed;

  const isCurrentActionCompleted = step ? !!actionCompleted[step.id] : false;
  const hasActionCompletedEntry = step ? step.id in actionCompleted : false;
  const isActionStepPending = !!step?.requiresAction && hasActionCompletedEntry && !isCurrentActionCompleted;
  const isActionPending = nextDisabled || isActionStepPending;

  const hasBackOverrideForStep = step ? step.id in backOverride : false;
  const canGoBack = !step?.noBack && (hasBackOverrideForStep || historyRef.current.length > 0);

  const playSpotlight = useSound('/match_lighting_candle_sound_effect.mp3', 0.5);

  const transitionTo = useCallback((nextIndex: number, isBack = false) => {
    setAnimating(true);
    if (steps[nextIndex]?.spotlight) playSpotlight();
    setTimeout(() => {
      if (!isBack) {
        const curStep = steps[currentStep];
        if (curStep && !curStep.noBack && !(curStep.id in backOverrideRef.current)) {
          historyRef.current = [...historyRef.current, currentStep];
        }
      }
      setCurrentStep(nextIndex);
      onStepChange?.(nextIndex, isBack);
      onSpotlightChange?.(steps[nextIndex]?.spotlight ?? null);
      setAnimating(false);
    }, 180);
  }, [onStepChange, onSpotlightChange, steps, playSpotlight, currentStep]);
  transitionToRef.current = transitionTo;

  useEffect(() => {
    if (!step?.requiresAction) return;
    if (!isCurrentActionCompleted) return;
    if (hasAutoAdvanced.current.has(step.id)) return;
    hasAutoAdvanced.current.add(step.id);

    const targetId = onActionCompleteRef.current?.(step.id) ?? null;
    if (targetId !== null) {
      const targetIndex = steps.findIndex(s => s.id === targetId);
      if (targetIndex !== -1) { transitionTo(targetIndex); return; }
    }
    transitionTo(currentStep + 1);
  }, [isCurrentActionCompleted, currentStep]);

  useEffect(() => {
    if (!step?.requiresAction) return;
    if (!isCurrentActionCompleted) {
      hasAutoAdvanced.current.delete(step.id);
    }
  }, [currentStep, isCurrentActionCompleted]);

  useEffect(() => {
    if (!message) { setVisibleMessage(null); return; }
    setVisibleMessage(message);
    if (messagePersist) return;
    const t = setTimeout(() => {
      setVisibleMessage(null);
      onMessageDismiss?.();
    }, 2000);
    return () => clearTimeout(t);
  }, [message, messagePersist]);

  useEffect(() => {
    if (actionCompleted[19]) setVisibleMessage(null);
  }, [actionCompleted[19]]);

  const handleNext = useCallback(() => {
    if (isActionPending) return;
    if (step?.id !== undefined && nextOverride[step.id] !== undefined) {
      const targetIndex = steps.findIndex(s => s.id === nextOverride[step.id]);
      if (targetIndex !== -1) { transitionTo(targetIndex); return; }
    }
    if (isLast) {
      onComplete?.();
      if (onBackFromDone) { setDone(true); } else { setVisible(false); }
    } else {
      transitionTo(currentStep + 1);
    }
  }, [isLast, isActionPending, currentStep, step, nextOverride, steps, transitionTo, onComplete, onBackFromDone]);

  const handleBack = useCallback(() => {
    if (!step) return;
    const overrideTargetId = backOverrideRef.current[step.id];
    if (overrideTargetId !== undefined) {
      const targetIndex = steps.findIndex(s => s.id === overrideTargetId);
      if (targetIndex !== -1) { transitionTo(targetIndex, true); return; }
    }
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current[historyRef.current.length - 1];
    historyRef.current = historyRef.current.slice(0, -1);
    transitionTo(prev, true);
  }, [transitionTo, step, steps]);

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
      <div className={`relative z-10 transition-all duration-500 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        <div className="w-full px-4 py-2 flex justify-center">
          <button onClick={onBackFromDone} className="px-3 py-1.5 rounded-lg border border-purple-700 text-purple-400 text-base font-semibold hover:bg-purple-900/30 transition-colors">
            ← Back to tutorial
          </button>
        </div>
      </div>
    );
  }

  if (collapsible && isCollapsed) {
    return (
      <div className="w-full px-4 py-1 flex justify-center">
        <button onClick={() => setCollapsed(false)} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600 text-white text-[11px] sm:text-xs font-semibold hover:bg-purple-700 transition-colors shadow-md">
          <span>Tutorial</span>
          <span className="text-purple-200">?</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-500 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
      <div className="w-full px-4 py-2 flex justify-center" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="tutorial-box w-full max-w-[260px] sm:max-w-[350px] flex flex-col gap-2 sm:gap-3 rounded-xl bg-gray-50 backdrop-blur-sm p-2 sm:p-3">

          {collapsible && !forceCollapsed && (
            <div className="flex justify-end">
              <button onClick={handleCollapse} className="text-gray-400 hover:text-gray-600 text-[11px] sm:text-xs transition-colors" aria-label="Collapse tutorial">
                Hide ↑
              </button>
            </div>
          )}

          <div className={`flex flex-col items-center gap-1.5 transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
            {step.title && (
              <h3 className="text-black font-bold text-[clamp(0.875rem,3.8vw,1.2rem)] text-center leading-snug">
                <RichText html={step.title} />
              </h3>
            )}
            {step.content && (
              <p className="text-black text-[clamp(0.8rem,3.2vw,1.25rem)] text-center leading-relaxed whitespace-pre-line">
                <RichText html={step.content} />
              </p>
            )}
            {visibleMessage && (
              <p className="text-red-500 text-[1rem] text-center font-medium mt-1">{visibleMessage}</p>
            )}
          </div>

          <div className="flex flex-row items-center gap-2">
            {canGoBack && (
              <button onClick={handleBack} className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-purple-700 text-purple-400 text-xs sm:text-sm font-semibold hover:bg-purple-900/30 transition-colors">
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isActionPending}
              className={`ml-auto px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-colors ${isActionPending ? 'bg-purple-300 text-white cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer'}`}
            >
              {isLast ? 'Done ✓' : 'Next →'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
});

export default TutorialBox;