require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;


app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json({ limit: '50mb' }));

app.post('/api/analyze', async (req, res) => {
    const { audioData, chatHistory, userQuestion } = req.body;

    if (!audioData || !audioData.base64 || !audioData.mimeType) {
        return res.status(400).json({ error: 'Missing audio data' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    let promptParts = [];
    const initialAnalysisPrompt = `You are an expert Audio Forensics Investigator named Dhwani. Your task is to analyze this audio file in extreme detail.
    Provide a comprehensive report in Markdown format with the following sections:
    
    ### Executive Summary
    A brief, one-paragraph overview of the most critical findings.
    
    ### Full Transcription
    Transcribe all speech in the audio. If there are multiple speakers, label them as "Speaker 1", "Speaker 2", etc.
    
    ### Identified Audio Events
    List all non-speech sounds you can identify (e.g., car horn, dog barking, engine noise, specific music, etc.) and their approximate timestamps.
    
    ### Environmental Analysis
    Based on all speech and non-speech sounds, describe the environment where this audio was likely recorded (e.g., "busy street corner," "quiet office," "airport terminal").
    
    ### Speaker Profile (if speech is present)
    Infer details about the speaker(s), such as gender, estimated age, and emotional tone.
    `;

    if (chatHistory.length === 0) {
        promptParts.push({ text: initialAnalysisPrompt });
    } else {
        chatHistory.forEach(msg => {
            promptParts.push({ text: `${msg.role === 'user' ? 'User Question' : 'Previous Analysis'}: ${msg.content}` });
        });
        if (userQuestion) {
            promptParts.push({ text: `Based on the audio and our previous conversation, answer this new question: "${userQuestion}"` });
        }
    }

    const payload = {
        contents: [{
            role: "user",
            parts: [
                ...promptParts,
                {
                    inlineData: {
                        mimeType: audioData.mimeType,
                        data: audioData.base64
                    }
                }
            ]
        }]
    };

    try {
        const googleResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!googleResponse.ok) {
            const errorBody = await googleResponse.text();
            throw new Error(`API Error: ${googleResponse.status} ${googleResponse.statusText} - ${errorBody}`);
        }

        const result = await googleResponse.json();
        res.json(result);

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});