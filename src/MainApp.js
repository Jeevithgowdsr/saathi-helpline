import React, { useState, useEffect, Suspense, lazy } from 'react';
import { auth, provider } from "./firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { translations } from './data/translations';
import { allHelplines, categories } from './data/helplines';
import { InstallAppPrompt } from './components/InstallAppPrompt';
import { HelplineCard } from './components/HelplineCard';
import { Navbar } from './components/Navbar';
import { EmergencyContacts } from './components/EmergencyContacts';
import { FirstAidGuide } from './components/FirstAidGuide';
import { PanicMode } from './components/PanicMode';
import { SafetyAlertSystem } from './components/SafetyAlertSystem';
import './index.css';
import './App.css';

// Lazy Load Heavy Components
const EmergencyMap = lazy(() => import('./components/EmergencyMap').then(module => ({ default: module.EmergencyMap })));
const NearbyServices = lazy(() => import('./components/NearbyServices').then(module => ({ default: module.NearbyServices })));
const SmartHelplineFinder = lazy(() => import('./components/SmartHelplineFinder').then(module => ({ default: module.SmartHelplineFinder })));
const SaathiAssistant = lazy(() => import('./components/SaathiAssistant').then(module => ({ default: module.SaathiAssistant })));
const CrimeNews = lazy(() => import('./components/CrimeNews').then(module => ({ default: module.CrimeNews })));

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const safetyTips = [
    { title: "Stay Calm", icon: "🧘", desc: "Panic hinders clear thinking. Take deep breaths." },
    { title: "Share Location", icon: "📍", desc: "Always keep your live location on with trusted contacts." },
    { title: "Emergency Numbers", icon: "📞", desc: "Memorize 112 and other critical helplines." },
    { title: "Trust Instincts", icon: "👀", desc: "If a situation feels wrong, leave immediately." },
];

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

