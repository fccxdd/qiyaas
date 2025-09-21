// TODO: Replace ContentContainer Component with this
"use client";

const ContentContainer = ({ currentStepData }) => {
  return (
    <div className="w-1/2 flex flex-col justify-center text-center px-8">
      {currentStepData.title && (
        <h2 
          className="tutorial-title mb-6"
          dangerouslySetInnerHTML={{ __html: currentStepData.title }}
        />
      )}
      
      <h3 
        className="tutorial-content leading-relaxed"
        dangerouslySetInnerHTML={{ __html: currentStepData.content }}
      />
    </div>
  );