import React, { useState } from 'react';

export function FirstAidGuide({ t }) {
    const [expanded, setExpanded] = useState(null);

    const guides = [
        {
            id: 'cpr',
            title: 'CPR (Cardiopulmonary Resuscitation)',
            icon: '❤️',
            steps: [
                'Check responsiveness: Shake shoulders and ask "Are you okay?".',
                'Call 112/108 immediately.',
                'Check breathing. If not breathing, start chest compressions.',
                'Push hard and fast in the center of the chest (100-120 bpm).',
                'Continue until help arrives.'
            ]
        },
        {
            id: 'bleeding',
            title: 'Severe Bleeding',
            icon: '🩸',
            steps: [
                'Apply direct pressure on the wound with a clean cloth.',
                'Keep pressure until bleeding stops.',
                'Do not remove the cloth if soaked; add more on top.',
                'Elevate the injured part if possible.',
                'Call emergency services if bleeding is severe.'
            ]
        },
        {
            id: 'burns',
            title: 'Burns',
            icon: '🔥',
            steps: [
                'Cool the burn under cool running water for 10-20 minutes.',
                'Do not use ice, butter, or oil.',
                'Cover loosely with a sterile bandage or clean cloth.',
                'Do not pop blisters.',
                'Seek medical help for severe burns.'
            ]
        },
        {
            id: 'choking',
            title: 'Choking',
            icon: '🤢',
            steps: [
                'Encourage them to cough.',
                'Give 5 back blows between shoulder blades.',
                'Give 5 abdominal thrusts (Heimlich maneuver).',
                'Repeat until object is dislodged.',
                'Call emergency if they lose consciousness.'
            ]
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 mt-16 animate-fadeInUp">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
                <span className="text-gradient">🩹 First Aid Guide</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guides.map((guide) => (
                    <div
                        key={guide.id}
                        className={`glass dark:glass-dark rounded-2xl p-6 transition-all duration-300 cursor-pointer border border-white/20 ${expanded === guide.id ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:shadow-lg'}`}
                        onClick={() => setExpanded(expanded === guide.id ? null : guide.id)}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-4">
                                <span className="text-4xl">{guide.icon}</span>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{guide.title}</h3>
                            </div>
                            <span className="text-2xl text-gray-400 transition-transform duration-300" style={{ transform: expanded === guide.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                ▼
                            </span>
                        </div>

                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expanded === guide.id ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                            <ul className="space-y-3 pl-2">
                                {guide.steps.map((step, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
