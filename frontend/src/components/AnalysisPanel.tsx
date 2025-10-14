import { Card } from "@/components/ui/card";
import { Activity, AlertCircle, CheckCircle } from "lucide-react";

const mockAnalysis = {
  summary: "Audio analysis completed. Identified 3 distinct audio layers with clear separation.",
  findings: [
    {
      type: "success",
      title: "Primary Voice Detected",
      description: "Clear male voice identified in the main channel. Speech clarity: 92%",
    },
    {
      type: "warning",
      title: "Background Interference",
      description: "Low-level ambient noise detected. Traffic sounds approximately 200m away.",
    },
    {
      type: "info",
      title: "Additional Audio Layers",
      description: "Multiple overlapping conversations detected in background at reduced volume.",
    },
  ],
};

export const AnalysisPanel = () => {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">AI Analysis</h3>
      </div>
      
      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
          <p className="text-foreground leading-relaxed">{mockAnalysis.summary}</p>
        </div>
        
        <div className="space-y-4">
          {mockAnalysis.findings.map((finding, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-secondary/20 border border-border hover:border-primary/50 transition-all"
            >
              <div className="flex items-start gap-3">
                {finding.type === "success" && (
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                )}
                {finding.type === "warning" && (
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                )}
                {finding.type === "info" && (
                  <Activity className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                )}
                
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-1">{finding.title}</h4>
                  <p className="text-sm text-muted-foreground">{finding.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
