import React, { useState, useEffect } from 'react';

export function InstallAppPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstall, setShowInstall] = useState(false);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstall(true);
        });
    }, []);

    const handleInstallClick = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted install');
                } else {
                    console.log('User dismissed install');
                }
                setDeferredPrompt(null);
                setShowInstall(false);
            });
        }
    };

    if (!showInstall) return null;

    return (
        <button
            onClick={handleInstallClick}
            className="fixed bottom-28 left-6 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center gap-3 font-bold transition-all hover:scale-105 hover:-translate-y-1 animate-bounce"
        >
            <span className="text-xl">📥</span>
            <span>Install App</span>
        </button>
    );
}
