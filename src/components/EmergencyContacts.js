import React from 'react';

export function EmergencyContacts({ contacts, setContacts, newContact, setNewContact, t }) {
    return (
        <div className="mt-8 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 animate-fadeIn relative overflow-hidden group">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-bl-full -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-110 duration-700"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-green-500/5 to-teal-500/5 rounded-tr-full -ml-10 -mb-10 pointer-events-none"></div>

            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-3 relative z-10">
                <span className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 p-3 rounded-2xl text-2xl shadow-sm">📱</span>
                {t.manageContacts}
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 relative z-10">
                <div className="relative w-full">
                    <input
                        type="tel"
                        placeholder={t.enterPhone}
                        className="w-full p-4 pl-12 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-gray-700/50 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 contact-input shadow-inner"
                        value={newContact}
                        onChange={(e) => setNewContact(e.target.value)}
                    />
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">📞</span>
                </div>

                <button
                    onClick={() => {
                        if (newContact && !contacts.includes(newContact)) {
                            setContacts([...contacts, newContact]);
                            setNewContact("");
                            // Add visual feedback
                            const input = document.querySelector('.contact-input');
                            if (input) {
                                input.classList.add('ring-2', 'ring-green-500');
                                setTimeout(() => {
                                    input.classList.remove('ring-2', 'ring-green-500');
                                }, 1000);
                            }
                        } else {
                            alert(t.invalidNumber);
                            // Add error feedback
                            const input = document.querySelector('.contact-input');
                            if (input) {
                                input.classList.add('ring-2', 'ring-red-500');
                                setTimeout(() => {
                                    input.classList.remove('ring-2', 'ring-red-500');
                                }, 1000);
                            }
                        }
                    }}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 whitespace-nowrap"
                >
                    <span>➕</span> {t.addContact}
                </button>
            </div>

            <ul className="space-y-4 relative z-10">
                {contacts.length === 0 ? (
                    <li className="text-gray-400 dark:text-gray-500 italic py-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        {t.noContacts}
                    </li>
                ) : (
                    contacts.map((num, index) => (
                        <li
                            key={index}
                            data-contact={num}
                            className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/30 px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:bg-white dark:hover:bg-gray-700 group"
                        >
                            <span className="font-semibold text-gray-700 dark:text-gray-200 text-lg flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm text-blue-600 dark:text-blue-400">📞</span>
                                {num}
                            </span>
                            <button
                                onClick={() => {
                                    const confirmDelete = window.confirm(t.confirmRemove.replace('{number}', num));
                                    if (confirmDelete) {
                                        setContacts(contacts.filter(n => n !== num));
                                    }
                                }}
                                className="text-red-500 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 opacity-70 group-hover:opacity-100"
                                title={t.remove}
                            >
                                ❌
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
