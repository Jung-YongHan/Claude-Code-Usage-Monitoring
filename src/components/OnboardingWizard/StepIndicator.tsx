interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <div
            key={step}
            className={`w-2 h-2 rounded-full transition-colors ${
              isActive
                ? "bg-blue-500"
                : isCompleted
                  ? "bg-blue-400"
                  : "bg-slate-600"
            }`}
          />
        );
      })}
    </div>
  );
}
