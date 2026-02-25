'use client';

import { useState, useCallback } from 'react';

interface TutorialStep {
  id: number;
  title: string;
  content: string;
  waitForAction?: boolean;
}

interface TutorialBoxProps {
  steps: TutorialStep[];
  onComplete?: () => void;
  onStepChange?: (index: number) => void;
  initialStep?: number;
  actionCompleted?: boolean;
  collapsible?: boolean;
  forceCollapsed?: boolean;
}

function RichText({ html }: { html: string }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function TutorialBox({
  steps,
  onComplete,
  onStepChange,
  initialStep = 0,
  actionCompleted = false,
  collapsible = false,
  forceCollapsed = false,
}: TutorialBoxProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const isLocked = !!step?.waitForAction && !actionCompleted;
   const isCollapsed = forceCollapsed || collapsed;

  const transitionTo = useCallback((nextIndex: number) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(nextIndex);
      onStepChange?.(nextIndex);
      setAnimating(false);
    }, 180);
  }, [onStepChange]);

  const handleNext = useCallback(() => {
    if (isLocked) return;
    if (isLast) {
      setVisible(false);
      onComplete?.();
    } else {
      transitionTo(currentStep + 1);
    }
  }, [isLocked, isLast, currentStep, transitionTo, onComplete]);

  const handleBack = useCallback(() => {
    if (!isFirst) transitionTo(currentStep - 1);
  }, [isFirst, currentStep, transitionTo]);

  if (!visible || !step) return null;

  // Collapsed state — show a small pill to reopen
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
    <div className="w-full px-4 py-2">
      <div className="mx-auto w-full max-w-[350px] sm:max-w-[350px] max-w-[260px] rounded-xl bg-gray-50 backdrop-blur-sm p-2 sm:p-3">

        {/* Collapse button */}
        {collapsible && !forceCollapsed && (
          <div className="flex justify-end mb-1">
            <button
              onClick={() => setCollapsed(true)}
              className="text-gray-400 hover:text-gray-600 text-[11px] sm:text-xs transition-colors"
              aria-label="Collapse tutorial"
            >
              Hide ↑
            </button>
          </div>
        )}

        <div className={`transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
          {step.title && (
            <h3 className="text-black font-bold text-[13px] sm:text-[16px] text-center leading-snug mb-1.5">
              <RichText html={step.title} />
            </h3>
          )}
          {step.content && (
            <p className="text-black text-[12px] sm:text-[20px] text-center leading-relaxed whitespace-pre-line">
              <RichText html={step.content} />
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 sm:mt-4 gap-2">
          <div className="flex gap-2 shrink-0">
            {!isFirst && (
              <button
                onClick={handleBack}
                className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-purple-700 text-purple-400 text-[11px] sm:text-xs font-semibold hover:bg-purple-900/30 transition-colors"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isLocked}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold tracking-wide transition-colors ${
                isLocked
                  ? 'bg-purple-950 text-purple-800 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer'
              }`}
            >
              {isLocked ? '...' : isLast ? 'Done ✓' : 'Next →'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}