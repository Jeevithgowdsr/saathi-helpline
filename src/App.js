import React, { useState, useEffect } from 'react';
import { auth, provider } from "./firebase";
import { signInWithPopup, signOut } from "firebase/auth";

// Removed: import App from './App'; // ❌ Recursive import of itself

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const translations = {
  en: {
    title: "Saathi Helpline Finder",
    search: "Search helpline...",
    aboutTitle: "About Saathi",
    aboutText: "Saathi is a powerful offline-ready web app designed to provide quick access to essential helpline numbers across India. With voice search, multi-language interface, favorite persistence, GPS navigation, and emergency SOS features, it empowers users with instant help. Filter services by police, women safety, children, cyber crimes, mental health, elderly care, hospitals, and more.",
    call: "Call",
    favorites: "Favorites",
    emergency: "Emergency",
    home: "Home",
    sos: "SOS",
    location: "My Location",
    sendMsg: "Send Emergency Message",
    report: "Report Wrong Number",
    visit: "Visit Website",
    policeName: "Police",
    policeDesc: "For reporting crimes, emergencies, and law enforcement assistance.",
    womenName: "Women Helpline",
    womenDesc: "Dedicated support for women's safety, abuse, and violence prevention.",
    mentalName: "Mental Health",
    mentalDesc: "Mental health support, counseling, and suicide prevention services.",
    childName: "Child Helpline",
    childDesc: "Help for children in distress, abuse, or exploitation.",
    seniorName: "Senior Citizen Helpline",
    seniorDesc: "Support for elderly facing abuse, neglect, or emergencies.",
    cyberName: "Cyber Crime",
    cyberDesc: "Report online fraud, harassment, or any cyber-related crimes.",
    hospitalName: "Hospital Emergency",
    hospitalDesc: "For immediate ambulance service or nearby hospital emergency help.",
    emergencyName: "Emergency Services",
    emergencyDesc: "Unified emergency response for Police, Ambulance, and Fire.",
    fireName: "Fire Emergency",
    fireDesc: "Helpline for fire-related emergencies."
  },
  hi: {
    title: "साथी हेल्पलाइन खोजक",
    search: "हेल्पलाइन खोजें...",
    aboutTitle: "साथी के बारे में",
    aboutText: "साथी एक शक्तिशाली वेब ऐप है जो भारत में आवश्यक हेल्पलाइन नंबरों तक त्वरित पहुंच प्रदान करता है। यह वॉयस सर्च, मल्टी-भाषा इंटरफेस, पसंदीदा सेवाएं, GPS नेविगेशन और आपातकालीन SOS जैसी विशेषताओं के साथ उपयोगकर्ताओं को त्वरित सहायता प्रदान करता है।",
    call: "कॉल करें",
    favorites: "पसंदीदा",
    emergency: "आपातकाल",
    home: "होम",
    sos: "आपातकालीन",
    location: "मेरा स्थान",
    sendMsg: "आपातकालीन संदेश भेजें",
    report: "गलत नंबर रिपोर्ट करें",
    visit: "वेबसाइट पर जाएं",
    policeName: "पुलिस",
    policeDesc: "अपराधों, आपात स्थितियों और कानून प्रवर्तन सहायता के लिए।",
    womenName: "महिला हेल्पलाइन",
    womenDesc: "महिलाओं की सुरक्षा, दुर्व्यवहार और हिंसा की रोकथाम के लिए समर्पित सहायता।",
    mentalName: "मानसिक स्वास्थ्य",
    mentalDesc: "मानसिक स्वास्थ्य सहायता, परामर्श और आत्महत्या की रोकथाम सेवाएं।",
    childName: "बाल हेल्पलाइन",
    childDesc: "संकट में बच्चों, दुर्व्यवहार या शोषण में सहायता।",
    seniorName: "वरिष्ठ नागरिक हेल्पलाइन",
    seniorDesc: "उपेक्षा, दुर्व्यवहार या आपात स्थिति का सामना कर रहे बुजुर्गों के लिए सहायता।",
    cyberName: "साइबर अपराध",
    cyberDesc: "ऑनलाइन धोखाधड़ी, उत्पीड़न या किसी भी साइबर अपराध की रिपोर्ट करें।",
    hospitalName: "अस्पताल आपातकाल",
    hospitalDesc: "तत्काल एम्बुलेंस सेवा या निकटतम अस्पताल की आपातकालीन सहायता के लिए।",
    emergencyName: "आपातकालीन सेवाएं",
    emergencyDesc: "पुलिस, एम्बुलेंस और फायर के लिए एकीकृत आपातकालीन प्रतिक्रिया।",
    fireName: "अग्नि आपातकाल",
    fireDesc: "अग्नि संबंधी आपात स्थितियों के लिए हेल्पलाइन।"
  },
  kn: {
    title: "ಸಾಥಿ ಸಹಾಯವಾಣಿ ಹುಡುಕಾಟ",
    search: "ಸಹಾಯವಾಣಿ ಹುಡುಕಿ...",
    aboutTitle: "ಸಾಥಿ ಬಗ್ಗೆ",
    aboutText: "ಸಾಥಿ ಭಾರತದ ಅಗತ್ಯ ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆಗಳ ತ್ವರಿತ ಪ್ರವೇಶವನ್ನು ಒದಗಿಸುವ ಶಕ್ತಿಶಾಲಿ ವೆಬ್ ಆಪ್ ಆಗಿದೆ. ಧ್ವನಿ ಹುಡುಕಾಟ, ಬಹುಭಾಷಾ ಇಂಟರ್ಫೇಸ್, ಇಷ್ಟಪಟ್ಟಿ ಸೇವೆಗಳು, GPS ನ್ಯಾವಿಗೇಶನ್ ಮತ್ತು ತುರ್ತು SOS ವೈಶಿಷ್ಟ್ಯಗಳೊಂದಿಗೆ ಬಳಸಲು ಸಾಧ್ಯ.",
    call: "ಕರೆ ಮಾಡಿ",
    favorites: "ಇಷ್ಟಪಟ್ಟಿ",
    emergency: "ತುರ್ತು",
    home: "ಮನೆ",
    sos: "SOS",
    location: "ನನ್ನ ಸ್ಥಳ",
    sendMsg: "ತುರ್ತು ಸಂದೇಶ ಕಳುಹಿಸಿ",
    report: "ತಪ್ಪಾದ ಸಂಖ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ",
    visit: "ವೆಬ್‌ಸೈಟ್ ನೋಡಿ",
    policeName: "ಪೊಲೀಸು",
    policeDesc: "ಅಪರಾಧಗಳು, ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಳು ಮತ್ತು ಕಾನೂನು ಜಾರಿ ಸಹಾಯಕ್ಕಾಗಿ.",
    womenName: "ಮಹಿಳಾ ಸಹಾಯವಾಣಿ",
    womenDesc: "ಮಹಿಳೆಯರ ಸುರಕ್ಷತೆ, ದುರ್ವ್ಯವಹಾರ ಮತ್ತು ಹಿಂಸೆಗೆ ಸಮರ್ಪಿತ ಬೆಂಬಲ.",
    mentalName: "ಮಾನಸಿಕ ಆರೋಗ್ಯ",
    mentalDesc: "ಮಾನಸಿಕ ಆರೋಗ್ಯ ಬೆಂಬಲ, ಸಮಾಲೋಚನೆ ಮತ್ತು ಆತ್ಮಹತ್ಯೆ ತಡೆ ಸೇವೆಗಳು.",
    childName: "ಮಕ್ಕಳ ಸಹಾಯವಾಣಿ",
    childDesc: "ತೆರಿಗೆ, ದುರ್ವ್ಯವಹಾರ ಅಥವಾ ಶೋಷಣೆಯಲ್ಲಿರುವ ಮಕ್ಕಳಿಗೆ ಸಹಾಯ.",
    seniorName: "ಜೇಷ್ಠ ನಾಗರಿಕ ಸಹಾಯವಾಣಿ",
    seniorDesc: "ಅಪೇಕ್ಷೆ, ದುರ್ವ್ಯವಹಾರ ಅಥವಾ ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಳನ್ನು ಎದುರಿಸುತ್ತಿರುವ ಹಿರಿಯರಿಗೆ ಬೆಂಬಲ.",
    cyberName: "ಸೈಬರ್ ಅಪರಾಧ",
    cyberDesc: "ಆನ್‌ಲೈನ್ ವಂಚನೆ, ಕಿರುಕುಳ ಅಥವಾ ಯಾವುದೇ ಸೈಬರ್ ಸಂಬಂಧಿತ ಅಪರಾಧಗಳನ್ನು ವರದಿ ಮಾಡಿ.",
    hospitalName: "ಆಸ್ಪತ್ರೆ ತುರ್ತು",
    hospitalDesc: "ತಕ್ಷಣದ ಆಂಬ್ಯುಲೆನ್ಸ್ ಸೇವೆ ಅಥವಾ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ ತುರ್ತು ಸಹಾಯಕ್ಕಾಗಿ.",
    emergencyName: "ತುರ್ತು ಸೇವೆಗಳು",
    emergencyDesc: "ಪೊಲೀಸು, ಆಂಬ್ಯುಲೆನ್ಸ್ ಮತ್ತು ಅಗ್ನಿಶಾಮಕ ಇಲಾಖೆಗೆ ಏಕೀಕೃತ ತುರ್ತು ಪ್ರತಿಕ್ರಿಯೆ.",
    fireName: "ಅಗ್ನಿ ತುರ್ತು",
    fireDesc: "ಅಗ್ನಿ ಸಂಬಂಧಿತ ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಳಿಗಾಗಿ ಸಹಾಯವಾಣಿ."
  }
};

