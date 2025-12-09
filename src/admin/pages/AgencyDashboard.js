import React from 'react';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { IncidentTable } from '../components/IncidentTable';
import { CrisisHeatmap } from '../components/CrisisHeatmap';

export function AgencyDashboard() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Command Center</h1>
                    <p className="text-gray-500">Bangalore City Police • <span className="text-green-600 font-bold">● Live Operations</span></p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-red-500/30 flex items-center gap-2 animate-pulse">
                        <span>📢</span> Broadcast Alert
                    </button>
                    <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium shadow-sm">
                        <span>⚙️</span> Settings
                    </button>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Incidents"
                    value="1,240"
                    trend="+12%"
                    trendUp={true}
                    icon="🚨"
                    color="blue"
                />
                <StatCard
                    title="Active Units"
                    value="42"
                    subtitle="85% Deployed"
                    icon="🚓"
                    color="indigo"
                />
                <StatCard
                    title="Avg Response"
                    value="8m 30s"
                    trend="-45s"
                    trendUp={true} // Good trend (lower time)
                    icon="⚡"
                    color="yellow"
                />
                <StatCard
                    title="Critical Alerts"
                    value="3"
                    subtitle="Requires Attention"
                    icon="🔥"
                    color="red"
                    alert={true}
                />
            </div>

            {/* Middle Section: Charts */}
            <AnalyticsCharts />

            {/* Bottom Section: Heatmap & Table */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                    <IncidentTable />
                </div>
                <div className="xl:col-span-1">
                    <CrisisHeatmap />

                    {/* Recent Calls List */}
                    <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Emergency Calls</h3>
                        <div className="space-y-4">
                            <CallItem number="+91 98765 43210" time="Just now" type="Medical" />
                            <CallItem number="+91 87654 32109" time="5m ago" type="Police" />
                            <CallItem number="+91 76543 21098" time="12m ago" type="Fire" />
                            <CallItem number="+91 65432 10987" time="24m ago" type="Unknown" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, trendUp, subtitle, icon, color, alert }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        red: 'bg-red-50 text-red-600',
    };

    return (
        <div className={`bg-white p-6 rounded-xl shadow-sm border ${alert ? 'border-red-200 ring-2 ring-red-100' : 'border-gray-100'} flex items-center justify-between`}>
            <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
                <h2 className="text-3xl font-bold text-gray-800">{value}</h2>
                {trend && (
                    <p className={`text-xs font-bold mt-2 flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {trendUp ? '↗' : '↘'} {trend} <span className="text-gray-400 font-normal">vs last week</span>
                    </p>
                )}
                {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${colors[color]}`}>
                {icon}
            </div>
        </div>
    );
}

function CallItem({ number, time, type }) {
    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                    ${type === 'Medical' ? 'bg-blue-100 text-blue-600' :
                        type === 'Police' ? 'bg-green-100 text-green-600' :
                            type === 'Fire' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}
                `}>
                    📞
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-800">{number}</p>
                    <p className="text-xs text-gray-500">{type} • {time}</p>
                </div>
            </div>
            <button className="text-xs bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-100">
                Callback
            </button>
        </div>
    );
}
