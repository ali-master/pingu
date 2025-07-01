import { useStdout } from "ink";
import type { ResponsiveLayout } from "../components/dual-progress-bars";

export const useResponsiveLayout = (): ResponsiveLayout => {
  const { stdout } = useStdout();
  const terminalWidth = isNaN(stdout?.columns) ? 80 : (stdout?.columns ?? 80);

  return {
    isNarrow: terminalWidth < 60,
    isWide: terminalWidth >= 120,
    isMedium: terminalWidth >= 80 && terminalWidth < 120,
    width: terminalWidth,
    contentWidth: Math.max(40, Math.min(terminalWidth - 4, 100)),
    dualColumnWidth: Math.floor((terminalWidth - 8) / 2),
  };
};
