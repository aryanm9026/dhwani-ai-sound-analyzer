# Dhwani  ध्वनि 🔊

**An AI-powered audio forensics and investigation platform.**

_Developed for the Smart India Hackathon (SIH) 2025, addressing the Ministry of Defence (MoD) problem statement `SIH25242`: "Deep learning based ALM (Audio Language Model), which Listen, Think, and Understand the speech and non-speech Together."_

---

![Dhwani App Screenshot](https://i.imgur.com/your-screenshot-link.png) 
_Replace with a screenshot of your application's UI._

## 📖 About The Project

Dhwani (Sanskrit: ध्वनि, meaning *sound* or *voice*) is a sophisticated tool designed to bridge the gap between human auditory perception and machine understanding. While traditional AI models can process either speech or non-speech sounds, Dhwani provides a holistic analysis of the entire audio scene.

It leverages the power of Google's multimodal AI to **Listen, Think, and Understand** audio recordings, providing users with a detailed forensic report that includes transcriptions, identified environmental sounds, and contextual inferences. The platform is built for security and usability, featuring a secure authentication system and an interactive chat interface for in-depth investigation.

## ✨ Key Features

* **Comprehensive Analysis:** Generates a full report including a summary, transcription, identified audio events, environmental analysis, and speaker profiles.
* **Full Transcription:** Accurately transcribes spoken content, with support for multiple speakers.
* **Audio Event Detection:** Identifies and lists non-speech sounds like sirens, traffic, alarms, or machinery.
* **Environmental Context:** Infers the likely environment of the recording (e.g., "busy street corner," "quiet office") based on the combination of all sounds.
* **Interactive Investigation:** A chat interface allows users to ask follow-up questions about the audio file for deeper insights.
* **Secure Authentication:** User accounts and data are secured using Supabase for authentication and session management.

## 🛠️ Tech Stack

This project is built with a modern, scalable technology stack:

* **Frontend:**
    * [React](https://reactjs.org/)
    * [Vite](https://vitejs.dev/)
    * [Tailwind CSS](https://tailwindcss.com/)
* **Backend:**
    * [Node.js](https://nodejs.org/)
    * [Express](https://expressjs.com/)

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js and npm installed on your machine.
* `npm install npm@latest -g`

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/dhwani.git](https://github.com/your-username/dhwani.git)
    cd dhwani
    ```

2.  **Setup the Backend:**
    * Navigate to the backend directory:
        ```sh
        cd backend
        ```
    * Install NPM packages:
        ```sh
        npm install
        ```
    * Create a `.env` file in the `backend` folder and add your Google Gemini API key:
        ```
        GEMINI_API_KEY=AIzaSy...
        ```

3.  **Setup the Frontend:**
    * Navigate to the frontend directory (or the root if that's where your `package.json` is):
        ```sh
        cd ../
        ```
    * Install NPM packages:
        ```sh
        npm install
        ```
    * Create a `.env` file in the project root and add your Supabase credentials:
        ```
        VITE_SUPABASE_URL=[https://your-project-url.supabase.co](https://your-project-url.supabase.co)
        VITE_SUPABASE_ANON_KEY=your-public-anon-key
        ```

### Running the Application

1.  **Start the backend server:**
    * In a terminal, navigate to the `backend` directory and run:
    ```sh
    node server.js
    ```
    _Your backend will be running on `http://localhost:3001`._

2.  **Start the frontend development server:**
    * In a **separate** terminal, navigate to the project's root directory and run:
    ```sh
    npm run dev
    ```
    _Open `http://localhost:5173` (or the port specified in your terminal) to view the app in your browser._

## 📋 Usage

1.  Navigate to the application URL.
2.  Create a new account or log in with your existing credentials.
3.  On the main dashboard, upload an audio file (`.mp3`, `.wav`, etc.).
4.  Wait for the initial AI analysis to complete.
5.  Review the detailed report on the left panel.
6.  Use the chat interface on the right to ask follow-up questions like, "Was the speaker in a vehicle?" or "What was the loudest sound in the background?".

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
