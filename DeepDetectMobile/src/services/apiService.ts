export type DetectionResult = {
  prediction: string;
  confidence: number;
  message?: string;
  detailedResults?: { label: string; score: number }[];
};
