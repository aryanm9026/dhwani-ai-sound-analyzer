import { useState, useRef } from "react";
import { Upload, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface AudioUploaderProps {
  onFileUpload: (file: File) => void;
}

export const AudioUploader = ({ onFileUpload }: AudioUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      handleFile(file);
    } else {
      toast.error("Please upload an audio file");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    setUploadedFile(file);
    onFileUpload(file);
    toast.success("Audio file uploaded successfully");
  };

  return (
    <Card className="p-8 bg-card border-border">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all border-primary bg-primary/5 scale-102"`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        {uploadedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <File className="w-8 h-10 text-primary" />
              <span className="text-foreground font-medium">{uploadedFile.name}</span>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-emerald-600 hover:bg-white"
            >
              Change File
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-16 h-16 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-foreground">
                Drop your audio file here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-emerald-600 hover:bg-white"
            >
              Select Audio File
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
