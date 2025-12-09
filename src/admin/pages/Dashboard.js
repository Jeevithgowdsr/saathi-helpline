import React from 'react';
import { ExternalAlertsFeed } from '../components/ExternalAlertsFeed';

export function Dashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Helplines" value="1,240" icon="📞" color="blue" />
                <StatCard title="Active Alerts" value="12" icon="📢" color="red" />
                <StatCard title="Pending Reports" value="5" icon="📝" color="yellow" />
                <StatCard title="Registered Agencies" value="84" icon="🏢" color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Activity Column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                            <ActivityItem text="New helpline added: Bangalore City Police" time="2 mins ago" />
                            <ActivityItem text="Alert broadcasted: Flood Warning in Kerala" time="1 hour ago" />
                            <ActivityItem text="User report resolved: #REP-004" time="3 hours ago" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4">System Health</h2>
                        <div className="space-y-4">
                            <HealthItem label="API Status" status="Operational" color="green" />
                            <HealthItem label="Database Latency" status="24ms" color="green" />
                            <HealthItem label="SMS Gateway" status="98% Success" color="blue" />
                        </div>
                    </div>
                </div>

                {/* Sidebar Column for Feeds */}
                <div className="lg:col-span-1 h-full min-h-[500px]">
                    <ExternalAlertsFeed />
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        red: 'bg-red-50 text-red-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colors[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}

function ActivityItem({ text, time }) {
    return (
        <div className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
            <div>
                <p className="text-gray-800 text-sm">{text}</p>
                <p className="text-xs text-gray-400">{time}</p>
            </div>
        </div>
    );
}

function HealthItem({ label, status, color }) {
    const colors = {
        green: 'text-green-600 bg-green-50',
        blue: 'text-blue-600 bg-blue-50',
    };
    return (
        <div className="flex justify-between items-center">
            <span className="text-gray-600">{label}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[color]}`}>{status}</span>
        </div>
    );
}
