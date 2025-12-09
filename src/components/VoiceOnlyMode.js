import React, { useState, useEffect, useRef } from 'react';
import { ML_API_URL } from '../config';

export function VoiceOnlyMode({ onClose, onSOS }) {
    const [state, setState] = useState('IDLE'); // IDLE, LISTENING, PROCESSING, RESPONDING
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState(null);
    const recognitionRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const silenceTimer = useRef(null);
    const audioRef = useRef(new Audio());
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const distressTimerRef = useRef(null);
    const pendingCallRef = useRef(null);

    // Haptic Patterns
    const vibrate = (pattern) => {
        if (navigator.vibrate) navigator.vibrate(pattern);
    };

    useEffect(() => {
        // Auto-start listening on mount
        startListening();
        vibrate(100); // Startup buzz

        const audio = audioRef.current;
        const audioCtx = audioContextRef.current;

        return () => {
            stopListening();
            if (audio) audio.pause();
            if (audioCtx) audioCtx.close();
        };
    }, []);

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // Default to English for voice mode, or auto

        recognition.onstart = () => {
            setState('LISTENING');
            startAudioRecording();
            startDistressDetection();
            vibrate(50); // Short buzz on start
        };

        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const transcriptText = event.results[current][0].transcript;
            setTranscript(transcriptText);
            clearTimeout(silenceTimer.current);

            // 0. Handle Confirmation (Yes/No)
            if (pendingCallRef.current) {
                const lower = transcriptText.toLowerCase();
                // Positive Confirmation
                if (['yes', 'yeah', 'yep', 'call', 'please', 'ok', 'okay', 'sure', 'do it'].some(w => lower.includes(w))) {
                    stopListening();
                    vibrate([100, 100, 100]); // Success buzz
                    window.location.href = `tel:${pendingCallRef.current.number}`;
                    pendingCallRef.current = null;
                    return;
                }
                // Negative Confirmation
                if (['no', 'nope', 'cancel', 'stop', 'don\'t', 'wait'].some(w => lower.includes(w))) {
                    pendingCallRef.current = null;
                    vibrate(50);
                    // Optionally speak "Cancelled" here, but for now just continue listening for new commands
                }
            }

            // 1. Keyword Spotting (Immediate Trigger)
            const lowerText = transcriptText.toLowerCase();
            const keywords = ['help', 'emergency', 'please listen', 'bachao', 'madad'];
            if (keywords.some(k => lowerText.includes(k))) {
                // Immediate trigger without waiting for silence
                stopAudioRecordingAndSubmit(transcriptText, true); // true = high urgency
                return;
            }

            // 2. Silence Detection (1.5s)
            if (event.results[current].isFinal) {
                silenceTimer.current = setTimeout(() => {
                    stopAudioRecordingAndSubmit(transcriptText);
                }, 1500);
            }
        };

        recognition.onend = () => {
            if (state === 'LISTENING') recognition.start();
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
        if (audioContextRef.current) audioContextRef.current.suspend();
    };

    const startAudioRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // MediaRecorder for Backend Upload
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };
            mediaRecorder.start();

            // AudioContext for Distress Detection (Heavy Breathing/Loud Noise)
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }

            const source = audioContextRef.current.createMediaStreamSource(stream);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            source.connect(analyserRef.current);

            detectDistress();

        } catch (err) {
            console.error("Mic Error", err);
        }
    };

    const detectDistress = () => {
        if (state !== 'LISTENING') return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkVolume = () => {
            if (state !== 'LISTENING') return;

            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;

            // Threshold for "Loud Noise / Heavy Breathing" (approx 20% volume)
            // If sustained for 3 seconds without speech result, trigger check
            if (average > 50) {
                if (!distressTimerRef.current) {
                    distressTimerRef.current = setTimeout(() => {
                        // If still loud after 3s and no transcript, trigger check
                        if (state === 'LISTENING') {
                            vibrate([50, 50, 50]); // Warning buzz
                            // We don't auto-submit to avoid false positives, but we could prompt
                            // For now, let's just log it or maybe submit a "noise detected" event
                            // Or better: Auto-submit what we have
                            stopAudioRecordingAndSubmit("Distress noise detected", true);
                        }
                        distressTimerRef.current = null;
                    }, 3000);
                }
            } else {
                clearTimeout(distressTimerRef.current);
                distressTimerRef.current = null;
            }

            requestAnimationFrame(checkVolume);
        };
        checkVolume();
    };

    const startDistressDetection = () => {
        // Wrapper to restart detection loop if needed
    };

    const stopAudioRecordingAndSubmit = (text, isUrgent = false) => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                handleCommand(text, audioBlob, isUrgent);
            };
        } else {
            handleCommand(text, null, isUrgent);
        }
    };

    const handleCommand = async (text, audioBlob, isUrgent = false) => {
        stopListening();
        setState('PROCESSING');
        vibrate([50, 50]); // Double buzz processing

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
                } catch (e) { }
            }

            const formData = new FormData();
            formData.append('lang', 'en'); // Default
            formData.append('text', text);
            if (lat) formData.append('lat', lat);
            if (lon) formData.append('lon', lon);
            if (audioBlob) formData.append('audio', audioBlob, 'recording.wav');

            const res = await fetch(`${ML_API_URL}/voice-assist`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer mock-token' },
                body: formData
            });



            // ... (inside handleCommand)

            const data = await res.json();
            setResponse(data);
            setState('RESPONDING');
            vibrate(200); // Long buzz response

            // Store helpline for confirmation
            if (data.recommended_helpline) {
                pendingCallRef.current = data.recommended_helpline;
            } else {
                pendingCallRef.current = null;
            }

            // High Urgency: Still send SMS backup (Silent Safety Net)
            if (data.urgency_score > 0.8) {
                fetch(`${ML_API_URL}/send-sms`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer mock-token' },
                    body: JSON.stringify({
                        phone: "112", // Default emergency
                        message: `SOS! I need help. Location: ${lat}, ${lon}. Context: ${text}`
                    })
                });
            }

            // Speak
            if (data.audio_base64) {
                audioRef.current.src = `data:audio/mp3;base64,${data.audio_base64}`;
                audioRef.current.play();
                audioRef.current.onended = () => {
                    // Resume listening after speaking
                    setState('IDLE');
                    startListening();
                };
            }

        } catch (err) {
            console.error("Error", err);
            setState('IDLE');
            startListening();
        }
    };

    // ... (Update startListening/onresult to handle confirmation)
    // I need to update the startListening function to check pendingCallRef

    // Since I can't easily edit two places with one replace block if they are far apart, 
    // I will use a larger block or multiple edits. 
    // Let's rewrite the startListening function in a separate step or include it here if contiguous.
    // They are not contiguous. I will do this in two steps.
    // This step handles handleCommand.


    return (
        <div
            className="fixed inset-0 bg-black z-[300] flex flex-col items-center justify-center text-white cursor-pointer select-none"
            onClick={() => {
                // Tap to toggle listening manually
                if (state === 'LISTENING') {
                    stopListening();
                    setState('IDLE');
                } else {
                    startListening();
                }
            }}
        >
            {/* Minimal UI - OLED Friendly */}
            <div className={`w-64 h-64 rounded-full border-4 flex items-center justify-center transition-all duration-500
                ${state === 'LISTENING' ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)] scale-110' :
                    state === 'PROCESSING' ? 'border-yellow-500 animate-pulse' :
                        state === 'RESPONDING' ? 'border-green-500' : 'border-gray-800'}
            `}>
                {state === 'LISTENING' && (
                    <div className="w-full h-full rounded-full bg-red-900/20 animate-ping absolute" />
                )}
                <span className="text-6xl">
                    {state === 'LISTENING' ? '🎙️' :
                        state === 'PROCESSING' ? '⏳' :
                            state === 'RESPONDING' ? '🗣️' : '🛑'}
                </span>
            </div>

            <p className="mt-12 text-gray-500 font-mono text-sm uppercase tracking-widest">
                {state}
            </p>

            {/* Hidden Close Button for safety */}
            <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="absolute top-8 right-8 text-gray-600 hover:text-white p-4"
            >
                EXIT
            </button>
        </div>
    );
}
