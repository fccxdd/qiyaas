'use client';

import { useState, useCallback } from 'react';

interface TutorialStep {
  id: number;
  title: string;
  content: string;
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
    if (isLast) {
      setVisible(false);
      onComplete?.();
    } else {
      transitionTo(currentStep + 1);
    }
  }, [isLast, currentStep, transitionTo, onComplete]);

  const handleBack = useCallback(() => {
    if (!isFirst) transitionTo(currentStep - 1);
  }, [isFirst, currentStep, transitionTo]);

  // Hide button — fires onComplete so tutorialDismissed is set
  const handleCollapse = useCallback(() => {
    setCollapsed(true);
    onComplete?.();
  }, [onComplete]);

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
    <div className="w-full px-4 py-2 flex justify-center">

      <div className="w-full max-w-[260px] sm:max-w-[350px] flex flex-col gap-2 sm:gap-3 rounded-xl bg-gray-50 backdrop-blur-sm p-2 sm:p-3">

        {/* Collapse button */}
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

        {/* Content block */}
        <div className={`flex flex-col items-center gap-1.5 transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
          {step.title && (
            <h3 className="text-black font-bold text-[clamp(0.875rem,3.8vw,1rem)] text-center leading-snug">
              <RichText html={step.title} />
            </h3>
          )}
          {step.content && (
            <p className="text-black text-[clamp(0.8125rem,3.2vw,0.9375rem)] text-center leading-relaxed whitespace-pre-line">
              <RichText html={step.content} />
            </p>
          )}
        </div>

        <div className="flex flex-row items-center gap-2">
          {!isFirst && (
            <button
              onClick={handleBack}
              className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-purple-700 text-purple-400 text-[0.6875rem] sm:text-xs font-semibold hover:bg-purple-900/30 transition-colors"
            >
              ← Back
            </button>
          )}

          <button
            onClick={handleNext}
            className="ml-auto px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[0.6875rem] sm:text-xs font-bold tracking-wide transition-colors bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
          >
            {isLast ? 'Done ✓' : 'Next →'}
          </button>
        </div>

      </div>
    </div>
  );
}