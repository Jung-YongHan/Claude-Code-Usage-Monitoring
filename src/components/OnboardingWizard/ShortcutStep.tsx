import { ShortcutSettings } from "../ShortcutSettings/ShortcutSettings";

interface ShortcutStepProps {
  platformName: string;
  onComplete: (modifier: string, key: string) => void | Promise<void>;
}

export function ShortcutStep({ platformName, onComplete }: ShortcutStepProps) {
  return (
    <ShortcutSettings
      platformName={platformName}
      onNext={onComplete}
    />
  );
}
