import React, { useState, useEffect, useRef } from 'react';
import { auth, provider } from "./firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { translations } from './data/translations';
import { allHelplines, categories } from './data/helplines';
import { InstallAppPrompt } from './components/InstallAppPrompt';
import { HelplineCard } from './components/HelplineCard';
import { Navbar } from './components/Navbar';
import { EmergencyContacts } from './components/EmergencyContacts';

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function App() {
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

  const t = translations[lang];

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
        const message = encodeURIComponent(`🚨 I am in danger. My location: ${mapsLink}`);
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
        const mapUrl = `https://www.google.com/maps/search/Police+Station/@${lat},${lon},14z`;
        window.open(mapUrl, '_blank');
      }, () => alert("Location access denied."));
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

  const appRef = useRef(null);

  useEffect(() => {
    if (appRef.current) {
      setTimeout(() => {
        appRef.current.style.opacity = '1';
      }, 100);
    }
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div ref={appRef} className="min-h-screen bg-[#f0f4f8] dark:bg-gray-900 transition-colors duration-500 pb-32 pt-28">
      <Navbar
        t={t}
        toggleDarkMode={toggleDarkMode}
        lang={lang}
        setLang={setLang}
        user={user}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />

      {/* Hero Section */}
      <div className="px-4 mb-8">
        <div className="max-w-4xl mx-auto text-center mb-10 animate-fadeInUp">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-800 dark:text-white tracking-tight">
            {t.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Your trusted companion for emergency services and helplines across India.
          </p>

          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-2 border border-gray-100 dark:border-gray-700">
              <span className="pl-4 text-2xl">🔍</span>
              <input
                type="text"
                placeholder={t.search}
                className="w-full p-4 bg-transparent border-none focus:ring-0 text-lg text-gray-800 dark:text-white placeholder-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                onClick={() => {
                  const recognition = new window.SpeechRecognition();
                  recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'kn' ? 'kn-IN' : 'en-IN';
                  recognition.start();
                  recognition.onresult = (event) => {
                    const spoken = event.results[0][0].transcript;
                    setSearch(spoken);
                  };
                }}
                className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-xl"
                title="Voice Search"
              >
                🎤
              </button>
            </div>
          </div>
        </div>

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

      {/* Floating Action Buttons (SOS) */}
      <div className="fixed bottom-28 right-6 flex flex-col gap-4 z-40">
        <button
          onClick={sendEmergencyMessage}
          className="w-14 h-14 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg shadow-yellow-500/40 flex items-center justify-center text-2xl transition-transform hover:scale-110"
          title={t.sendMsg}
        >
          📩
        </button>
        <button
          onClick={handleGetLocation}
          className="w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg shadow-purple-600/40 flex items-center justify-center text-2xl transition-transform hover:scale-110"
          title="Share Location"
        >
          📡
        </button>
        <button
          onClick={() => {
            window.location.href = "tel:100";
            sendEmergencyMessage();
          }}
          className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg shadow-red-600/40 flex items-center justify-center text-3xl animate-pulse transition-transform hover:scale-110"
          title={t.sos}
        >
          🚨
        </button>
      </div>

      {/* Bottom Navigation Dock */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="glass dark:glass-dark px-6 py-3 rounded-full shadow-2xl flex items-center gap-8 border border-white/20">
          <button
            onClick={() => setSelectedCategory("All")}
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

      <InstallAppPrompt />
    </div>
  );
}

export default App;
