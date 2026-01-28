import { useEffect } from "react";
import { LayoutGrid, ChevronRight } from "lucide-react";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import type { LayoutType } from "../../services/types";
import { getUsageColor, getUsageColorClass } from "../../utils/colors";

interface LayoutSettingsStepProps {
  selectedLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  onNext: () => void;
}

// Dummy data for preview
const DUMMY_DATA = {
  five_hour: { utilization: 35, label: "5H" },
  seven_day: { utilization: 62, label: "7D" },
  sonnet: { utilization: 48, label: "SNT" },
};

const LAYOUTS: Array<{
  type: LayoutType;
  title: string;
  description: string;
}> = [
  {
    type: "simple",
    title: "심플",
    description: "간단한 텍스트 기반 사용량 표시",
  },
  {
    type: "detailed",
    title: "상세",
    description: "카드와 프로그레스 바로 상세 표시",
  },
];

function SimplePreview() {
  const items = [
    { label: DUMMY_DATA.five_hour.label, value: DUMMY_DATA.five_hour.utilization },
    { label: DUMMY_DATA.seven_day.label, value: DUMMY_DATA.seven_day.utilization },
    { label: DUMMY_DATA.sonnet.label, value: DUMMY_DATA.sonnet.utilization },
  ];

  return (
    <div className="bg-slate-900 rounded-lg p-2 border border-slate-700">
      <div className="space-y-0.5 font-mono text-[10px] font-bold tracking-tight">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-slate-400 w-5">{item.label}</span>
            <span style={{ color: getUsageColor(item.value) }}>
              {item.value.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailedPreview() {
  const items = [
    { title: "5-Hour", value: DUMMY_DATA.five_hour.utilization },
    { title: "7-Day", value: DUMMY_DATA.seven_day.utilization },
    { title: "Sonnet", value: DUMMY_DATA.sonnet.utilization },
  ];

  return (
    <div className="bg-slate-900 rounded-lg p-2 border border-slate-700 space-y-1.5">
      {items.map((item) => (
        <div
          key={item.title}
          className="bg-slate-800/50 rounded p-1.5 border border-slate-700/50"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-medium text-slate-300">{item.title}</span>
            <span
              className="text-[9px] font-bold"
              style={{ color: getUsageColor(item.value) }}
            >
              {item.value}%
            </span>
          </div>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${getUsageColorClass(item.value)} rounded-full transition-all`}
              style={{ width: `${Math.min(item.value, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LayoutSettingsStep({
  selectedLayout,
  onLayoutChange,
  onNext,
}: LayoutSettingsStepProps) {
  // Adjust window height
  useEffect(() => {
    const adjustHeight = async () => {
      const win = getCurrentWindow();
      await win.setSize(new LogicalSize(380, 620));
    };
    adjustHeight();
  }, []);

  return (
    <div className="px-5 py-6 flex flex-col h-full justify-center">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
          <LayoutGrid className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-200">
            레이아웃 선택
          </h2>
          <p className="text-xs text-slate-400">
            원하는 오버레이 스타일을 선택하세요
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {LAYOUTS.map((layout) => (
          <button
            key={layout.type}
            onClick={() => onLayoutChange(layout.type)}
            className={`w-full p-3 rounded-lg text-left transition-all ${
              selectedLayout === layout.type
                ? "bg-purple-600/20 border-2 border-purple-500"
                : "bg-slate-800/50 border-2 border-slate-700 hover:border-slate-600"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedLayout === layout.type
                    ? "border-purple-500"
                    : "border-slate-500"
                }`}
              >
                {selectedLayout === layout.type && (
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                )}
              </div>
              <span className="text-sm font-medium text-slate-200">
                {layout.title}
              </span>
              {layout.type === "simple" && (
                <span className="text-xs text-slate-500 ml-auto">권장</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 ml-6 mt-1">
              {layout.description}
            </p>

            {/* Live Preview */}
            <div className="mt-3 ml-6 pointer-events-none">
              {layout.type === "simple" ? <SimplePreview /> : <DetailedPreview />}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-1 px-4 py-3 text-sm bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-medium"
        >
          다음
          <ChevronRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-slate-500 text-center">
          나중에 설정에서 변경할 수 있습니다
        </p>
      </div>
    </div>
  );
}
