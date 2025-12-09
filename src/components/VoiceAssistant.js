import React, { useState, useEffect, useRef } from 'react';
import { ML_API_URL } from '../config';



export function VoiceAssistant({ onSOS, className }) {
    const [state, setState] = useState('IDLE'); // IDLE, LISTENING, PROCESSING, RESPONDING
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState(null);
    const [language, setLanguage] = useState('auto');
    const recognitionRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const synthRef = useRef(window.speechSynthesis);
    const silenceTimer = useRef(null);

    // Language Mapping
    const languages = {
        'auto': { name: 'Auto Detect', code: 'auto' },
        'en-US': { name: 'English', code: 'en' },
        'hi-IN': { name: 'Hindi', code: 'hi' },
        'kn-IN': { name: 'Kannada', code: 'kn' },
        'ta-IN': { name: 'Tamil', code: 'ta' },
        'te-IN': { name: 'Telugu', code: 'te' }
    };

    useEffect(() => {
        // Initialize Speech Recognition for Wake Word & Transcript
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = language === 'auto' ? 'en-US' : language;

            recognition.onstart = () => {
                setState('LISTENING');
                startAudioRecording();
            };

            recognition.onresult = (event) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);

                // Reset silence timer on new input
                clearTimeout(silenceTimer.current);

                // Wake Word Detection
                const lowerText = transcriptText.toLowerCase();
                if (state === 'IDLE' && (lowerText.includes('saathi') || lowerText.includes('help'))) {
                    setState('LISTENING');
                }

                // Silence Detection to Auto-Submit (1.5 seconds silence)
                if (state === 'LISTENING' && event.results[current].isFinal) {
                    silenceTimer.current = setTimeout(() => {
                        stopAudioRecordingAndSubmit(transcriptText);
                    }, 1500);
                }
            };

            recognition.onend = () => {
                if (state === 'LISTENING') {
                    recognition.start(); // Keep listening if not explicitly stopped
                }
            };

            recognitionRef.current = recognition;
        }
    }, [language, state]);

    const startAudioRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start();
        } catch (err) {
            console.error("Error accessing microphone:", err);
        }
    };

    const stopAudioRecordingAndSubmit = (text) => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                handleCommand(text, audioBlob);
            };
        } else {
            handleCommand(text, null);
        }
    };

    const toggleListening = () => {
        if (state === 'LISTENING') {
            recognitionRef.current?.stop();
            if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
            setState('IDLE');
        } else {
            recognitionRef.current?.start();
            // startAudioRecording is called in onstart
            setState('LISTENING');
        }
    };

    const handleCommand = async (text, audioBlob) => {
        recognitionRef.current?.stop();
        setState('PROCESSING');

        try {
            // Get Location
            let lat = null, lon = null;
            if (navigator.geolocation) {
                try {
                    const pos = await new Promise((resolve, reject) =>
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
                    );
                    lat = pos.coords.latitude;
                    lon = pos.coords.longitude;
                } catch (e) { console.warn("Loc failed", e); }
            }

            const formData = new FormData();
            formData.append('lang', languages[language].code);
            formData.append('text', text); // Always send text as backup/primary
            if (lat) formData.append('lat', lat);
            if (lon) formData.append('lon', lon);

            if (audioBlob) {
                formData.append('audio', audioBlob, 'recording.wav');
            }

            // Use fetch with FormData (no Content-Type header, browser sets it with boundary)
            const res = await fetch(`${ML_API_URL}/voice-assist`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer mock-token'
                },
                body: formData
            });

            const data = await res.json();
            setResponse(data);
            setState('RESPONDING');

            // Speak Response
            speak(data.spoken_reply, language === 'auto' ? 'en-US' : language, data.audio_base64);

        } catch (err) {
            console.error("Voice Assist Failed", err);
            setState('IDLE');
            speak("Sorry, something went wrong.", 'en-US', null);
        }
    };

    const speak = (text, lang, audioBase64) => {
        if (audioBase64) {
            // Play backend audio if available
            try {
                const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
                audio.play();
                audio.onended = () => {
                    // Optional: Resume listening
                };
                return;
            } catch (e) {
                console.error("Audio playback failed, falling back to TTS", e);
            }
        }

        if (!text) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'auto' ? 'en-US' : lang;
        synthRef.current.speak(utterance);
    };

    const handleQuickAction = (action) => {
        if (!response) return;

        switch (action) {
            case 'CALL':
                if (response.recommended_helpline) {
                    window.location.href = `tel:${response.recommended_helpline.number}`;
                }
                break;
            case 'NAVIGATE':
                if (response.recommended_helpline) {
                    const { lat, lon } = response.recommended_helpline.coordinates || {};
                    if (lat && lon) {
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
                    }
                }
                break;
            case 'SOS':
                if (onSOS) onSOS();
                break;
            default:
                break;
        }
    };

    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) return null;

    return (
        <div className={`flex flex-col items-end gap-4 font-sans ${className || 'fixed bottom-64 right-6 z-[200]'}`}>

            {/* Response Card */}
            {(state === 'RESPONDING' || state === 'PROCESSING') && (
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl rounded-br-none shadow-2xl max-w-sm border border-gray-200 dark:border-gray-700 animate-fadeInUp w-80">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🤖</span>
                            <span className="font-bold text-gray-700 dark:text-gray-200">Saathi AI</span>
                        </div>
                        <button onClick={() => { setState('IDLE'); setResponse(null); }} className="text-gray-400 hover:text-gray-600">&times;</button>
                    </div>

                    {/* Content */}
                    {state === 'PROCESSING' ? (
                        <div className="flex flex-col items-center py-6">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <p className="text-sm text-gray-500">Processing...</p>
                        </div>
                    ) : (
                        <>
                            {/* Crisis Label & Emotion */}
                            <div className="mb-2 flex gap-2">
                                {response?.crisis_label && (
                                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${response.urgency_score > 0.6 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {response.crisis_label}
                                    </span>
                                )}
                                {response?.emotion?.primary_emotion && response.emotion.primary_emotion !== 'neutral' && (
                                    <span className="text-xs font-bold uppercase px-2 py-1 rounded-full bg-purple-100 text-purple-600">
                                        {response.emotion.primary_emotion}
                                    </span>
                                )}
                            </div>

                            {/* Spoken Reply */}
                            <p className="text-gray-800 dark:text-gray-200 mb-4 text-sm leading-relaxed">
                                "{response?.spoken_reply}"
                            </p>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 gap-2">
                                {response?.recommended_helpline && (
                                    <>
                                        <button
                                            onClick={() => handleQuickAction('CALL')}
                                            className="col-span-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                                        >
                                            📞 Call {response.recommended_helpline.name}
                                        </button>
                                        <button
                                            onClick={() => handleQuickAction('NAVIGATE')}
                                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 py-2 rounded-xl text-sm font-bold transition-colors"
                                        >
                                            📍 Navigate
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => handleQuickAction('SOS')}
                                    className={`py-2 rounded-xl text-sm font-bold transition-colors ${response?.recommended_helpline ? '' : 'col-span-2'
                                        } bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-300`}
                                >
                                    🚨 SOS Alert
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Main Controls */}
            <div className="flex items-center gap-3">

                {/* Transcript Bubble (While Listening) */}
                {state === 'LISTENING' && transcript && (
                    <div className="bg-black/80 text-white text-sm px-4 py-2 rounded-2xl rounded-br-none backdrop-blur-md animate-fadeIn max-w-[200px] truncate">
                        "{transcript}"
                    </div>
                )}

                <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-2 rounded-full shadow-xl border border-white/20">

                    {/* Language Selector */}
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-transparent text-xs font-bold text-gray-700 dark:text-gray-300 outline-none border-r border-gray-300 dark:border-gray-600 pr-2 mr-1 cursor-pointer"
                    >
                        {Object.entries(languages).map(([key, val]) => (
                            <option key={key} value={key}>{val.name}</option>
                        ))}
                    </select>

                    {/* Mic Button */}
                    <button
                        onClick={toggleListening}
                        className={`w-12 h-12 rounded-full transition-all shadow-lg flex items-center justify-center relative
                            ${state === 'LISTENING'
                                ? 'bg-red-500 text-white shadow-red-500/50 scale-110'
                                : state === 'PROCESSING'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/50'
                            }
                        `}
                    >
                        {state === 'PROCESSING' ? (
                            <span className="animate-spin text-lg">⏳</span>
                        ) : state === 'LISTENING' ? (
                            <>
                                <span className="z-10 text-xl">🎙️</span>
                                <span className="absolute inset-0 rounded-full border-4 border-red-500 opacity-50 animate-ping"></span>
                                <span className="absolute inset-0 rounded-full border-4 border-red-500 opacity-30 animate-ping delay-75"></span>
                            </>
                        ) : (
                            <span className="text-xl">🎤</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
