import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AudioUploadProps {
  onUploadComplete: (sessionId: string) => void;
}

export const AudioUpload = ({ onUploadComplete }: AudioUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to upload audio",
          variant: "destructive",
        });
        return;
      }

      // Upload to storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("audio-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create session in database
      const { data: session, error: sessionError } = await supabase
        .from("audio_sessions")
        .insert({
          user_id: user.id,
          original_file_path: filePath,
          status: "uploaded",
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      toast({
        title: "Upload successful",
        description: "Your audio file is ready for analysis",
      });

      onUploadComplete(session.id);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <Card
      className={`p-12 border-2 border-dashed transition-all ${
        dragActive ? "border-primary bg-primary/5" : "border-muted"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        {uploading ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Uploading your audio file...</p>
          </>
        ) : (
          <>
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Upload Audio Recording</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop your audio file here, or click to browse
              </p>
            </div>
            <Button asChild variant="outline">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleChange}
                  className="hidden"
                />
                Choose File
              </label>
            </Button>
            <p className="text-xs text-muted-foreground">
              Supported formats: MP3, WAV, M4A, OGG
            </p>
          </>
        )}
      </div>
    </Card>
  );
};
