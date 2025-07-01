/**
 * Configuration options for ping analysis
 */
export interface PingAnalysisOptions {
  readonly timeoutThreshold?: number; // ms, default 1000
  readonly jitterThreshold?: number; // ms, default 50
  readonly stabilityThreshold?: number; // percentage, default 95
}
