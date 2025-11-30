import React from 'react';

export function Navbar({ t, toggleDarkMode, lang, setLang, user, handleLogin, handleLogout }) {
    return (
        <header className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-300">
            <div className="glass dark:glass-dark rounded-2xl shadow-lg px-6 py-3 flex justify-between items-center">
                <span className="flex items-center gap-3 font-bold text-2xl tracking-tight text-gray-800 dark:text-white">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md">
                        <img src="/icons/logo.jpg" alt="logo" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20"></div>
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                        {t.title}
                    </span>
                </span>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm text-xl"
                        title="Toggle Theme"
                    >
                        🌙
                    </button>

                    <div className="relative group">
                        <select
                            value={lang}
                            onChange={(e) => setLang(e.target.value)}
                            className="appearance-none bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white pl-4 pr-8 py-2 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <option value="en">English</option>
                            <option value="hi">हिंदी</option>
                            <option value="kn">ಕನ್ನಡ</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                            ▼
                        </div>
                    </div>

                    {!user ? (
                        <button
                            onClick={handleLogin}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
                        >
                            Sign In
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-700">
                            <img
                                src={user.photoURL}
                                alt="User"
                                className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-md"
                                title={user.displayName}
                            />
                            <button
                                onClick={handleLogout}
                                className="text-sm font-semibold text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
