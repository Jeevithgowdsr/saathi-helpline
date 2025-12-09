import React from 'react';

export function ActivityFeed({ title, items, maxHeight = '400px' }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">{title || 'Recent Activity'}</h3>
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">View All</button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight }}>
                {items && items.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {items.map((item, index) => (
                            <ActivityItem key={index} {...item} />
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-400 text-sm">No recent activity</div>
                )}
            </div>
        </div>
    );
}

function ActivityItem({ text, time, user, type = 'info' }) {
    const typeColors = {
        info: 'bg-blue-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500',
    };

    return (
        <div className="p-4 hover:bg-gray-50 transition-colors flex gap-3">
            <div className="mt-1.5">
                <div className={`w-2 h-2 rounded-full ${typeColors[type] || typeColors.info}`}></div>
            </div>
            <div className="flex-1">
                <p className="text-sm text-gray-800 leading-relaxed">{text}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{time}</span>
                    {user && (
                        <>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500 font-medium">{user}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
