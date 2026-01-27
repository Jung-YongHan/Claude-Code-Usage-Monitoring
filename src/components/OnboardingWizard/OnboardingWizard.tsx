import { useState, useEffect } from "react";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { useAuth } from "../../hooks/useAuth";
import { StepIndicator } from "./StepIndicator";
import { AccountConnectionStep } from "./AccountConnectionStep";
import { ShortcutStep } from "./ShortcutStep";

interface OnboardingWizardProps {
  platformName: string;
  onComplete: (modifier: string, key: string) => Promise<void>;
  centerWindow: () => Promise<void>;
}

export function OnboardingWizard({
  platformName,
  onComplete,
  centerWindow,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const { data: authStatus, isLoading: authLoading, refetch } = useAuth();

  // Adjust window size when entering step 1
  useEffect(() => {
    const adjustSize = async () => {
      if (currentStep === 1) {
        const win = getCurrentWindow();
        await win.setSize(new LogicalSize(380, 380));
        await centerWindow();
      }
      // Step 2 sizing is handled by ShortcutSettings component
    };
    adjustSize();
  }, [currentStep, centerWindow]);

  const handleRetry = () => {
    refetch();
  };

  const handleSkip = () => {
    setCurrentStep(2);
  };

  const handleContinue = () => {
    setCurrentStep(2);
  };

  const handleShortcutComplete = async (modifier: string, key: string) => {
    await onComplete(modifier, key);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="pt-3">
        <StepIndicator currentStep={currentStep} totalSteps={2} />
      </div>

      <div className="flex-1">
        {currentStep === 1 ? (
          <AccountConnectionStep
            authStatus={authStatus}
            isLoading={authLoading}
            onRetry={handleRetry}
            onSkip={handleSkip}
            onContinue={handleContinue}
          />
        ) : (
          <ShortcutStep
            platformName={platformName}
            onComplete={handleShortcutComplete}
          />
        )}
      </div>
    </div>
  );
}