const allHelplines = [
  { key: "police", number: "112", category: "Police", image: "/icons/police.png", website: "https://mysore.nic.in/en/public-utility-category/police-station/" },
  { key: "women", number: "1091", category: "Women", image: "/icons/women.png", website: "https://mysore.nic.in/en/helpline/" },
  { key: "mental", number: "9152987821", category: "Mental", image: "/icons/mental.png", website: "https://www.nimhans.ac.in/" },
  { key: "child", number: "1098", category: "Child", image: "/icons/child.png", website: "https://dwcd.karnataka.gov.in/page/Contact+us/Santhwana+Centres/en" },
  { key: "senior", number: "14567", category: "Senior", image: "/icons/senior.png", website: "https://www.indiacustomercare.com/government-karnataka-contact-numbers" },
  { key: "cyber", number: "1930", category: "Cyber", image: "/icons/cyber.png", website: "https://mysore.nic.in/en/public-utility-category/police-station/page/2/" },
  { key: "hospital", number: "102", category: "Hospital", image: "/icons/hospital.png", website: "https://www.inmysore.com/mysore-emergency-numbers" },
  { key: "emergency", number: "112", category: "Emergency", image: "/icons/emergency.png", website: "https://mysore.nic.in/en/department/emergency-helplines/" },
  { key: "fire", number: "101", category: "Fire", image: "/icons/fire.png", website: "https://indianhelpline.com/karnataka" }
];

