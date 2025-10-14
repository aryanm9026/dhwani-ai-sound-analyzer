import { Card } from "@/components/ui/card";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AudioSegment {
  id: string;
  label: string;
  color: string;
  duration: string;
}

const mockSegments: AudioSegment[] = [
  { id: "1", label: "Main Voice", color: "bg-primary", duration: "2:45" },
  { id: "2", label: "Background Noise", color: "bg-secondary", duration: "3:12" },
  { id: "3", label: "Other Sounds", color: "bg-accent", duration: "1:23" },
];

export const AudioSplitViewer = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const togglePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id);
  };

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-xl font-semibold mb-6 text-foreground">
        Audio Segments
      </h3>
      
      <div className="space-y-4">
        {mockSegments.map((segment) => (
          <div
            key={segment.id}
            className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${segment.color}`} />
                <span className="font-medium text-foreground">{segment.label}</span>
              </div>
              <span className="text-sm text-muted-foreground">{segment.duration}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => togglePlay(segment.id)}
                className="w-10 h-10 p-0"
              >
                {playingId === segment.id ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${segment.color} transition-all duration-300`}
                  style={{ width: playingId === segment.id ? "45%" : "0%" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
