import React from 'react';

export function Navbar({ t, toggleDarkMode, lang, setLang, user, handleLogin, handleLogout, search, setSearch }) {
    return (
        <header className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-300">
            <div className="glass dark:glass-dark rounded-2xl px-6 py-4 flex justify-between items-center relative overflow-hidden group">
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                <span className="flex items-center gap-3 font-bold text-2xl tracking-tight text-gray-800 dark:text-white relative z-10">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg ring-2 ring-white/50 dark:ring-white/10">
                        <img src="/icons/logo.jpg" alt="logo" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20"></div>
                    </div>
                    <span className="text-gradient font-extrabold tracking-tighter text-2xl">
                        {t.title}
                    </span>
                </span>

                <div className="flex items-center gap-4 relative z-10">
                    {/* Search Bar */}
                    <div className="hidden md:flex items-center bg-white/50 dark:bg-gray-800/50 rounded-xl px-3 py-2 border border-white/20 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                        <span className="text-gray-500 mr-2">🔍</span>
                        <input
                            type="text"
                            placeholder="Search helplines..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-gray-800 dark:text-white w-48 placeholder-gray-500"
                        />
                    </div>
                    <button
                        onClick={toggleDarkMode}
                        className="p-2.5 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm text-xl backdrop-blur-sm border border-white/20 dark:border-gray-700"
                        title="Toggle Theme"
                    >
                        🌙
                    </button>

                    <div className="relative group">
                        <select
                            value={lang}
                            onChange={(e) => setLang(e.target.value)}
                            className="appearance-none bg-white/50 dark:bg-gray-800/50 text-gray-800 dark:text-white pl-4 pr-10 py-2.5 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm hover:bg-white dark:hover:bg-gray-700 transition-all backdrop-blur-sm border border-white/20 dark:border-gray-700"
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