export function MainApp() {
    const [user, setUser] = useState(null);
    const [contacts, setContacts] = useState(() => {
        const saved = localStorage.getItem("emergencyContacts");
        return saved ? JSON.parse(saved) : [];
    });
    const [newContact, setNewContact] = useState("");
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem("favorites");
        return saved ? JSON.parse(saved) : [];
    });
    const [lang, setLang] = useState(() => {
        return localStorage.getItem("selectedLang") || "en";
    });
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [isPanicMode, setIsPanicMode] = useState(false);

    useEffect(() => {
        window.addEventListener('offline', () => {
            alert('You are offline. Some features may not be available.');
        });
    }, []);

    useEffect(() => {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        localStorage.setItem("selectedLang", lang);
    }, [lang]);

    const t = translations[lang] || translations['en'];

    useEffect(() => {
        localStorage.setItem("emergencyContacts", JSON.stringify(contacts));
    }, [contacts]);

    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            setUser(result.user);
        } catch (error) {
            console.error("Login Error:", error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            alert("Logout failed: " + error.message);
        }
    };

    const sendEmergencyMessage = () => {
        if (!contacts.length) return alert("Please add at least one contact.");
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
                const message = encodeURIComponent(`🚨 I am in danger. try to contact me or bring police to my place  My location: ${mapsLink}`);
                contacts.forEach(num => {
                    window.open(`sms:${num}?body=${message}`);
                });
            }, err => alert("Location error: " + err.message));
        } else alert("Geolocation not supported by this browser.");
    };

    const toggleFavorite = (name) => {
        setFavorites(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const mapUrl = `https://www.google.com/maps?q=${lat},${lon}`;
                window.open(mapUrl, '_blank');
            }, (error) => {
                console.error("Error getting location:", error);
                alert("Location access denied or error occurred. Please ensure GPS is on.");
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        } else {
            alert("Geolocation not supported");
        }
    };

    const reportNumber = (name) => {
        alert(`✅ Thank you for reporting. We'll verify the number listed for "${name}".`);
    };

    const filteredHelplines = allHelplines.filter(h => {
        const name = t[`${h.key}Name`] || h.category;
        const matchSearch = name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = selectedCategory === "All"
            || h.category === selectedCategory
            || (selectedCategory === "Favorites" && favorites.includes(name));
        return matchSearch && matchCategory;
    });

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark');
    };

    return (
        <div className="min-h-screen bg-aesthetic-light dark:bg-aesthetic-dark transition-all duration-500 pb-32 pt-28 text-gray-800 dark:text-gray-100">
            <SafetyAlertSystem />
            <Navbar
                t={t}
                toggleDarkMode={toggleDarkMode}
                lang={lang}
                setLang={setLang}
                user={user}
                handleLogin={handleLogin}
                handleLogout={handleLogout}
                search={search}
                setSearch={setSearch}
            />

            {/* Hero Section */}
            <div className="px-4 mb-8">
                <div className="max-w-4xl mx-auto text-center mb-10 animate-fadeInUp">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                        <span className="text-gradient drop-shadow-sm">{t.title}</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        Your trusted companion for emergency services and helplines across India.
                    </p>

                    <div className="relative max-w-2xl mx-auto group">
                        <Suspense fallback={<LoadingSpinner />}>
                            <SmartHelplineFinder t={t} />
                        </Suspense>
                    </div>
                </div>

                <Suspense fallback={<LoadingSpinner />}>
                    <NearbyServices />
                    <EmergencyMap />
                </Suspense>

                {/* Quick Actions */}
                <div className="flex justify-center gap-4 mb-10 animate-fadeIn">
                    <button
                        onClick={handleGetLocation}
                        className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 dark:border-gray-700 transition-all hover:-translate-y-1 flex items-center gap-2 font-semibold"
                    >
                        <span className="text-green-500">📍</span> {t.location}
                    </button>
                </div>

                {/* Categories */}
                <div className="flex gap-3 mb-10 overflow-x-auto pb-4 max-w-6xl mx-auto px-4 scrollbar-hide animate-fadeIn">
                    {categories.map((cat, index) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${selectedCategory === cat
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                }`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Helplines Grid */}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-4 animate-fadeIn">
                    {filteredHelplines.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <div className="text-6xl mb-4">🔍</div>
                            <p className="text-gray-500 dark:text-gray-400 text-xl">No helplines found matching your criteria.</p>
                        </div>
                    ) : (
                        filteredHelplines.map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                                }}
                            >
                                <HelplineCard
                                    item={item}
                                    t={t}
                                    toggleFavorite={toggleFavorite}
                                    favorites={favorites}
                                    reportNumber={reportNumber}
                                />
                            </div>
                        ))
                    )}
                </div>

                {/* Safety Tips Section */}
                <div className="max-w-7xl mx-auto px-4 mt-16 animate-fadeInUp">
                    <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
                        <span className="text-gradient">🛡️ Safety First</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {safetyTips.map((tip, index) => (
                            <div key={index} className="glass dark:glass-dark p-6 rounded-2xl hover:-translate-y-2 transition-transform duration-300 border border-white/20">
                                <div className="text-4xl mb-4">{tip.icon}</div>
                                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{tip.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">{tip.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <Suspense fallback={<LoadingSpinner />}>
                    <CrimeNews />
                </Suspense>
                <FirstAidGuide t={t} />

                {/* About & Contacts */}
                <div className="max-w-4xl mx-auto mt-20 px-4 animate-fadeInUp">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 mb-8">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-3">
                            <span className="text-blue-500">📖</span> {t.aboutTitle}
                        </h2>
                        <p className="leading-relaxed text-gray-600 dark:text-gray-300 text-lg">{t.aboutText}</p>
                    </div>

                    <EmergencyContacts
                        contacts={contacts}
                        setContacts={setContacts}
                        newContact={newContact}
                        setNewContact={setNewContact}
                        t={t}
                    />
                </div>
            </div>

            {/* Left Navigation Dock */}
            <div className="fixed bottom-24 left-6 z-50">
                <div className="glass dark:glass-dark px-3 py-6 rounded-full shadow-2xl flex flex-col items-center gap-8 border border-white/20">
                    <button
                        onClick={() => {
                            setSelectedCategory("All");
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                    >
                        <span className="text-2xl group-hover:-translate-y-1 transition-transform">🏠</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t.home}</span>
                    </button>
                    <button
                        onClick={() => setSelectedCategory("Favorites")}
                        className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                    >
                        <span className="text-2xl group-hover:-translate-y-1 transition-transform">⭐</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t.favorites}</span>
                    </button>
                    <button
                        onClick={() => setSelectedCategory("Emergency")}
                        className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
                    >
                        <span className="text-2xl group-hover:-translate-y-1 transition-transform">🚨</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t.emergency}</span>
                    </button>
                    <button
                        onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                        className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                    >
                        <span className="text-2xl group-hover:-translate-y-1 transition-transform">ℹ️</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">About</span>
                    </button>
                </div>
            </div>

            {/* Right Action Dock */}
            <div className="fixed bottom-24 right-6 z-50">
                <div className="glass dark:glass-dark px-3 py-6 rounded-full shadow-2xl flex flex-col items-center gap-6 border border-white/20">
                    <div className="relative">
                        <div className={`absolute right-full top-1/2 -translate-y-1/2 mr-6 flex items-center gap-3 transition-all duration-300 ${isFabOpen ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-10 scale-0 pointer-events-none'}`}>
                            <button onClick={sendEmergencyMessage} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-full shadow-lg hover:scale-105"><span className="text-xl">📩</span></button>
                            <button onClick={handleGetLocation} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-full shadow-lg hover:scale-105"><span className="text-xl">📡</span></button>
                            <button onClick={() => {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition((pos) => {
                                        const { latitude, longitude } = pos.coords;
                                        const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
                                        const text = encodeURIComponent(`🚨 Help! I need assistance. My location: ${mapsLink}`);
                                        window.open(`https://wa.me/?text=${text}`, '_blank');
                                    });
                                } else alert("Geolocation not supported");
                            }} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-full shadow-lg hover:scale-105"><span className="text-xl">💬</span></button>
                            <button onClick={() => setIsPanicMode(true)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-full shadow-lg hover:scale-105 animate-pulse"><span className="text-xl">📸</span></button>
                            <button onClick={() => window.location.href = "tel:100"} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-full shadow-lg hover:scale-105"><span className="text-xl">📞</span></button>
                        </div>
                        <button
                            onClick={() => setIsFabOpen(!isFabOpen)}
                            className={`w-12 h-12 ${isFabOpen ? 'bg-gray-700 rotate-45' : 'bg-red-600 animate-pulse'} hover:bg-red-700 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110`}
                            title="Emergency Actions"
                        >
                            ➕
                        </button>
                    </div>

                    <Suspense fallback={null}>
                        <SaathiAssistant t={t} className="static w-12 h-12 text-2xl shadow-none" />
                    </Suspense>
                </div>
            </div>
            {isPanicMode && <PanicMode contacts={contacts} onClose={() => setIsPanicMode(false)} />}
            <InstallAppPrompt />
        </div>
    );
}
