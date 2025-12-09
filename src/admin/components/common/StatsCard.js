import React from 'react';

export function StatsCard({ title, value, icon, trend, trendDirection = 'up', color = 'blue', subtitle }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        purple: 'bg-purple-50 text-purple-600',
        indigo: 'bg-indigo-50 text-indigo-600',
    };

    const trendColor = trendDirection === 'up' ? 'text-green-600' : 'text-red-600';
    const trendIcon = trendDirection === 'up' ? '↗' : '↘';

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${colors[color] || colors.blue}`}>
                    <span className="text-xl">{icon}</span>
                </div>
            </div>

            {(trend || subtitle) && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                    {trend && (
                        <span className={`font-bold flex items-center gap-1 ${trendColor}`}>
                            {trendIcon} {trend}
                        </span>
                    )}
                    {subtitle && <span className="text-gray-400">{subtitle}</span>}
                </div>
            )}
        </div>
    );
}
