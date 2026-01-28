import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { setWindowSize } from "../../services/tauri-commands";
import type { LayoutType } from "../../services/types";
import { StepIndicator } from "./StepIndicator";
import { AccountConnectionStep } from "./AccountConnectionStep";
import { LayoutSettingsStep } from "./LayoutSettingsStep";
import { ShortcutStep } from "./ShortcutStep";

interface OnboardingWizardProps {
  platformName: string;
  onComplete: (modifier: string, key: string, layoutType: LayoutType) => Promise<void>;
  centerWindow: () => Promise<void>;
}

export function OnboardingWizard({
  platformName,
  onComplete,
  centerWindow,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>("simple");
  const { data: authStatus, isLoading: authLoading, refetch } = useAuth();

  const isConnected = authStatus?.authenticated ?? false;

  // Adjust window size when entering step 1
  useEffect(() => {
    const adjustSize = async () => {
      if (currentStep === 1) {
        // Use smaller height when already connected
        const height = isConnected ? 300 : 380;
        await setWindowSize(380, height);
        await centerWindow();
      }
      // Step 2 (LayoutSettingsStep) and Step 3 (ShortcutSettings) handle their own sizing
    };
    adjustSize();
  }, [currentStep, centerWindow, isConnected]);

  const handleRetry = () => {
    refetch();
  };

  const handleSkip = () => {
    setCurrentStep(2);
  };

  const handleContinue = () => {
    setCurrentStep(2);
  };

  const handleLayoutNext = () => {
    setCurrentStep(3);
  };

  const handleShortcutComplete = async (modifier: string, key: string) => {
    await onComplete(modifier, key, selectedLayout);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AccountConnectionStep
            authStatus={authStatus}
            isLoading={authLoading}
            onRetry={handleRetry}
            onSkip={handleSkip}
            onContinue={handleContinue}
          />
        );
      case 2:
        return (
          <LayoutSettingsStep
            selectedLayout={selectedLayout}
            onLayoutChange={setSelectedLayout}
            onNext={handleLayoutNext}
          />
        );
      case 3:
        return (
          <ShortcutStep
            platformName={platformName}
            onComplete={handleShortcutComplete}
          />
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="pt-3">
        <StepIndicator currentStep={currentStep} totalSteps={3} />
      </div>

      <div className="flex-1">
        {renderStep()}
      </div>
    </div>
  );
}
