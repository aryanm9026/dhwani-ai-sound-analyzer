import React, { useState, useRef, useEffect } from 'react';
import { AudioUploader } from "@/components/AudioUploader";
import { AudioSplitViewer } from "@/components/AudioSplitViewer";
import { useNavigate } from "react-router-dom";
import { Headphones } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d={path} />
  </svg>
);

const HeadphonesIcon = () => <Icon path="M3 12h2.586l1.707-1.707a1 1 0 011.414 0l1.586 1.586a1 1 0 010 1.414l-1.586 1.586a1 1 0 01-1.414 0L5.586 13H3a1 1 0 01-1-1v- hükümetinin(Turkish for government)1a1 1 0 011-1zm18 0h-2.586l-1.707 1.707a1 1 0 01-1.414 0l-1.586-1.586a1 1 0 010-1.414l1.586-1.586a1 1 0 011.414 0L18.414 11H21a1 1 0 011 1v1a1 1 0 01-1 1zM4 5a3 3 0 013-3h1a3 3 0 013 3v14a3 3 0 01-3 3H7a3 3 0 01-3-3V5zm13 0a3 3 0 013-3h1a3 3 0 013 3v14a3 3 0 01-3 3h-1a3 3 0 01-3-3V5z" />;
const UploadIcon = () => <Icon path="M9 16h6v-6h4l-8-8-8 8h4v6zm-4 2h14v2H5v-2z" />;
const FileIcon = () => <Icon path="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z" />;
const PlayIcon = () => <Icon path="M8 5v14l11-7z" />;
const PauseIcon = () => <Icon path="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />;
const Volume2Icon = () => <Icon path="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />;
const ActivityIcon = () => <Icon path="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />;
const CheckCircleIcon = () => <Icon path="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />;
const AlertCircleIcon = () => <Icon path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />;
const MessageSquareIcon = () => <Icon path="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />;
const SendIcon = () => <Icon path="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />;
const LoaderIcon = () => <Icon path="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" className="w-12 h-12 animate-spin text-zinc-400" />;



const getGeminiAnalysis = async (base64Audio, mimeType, chatHistory = [], userQuestion = null, initialAnalysis = null) => {
  const backendUrl = '/api/analyze';

  // Format chat history for the API - convert to Gemini format
  const formattedChatHistory = chatHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const payload = {
    audioData: {
      base64: base64Audio,
      mimeType: mimeType
    },
    chatHistory: formattedChatHistory,
    userQuestion: userQuestion,
    initialAnalysis: initialAnalysis
  };

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // --- 1. Handle non-successful responses first ---
    if (!response.ok) {
      let errorMsg = `Request to backend failed with status ${response.status}`;
      try {
        // Try to parse the error response as JSON, as it might contain a specific message.
        const errorBody = await response.json();
        // Use the server's error message if it exists, otherwise stick with our default.
        errorMsg = errorBody.error || errorMsg;
      } catch (e) {
        // This catch block runs if response.json() fails (e.g., empty or HTML response).
        // The original errorMsg is the perfect fallback.
        console.warn("Could not parse error response body as JSON.");
      }
      // Throw the error to be caught by the main catch block.
      throw new Error(errorMsg);
    }

    // --- 2. Handle the successful response ---
    // If we get here, response.ok is true, and we can safely parse the body ONCE.
    const result = await response.json();

    // --- 3. Safely access the nested result text ---
    // Optional chaining (?.) prevents errors if any part of the chain is null or undefined.
    const analysisText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (analysisText) {
      return analysisText;
    }

    // Handle cases where the analysis text is missing but there's a reason.
    const finishReason = result?.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
      return `Analysis stopped by the API. Reason: ${finishReason}.`;
    }

    // Default message if no content and no specific finish reason.
    return "Analysis could not be completed. The model did not return valid content.";

  } catch (error) {
    console.error("Failed to communicate with the backend server:", error);
    return `Error: Could not retrieve analysis. ${error.message}`;
  }

};

