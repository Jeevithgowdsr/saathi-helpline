import React, { useState, useRef, useEffect } from 'react';

export function PanicMode({ contacts, onClose }) {
    const [step, setStep] = useState('camera'); // camera, sending, sent
    const [facingMode, setFacingMode] = useState('environment');
    const [countdown, setCountdown] = useState(3);
    const videoRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);

    useEffect(() => {
        startCamera();
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    captureAndSend();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => {
            clearInterval(timer);
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera Error:", err);
            alert("Camera access denied.");
            onClose();
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
    };

    const captureAndSend = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0);
            const imageUrl = canvas.toDataURL('image/jpeg');
            setCapturedImage(imageUrl);
            stopCamera();
            setStep('sending');

            // Simulate sending process
            setTimeout(() => {
                sendToContacts(imageUrl);
                setStep('sent');
            }, 2000);
        }
    };

    const sendToContacts = (imageUrl) => {
        // In a real app, upload image to server and get URL
        // Here we simulate the process and open SMS app as fallback

        if (contacts.length === 0) {
            alert("No emergency contacts found!");
            return;
        }

        const numbers = contacts.join(',');
        const message = encodeURIComponent(`🚨 SOS! I am in danger. Here is my photo evidence. Location: https://maps.google.com/?q=MY_LOCATION`);

        // Try to trigger SMS intent
        window.location.href = `sms:${numbers}?body=${message}`;
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center">
            {step === 'camera' && (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-9xl font-bold text-white animate-ping">{countdown}</span>
                    </div>
                    <div className="absolute top-10 left-0 w-full text-center">
                        <h2 className="text-3xl font-bold text-red-500 bg-black/50 py-2">🚨 PANIC MODE ACTIVE 🚨</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute bottom-10 bg-white/20 text-white px-6 py-3 rounded-full backdrop-blur-md border border-white/30"
                    >
                        Cancel
                    </button>
                </>
            )}

            {step === 'sending' && (
                <div className="flex flex-col items-center gap-6 p-8 text-center">
                    <div className="w-24 h-24 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    <h2 className="text-3xl font-bold text-white">Alerting {contacts.length} Contacts...</h2>
                    <p className="text-gray-400">Uploading Evidence & Location</p>
                </div>
            )}

            {step === 'sent' && (
                <div className="flex flex-col items-center gap-6 p-8 text-center animate-fadeIn">
                    <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center text-6xl shadow-2xl shadow-green-500/50">
                        ✓
                    </div>
                    <h2 className="text-3xl font-bold text-white">Alerts Sent!</h2>
                    <p className="text-gray-300 max-w-md">
                        Emergency message and photo evidence have been queued for your contacts.
                    </p>
                    <img src={capturedImage} alt="Evidence" className="w-48 h-48 object-cover rounded-2xl border-2 border-white/20" />
                    <button
                        onClick={onClose}
                        className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}
