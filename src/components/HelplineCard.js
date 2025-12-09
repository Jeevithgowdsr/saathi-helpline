import React from 'react';

export function HelplineCard({ item, t, toggleFavorite, favorites, reportNumber }) {
    const name = t[`${item.key}Name`] || item.category;
    const description = t[`${item.key}Desc`] || item.description;
    const isFavorite = favorites.includes(name);

    return (
        <div className="group relative glass dark:glass-dark rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Gradient Border on Hover */}
            <div className="absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-br from-transparent via-blue-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700 blur-xl"></div>

            <div className="relative z-10 flex flex-col h-full items-center text-center">
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-inner transform group-hover:rotate-6 transition-transform duration-500 group-hover:shadow-blue-500/20">
                        <img src={item.image} alt={name} className="w-14 h-14 object-contain drop-shadow-md" />
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(name);
                        }}
                        className="absolute -top-2 -right-2 w-10 h-10 bg-white dark:bg-gray-700 rounded-full shadow-md flex items-center justify-center text-xl hover:scale-110 transition-transform cursor-pointer border border-gray-100 dark:border-gray-600"
                        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        {isFavorite ? "⭐" : "☆"}
                    </button>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {name}
                </h2>

                <div className="inline-block px-4 py-1 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
                    <p className="text-red-600 dark:text-red-400 font-bold text-lg tracking-wide">
                        📞 {item.number}
                    </p>
                </div>

                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed line-clamp-3">
                    {description}
                </p>

                <div className="mt-auto w-full grid gap-3">
                    <a href={`tel:${item.number}`} className="w-full">
                        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                            <span className="text-lg">📞</span> {t.call}
                        </button>
                    </a>

                    <div className="flex gap-3">
                        {item.website && (
                            <a href={item.website} target="_blank" rel="noopener noreferrer" className="flex-1">
                                <button className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-sm border border-gray-200 dark:border-gray-600">
                                    🌐 {t.visit}
                                </button>
                            </a>
                        )}

                        <button
                            onClick={() => reportNumber(name)}
                            className={`flex-1 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 py-2.5 rounded-xl font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-sm border border-red-100 dark:border-red-900/30 ${!item.website ? 'w-full' : ''}`}
                        >
                            🚩 {t.report}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
