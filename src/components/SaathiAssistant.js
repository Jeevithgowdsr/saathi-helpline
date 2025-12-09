import React, { useState, useRef, useEffect } from 'react';
import { ML_API_URL } from '../config';

export function SaathiAssistant({ t, className }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: "Hi! I'm Saathi AI. I can guide you through emergencies, natural disasters, and first aid. How can I help?" }
    ]);
    const [input, setInput] = useState("");
    const [showCamera, setShowCamera] = useState(false);
    const [facingMode, setFacingMode] = useState('environment');
    const videoRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, showCamera]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
        setInput("");

        // Show typing indicator
        setMessages(prev => [...prev, { type: 'typing', text: '...' }]);

        try {
            // Call ML API
            const response = await fetch(`${ML_API_URL}/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });

            if (!response.ok) throw new Error("API Error");

            const data = await response.json();
            const category = data.input_analysis.category;
            const helplines = data.recommendations;

            // Remove typing indicator
            setMessages(prev => prev.filter(msg => msg.type !== 'typing'));

            // Construct Empathetic Response
            let botResponse = "";

            // 1. Empathy & Validation
            const empathyMap = {
                'Mental Health Crisis': "I hear you, and I want you to know you are not alone. Your feelings are valid.",
                'Women Safety': "I am so sorry you are going through this. Please prioritize your safety immediately.",
                'Fire Emergency': "This sounds critical. Please stay calm and evacuate if possible.",
                'Road Accident': "Please stay safe. Do not move injured persons unless necessary.",
                'Domestic Violence': "You deserve to be safe. Help is available.",
                'Child Helpline': "Thank you for reporting this. Children's safety is a priority.",
                'Cyber Crime': "That sounds stressful. We can help you report this.",
                'Medical': "Medical emergencies require quick action. Stay calm."
            };

            botResponse += (empathyMap[category] || "I understand this is an emergency.") + "\n\n";

            // 2. Actionable Advice (from API explanation or fallback)
            if (helplines.length > 0) {
                botResponse += `🚨 **Recommended Action**: Contact **${helplines[0].name}** immediately.\n`;
                botResponse += `📞 **Number**: ${helplines[0].number}\n`;
                botResponse += `ℹ️ ${helplines[0].explanation_text}\n\n`;
            }

            // 3. Disclaimer
            botResponse += "_Disclaimer: I am an AI. For immediate life-threatening danger, always dial 112 directly._";

            setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);

        } catch (err) {
            // Fallback to local logic if API fails
            console.error("AI Offline, using fallback", err);
            setMessages(prev => prev.filter(msg => msg.type !== 'typing'));

            // ... (Keep existing local logic as fallback or simple message) ...
            setMessages(prev => [...prev, { type: 'bot', text: "I'm having trouble connecting to the server, but please dial 112 for immediate help." }]);
        }
    };

    // Camera Functions
    const startCamera = async () => {
        try {
            setShowCamera(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera Error:", err);
            alert("Could not access camera. Please allow permissions.");
            setShowCamera(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setShowCamera(false);
    };

    const captureImage = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0);
            const imageUrl = canvas.toDataURL('image/jpeg');

            stopCamera();
            setMessages(prev => [
                ...prev,
                { type: 'user', image: imageUrl },
                { type: 'bot', text: "📷 Image captured. Please save this as evidence or share with authorities if needed." }
            ]);
        }
    };

    const switchCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
        stopCamera();
        setTimeout(startCamera, 200);
    };

    return (
        <>
            {/* Chat Bubble FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center text-3xl transition-transform hover:scale-110 z-50 animate-bounce-slow ${className || 'fixed bottom-4 right-6'}`}
                title="Saathi AI Assistant"
            >
                🤖
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-28 right-6 w-80 sm:w-96 h-[550px] glass dark:glass-dark rounded-3xl shadow-2xl border border-white/20 flex flex-col transition-all duration-300 transform origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>

                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white/50 dark:bg-gray-800/50 rounded-t-3xl backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-xl shadow-lg">
                            🤖
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">Saathi AI</h3>
                            <span className="text-xs text-green-500 font-semibold flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Active
                            </span>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors">
                        ✖
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-white/30 dark:bg-gray-900/30">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.image ? (
                                <div className="max-w-[80%] p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
                                    <img src={msg.image} alt="Captured incident" className="rounded-xl w-full" />
                                </div>
                            ) : (
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${msg.type === 'user'
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none'
                                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-600'
                                    }`}>
                                    {msg.text}
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Camera Preview Overlay */}
                {showCamera && (
                    <div className="absolute inset-0 bg-black z-20 flex flex-col rounded-3xl overflow-hidden">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="flex-1 object-cover w-full"
                            onLoadedMetadata={() => videoRef.current.play()}
                        />
                        <div className="absolute bottom-0 w-full p-4 flex justify-between items-center bg-gradient-to-t from-black/80 to-transparent">
                            <button onClick={stopCamera} className="text-white p-2 bg-white/20 rounded-full backdrop-blur-md">
                                ✖ Cancel
                            </button>
                            <button onClick={captureImage} className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-lg transform active:scale-90 transition-transform"></button>
                            <button onClick={switchCamera} className="text-white p-2 bg-white/20 rounded-full backdrop-blur-md">
                                🔄 Flip
                            </button>
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 rounded-b-3xl backdrop-blur-md">
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={startCamera}
                            className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl transition-colors"
                            title="Take Photo"
                        >
                            📷
                        </button>
                        <input
                            type="text"
                            placeholder="Ask about CPR, burns..."
                            className="flex-1 p-3 rounded-xl bg-gray-100 dark:bg-gray-900/50 border-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-500"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-lg shadow-blue-500/30"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