const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950';
  const variantClasses = {
    primary: 'bg-zinc-800 text-white hover:bg-zinc-700 focus:ring-zinc-600',
    outline: 'border border-zinc-700 text-zinc-300 bg-zinc-900 hover:bg-zinc-800 focus:ring-zinc-600',
    ghost: 'text-zinc-400 hover:bg-zinc-800 focus:ring-zinc-600',
  };
  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`p-6 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg ${className}`}>
    {children}
  </div>
);

const Slider = ({ value, max, step, onChange, className = '' }) => (
  <input
    type="range"
    min="0"
    max={max}
    step={step}
    value={value}
    onChange={(e) => onChange([parseFloat(e.target.value)])}
    className={`w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer ${className}`}
  />
);

const AudioPlayer = ({ title, audioUrl, trackType }) => {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const audioRef = useRef(null);

  const trackColorClasses = {
    main: "border-zinc-500",
    background: "border-zinc-700",
    noise: "border-zinc-700",
    default: "border-zinc-700",
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => setPlaying(false);
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume / 100; }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(!playing);
  };

  const handleSeek = (value) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const formatTime = (time) => {
    if (isNaN(time) || time === 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className={`p-4 border-l-4 bg-zinc-900 ${trackColorClasses[trackType] || trackColorClasses.default}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-zinc-100">{title}</h4>
          {trackType && <span className="text-xs px-2 py-1 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300 capitalize">{trackType}</span>}
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={togglePlay} className="h-12 w-12 p-0 bg-zinc-950 text-white hover:bg-zinc-800">
            {playing ? <PauseIcon /> : <PlayIcon />}
          </Button>
          <div className="flex-1 space-y-1">
            <Slider value={[currentTime]} max={duration} step={0.1} onChange={handleSeek} />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-24">
            <Volume2Icon className="text-zinc-400" />
            <Slider value={[volume]} max={100} step={1} onChange={(v) => setVolume(v[0])} />
          </div>
        </div>
      </div>
    </Card>
  );
};

const AnalysisPanel = ({ analysis, error, isAnalyzing }) => {
  const parseAnalysis = (text) => {
    if (!text) return { summary: '', findings: [] };
    const lines = text.split('\n');
    let summary = '';
    const findings = [];
    let currentFinding = null;

    lines.forEach(line => {
      if (line.startsWith('### ')) {
        if (currentFinding) findings.push(currentFinding);
        currentFinding = { title: line.replace('### ', ''), description: [] };
      } else if (currentFinding) {
        currentFinding.description.push(line);
      } else {
        summary += line + '\n';
      }
    });
    if (currentFinding) findings.push(currentFinding);

    findings.forEach(f => f.description = f.description.join('\n').trim());

    return { summary: summary.trim(), findings };
  };

  const { summary, findings } = parseAnalysis(analysis);

  const getIconForTitle = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('transcription') || lowerTitle.includes('summary')) return <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />;
    if (lowerTitle.includes('events') || lowerTitle.includes('environment')) return <ActivityIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />;
    return <ActivityIcon className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />;
  }

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <ActivityIcon className="text-zinc-300" />
        <h3 className="text-xl font-semibold text-zinc-100">AI Analysis</h3>
      </div>
      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <LoaderIcon />
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-zinc-200">Analyzing Audio...</p>
            <p className="text-sm text-zinc-400">This may take a few moments</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-950 border border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-300">Analysis Failed</h4>
              <p className="text-sm text-red-200 whitespace-pre-wrap">{error}</p>
            </div>
          </div>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {summary && (
            <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
              <p className="text-zinc-200 leading-relaxed whitespace-pre-wrap">{summary}</p>
            </div>
          )}
          <div className="space-y-4">
            {findings.map((finding, index) => (
              <div key={index} className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-zinc-100 mb-1">{finding.title}</h4>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap">{finding.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-zinc-400 py-8">
          <p>Upload an audio file to see the AI analysis.</p>
        </div>
      )}
    </Card>
  );
};

const InvestigatorChat = ({ onNewMessage, chatHistory, isThinking, initialAnalysisDone }) => {
  const [input, setInput] = useState("");
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isThinking])

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isThinking || !initialAnalysisDone) return;
    onNewMessage(input);
    setInput("");
  };

  return (
    <Card className="flex flex-col h-[500px]">
      <div className="flex items-center gap-3 mb-4">
        <MessageSquareIcon className="text-zinc-300" />
        <h3 className="text-xl font-semibold text-zinc-100">Ask the Investigator, Dhwani</h3>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {chatHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-zinc-400">
            <p>{initialAnalysisDone ? "Ask a follow-up question about the audio analysis..." : "Complete the initial analysis to start the chat."}</p>
          </div>
        ) : (
          chatHistory.map((message) => (
            <div key={message.id} className={`p-4 rounded-lg ${message.role === 'user' ? 'bg-zinc-800 border border-zinc-700 ml-8' : 'bg-zinc-850 border border-zinc-700 mr-8'}`}>
              <p className="text-sm text-zinc-200 whitespace-pre-wrap">{message.content}</p>
            </div>
          ))
        )}
        {isThinking && (
          <div className="p-4 rounded-lg bg-zinc-850 border border-zinc-700 mr-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={initialAnalysisDone ? "Ask a question..." : "Analysis needed..."}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 text-zinc-200 placeholder-zinc-500 focus:ring-zinc-600 focus:border-zinc-600"
          disabled={!initialAnalysisDone || isThinking}
        />
        <Button type="submit" className="w-10 h-10 p-0 flex items-center justify-center" disabled={!initialAnalysisDone || isThinking}>
          <SendIcon className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
};

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [initialAnalysisDone, setInitialAnalysisDone] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    } else {
      navigate("/auth");
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setUploadedFile(file);
    setAudioUrl(URL.createObjectURL(file));
    setAnalysisResult("");
    setAnalysisError("");
    setChatHistory([]);
    setIsAnalyzing(true);
    setInitialAnalysisDone(false);

    try {
      const base64Audio = await fileToBase64(file);
      const result = await getGeminiAnalysis(base64Audio, file.type);

      if (result.startsWith('Error:')) {
        setAnalysisError(result);
      } else {
        setAnalysisResult(result);
        setInitialAnalysisDone(true);
      }
    } catch (error) {
      console.error("Analysis process failed:", error);
      setAnalysisError(`An unexpected error occurred during analysis: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewChatMessage = async (userMessage) => {
    if (!uploadedFile || !initialAnalysisDone) return;

    // Add user message to chat history
    const newHistory = [...chatHistory, { id: Date.now(), role: 'user', content: userMessage }];
    setChatHistory(newHistory);
    setIsThinking(true);

    try {
      const base64Audio = await fileToBase64(uploadedFile);
      
      const result = await getGeminiAnalysis(
        base64Audio, 
        uploadedFile.type, 
        newHistory, 
        userMessage,
        analysisResult
      );

      if (result.startsWith('Error:')) {
        setChatHistory(prev => [...prev, { 
          id: Date.now() + 1, 
          role: 'assistant', 
          content: `Sorry, I encountered an error: ${result}` 
        }]);
      } else {
        setChatHistory(prev => [...prev, { 
          id: Date.now() + 1, 
          role: 'assistant', 
          content: result 
        }]);
      }
    } catch (error) {
      console.error("Chat process failed:", error);
      setChatHistory(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: `An unexpected error occurred: ${error.message}` 
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-4xl font-bold text-zinc-100">
                Audio Forensic Investigator
              </h1>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </header>

        <div className="space-y-8">
          <AudioUploader onFileUpload={handleFileUpload} isAnalyzing={isAnalyzing} />

          {uploadedFile && (
            <>
              <AudioPlayer title={uploadedFile.name} audioUrl={audioUrl} trackType="main" />
              <div className="grid md:grid-cols-2 gap-8">
                <AnalysisPanel 
                  analysis={analysisResult} 
                  error={analysisError}
                  isAnalyzing={isAnalyzing}
                />
                <InvestigatorChat
                  onNewMessage={handleNewChatMessage}
                  chatHistory={chatHistory}
                  isThinking={isThinking}
                  initialAnalysisDone={initialAnalysisDone}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;