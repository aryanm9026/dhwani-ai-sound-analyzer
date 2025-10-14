-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-files', 'audio-files', false);

-- Storage policies for audio files
CREATE POLICY "Users can upload their own audio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own audio files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audio files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create audio sessions table
CREATE TABLE public.audio_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  original_file_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.audio_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
ON public.audio_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
ON public.audio_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create separated tracks table
CREATE TABLE public.separated_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.audio_sessions(id) ON DELETE CASCADE,
  track_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.separated_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tracks from their sessions"
ON public.separated_tracks FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.audio_sessions
    WHERE audio_sessions.id = separated_tracks.session_id
    AND audio_sessions.user_id = auth.uid()
  )
);

-- Create analysis results table
CREATE TABLE public.analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.audio_sessions(id) ON DELETE CASCADE,
  analysis_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analysis from their sessions"
ON public.analysis_results FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.audio_sessions
    WHERE audio_sessions.id = analysis_results.session_id
    AND audio_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create analysis for their sessions"
ON public.analysis_results FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.audio_sessions
    WHERE audio_sessions.id = analysis_results.session_id
    AND audio_sessions.user_id = auth.uid()
  )
);

-- Create investigation chat table
CREATE TABLE public.investigation_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.audio_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.investigation_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chats from their sessions"
ON public.investigation_chats FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.audio_sessions
    WHERE audio_sessions.id = investigation_chats.session_id
    AND audio_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create chats for their sessions"
ON public.investigation_chats FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.audio_sessions
    WHERE audio_sessions.id = investigation_chats.session_id
    AND audio_sessions.user_id = auth.uid()
  )
);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_audio_sessions_updated_at
BEFORE UPDATE ON public.audio_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();