function InstallAppPrompt() {
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

  return (
    showInstall && (
      <button
        onClick={handleInstallClick}
        className="fixed bottom-32 right-4 bg-blue-700 text-white px-4 py-2 rounded shadow-lg"
      >
        📥 Install Saathi App
      </button>
    )
  );
}

export { InstallAppPrompt };

const categories = [
  "All", "Favorites", "Emergency", "Police", "Women", "Mental", "Child", "Cyber", "Senior", "Hospital", "Fire"
];

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
  console.log("Language saved:", lang);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black transition-colors duration-300 pb-32">
      <header className="sticky top-0 bg-blue-600 text-white text-xl font-bold py-4 px-6 shadow-md z-10 flex justify-between items-center">
        <span className="flex items-center gap-2">
          <img src="/icons/logo.jpg" alt="logo" className="w-8 h-8 rounded-full" />
          {t.title}
        </span>
        <div className="flex gap-2 items-center">
          <button onClick={() => document.documentElement.classList.toggle('dark')} className="text-white text-xl">🌙</button>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-blue-500 text-white px-2 py-1 rounded z-50">
            <option value="en">EN</option>
            <option value="hi">हिंदी</option>
            <option value="kn">ಕನ್ನಡ</option>
          </select>
          {!user ? (
            <button onClick={handleLogin} className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100 text-sm">
              Sign In with Google
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" title={user.displayName} />
              <button onClick={handleLogout} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            placeholder={t.search}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
              recognition.onerror = (event) => {
                alert('Mic error: ' + event.error);
              };
            }}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 animate-pulse"
            title="Voice Search"
          >🎤</button>
        </div>

        <button onClick={handleGetLocation} className="mb-4 px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700">
          📍 {t.location}
        </button>

        <div className="flex gap-2 mb-4 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-blue-100 dark:bg-gray-700 dark:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {filteredHelplines.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-300">No helplines found.</p>
          ) : (
            filteredHelplines.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-2xl flex flex-col items-center text-center border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
              >
                <div className="w-20 h-20 mb-3 rounded-full overflow-hidden border-2 border-blue-400">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1 flex items-center justify-center gap-1">
                  {t[`${item.key}Name`] || item.category}
                  <span
                    onClick={() => toggleFavorite(t[`${item.key}Name`] || item.category)}
                    className="cursor-pointer"
                  >
                    {favorites.includes(t[`${item.key}Name`] || item.category) ? "⭐" : "☆"}
                  </span>
                </h2>
                <p className="text-pink-600 dark:text-pink-400 font-medium">📞 {item.number}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {t[`${item.key}Desc`] || item.description}
                </p>

                <div className="mt-auto w-full flex flex-col gap-2 items-center">
                  <a href={`tel:${item.number}`} className="w-full">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow w-full">
                      {t.call}
                    </button>
                  </a>

                  {item.website && (
                    <a href={item.website} target="_blank" rel="noopener noreferrer" className="w-full">
                      <button className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 text-sm w-full">
                        🌐 {t.visit}
                      </button>
                    </a>
                  )}

                  <button
                    onClick={() => reportNumber(t[`${item.key}Name`] || item.category)}
                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full"
                  >
                    🚩 {t.report}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

              <div className="mt-10 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md text-gray-700 dark:text-gray-300">
          <h2 className="text-lg font-bold mb-2">📖 {t.aboutTitle}</h2>
          <p>{t.aboutText}</p>

          <div className="mt-6 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md text-gray-700 dark:text-gray-300">
            <h2 className="text-lg font-bold mb-3">📱 Manage Emergency Contacts</h2>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="tel"
                placeholder="Enter phone number"
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-700"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
              />
              <button
                onClick={() => {
                  if (newContact && !contacts.includes(newContact)) {
                    setContacts([...contacts, newContact]);
                    setNewContact("");
                  } else {
                    alert("Invalid or duplicate number.");
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                ➕ Add
              </button>
            </div>

            <ul className="space-y-2">
              {contacts.length === 0 ? (
                <li className="text-gray-500">No contacts added yet.</li>
              ) : (
                contacts.map((num, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded"
                  >
                    <span>{num}</span>
                    <button
                      onClick={() => {
                        const confirmDelete = window.confirm(`Remove ${num} from emergency contacts?`);
                        if (confirmDelete) {
                          setContacts(contacts.filter(n => n !== num));
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ❌ Remove
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="fixed bottom-20 left-4 right-4 flex justify-between gap-2 z-50">
        <button
          onClick={sendEmergencyMessage}
          className="bg-yellow-600 text-white px-4 py-3 rounded-full shadow-lg text-sm font-bold hover:bg-yellow-700 animate-bounce"
        >
          📩 {t.sendMsg}
        </button>

        <button
          onClick={handleGetLocation}
          className="bg-purple-600 text-white px-4 py-3 rounded-full shadow-lg text-sm font-bold hover:bg-purple-700 animate-bounce"
        >
          📡 Share Location
        </button>

        <button
          onClick={() => {
            window.location.href = "tel:100";
            sendEmergencyMessage();
          }}
          className="bg-red-600 text-white px-4 py-3 rounded-full shadow-lg text-lg font-bold hover:bg-red-700 animate-bounce"
        >
          🚨 {t.sos}
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md flex justify-around items-center py-2 text-gray-600 dark:text-white text-sm z-20">
        <button onClick={() => setSelectedCategory("All")} className="flex flex-col items-center">
          <span>🏠</span>
          <span>{t.home}</span>
        </button>
        <button onClick={() => setSelectedCategory("Favorites")} className="flex flex-col items-center">
          <span>⭐</span>
          <span>{t.favorites}</span>
        </button>
        <button onClick={() => setSelectedCategory("Emergency")} className="flex flex-col items-center">
          <span>🚨</span>
          <span>{t.emergency}</span>
        </button>
        <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="flex flex-col items-center">
          <span>ℹ️</span>
          <span>About</span>
        </button>
        <InstallAppPrompt />
      </div>
    </div>
  );
}

export default App;
