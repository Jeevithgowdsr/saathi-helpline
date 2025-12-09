import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import { getAnalyticsData } from '../services/analyticsService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function AdvancedAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            // In a real app, we fetch from Firestore. 
            // For demo, if no data exists, we might fall back to mock or show empty.
            // The service handles fetching.
            const result = await getAnalyticsData(timeRange);

            // Fallback Mock Data if Firestore is empty for visualization
            if (!result || result.totalIncidents === 0) {
                setData(MOCK_DATA);
            } else {
                setData(result);
            }
            setLoading(false);
        };

        loadData();
    }, [timeRange]);

    if (loading) return <div className="p-10 text-center">Loading Analytics...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">System Analytics</h2>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    {['24h', '7d', '30d'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeRange === range ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard title="Total Incidents" value={data.totalIncidents} icon="📋" color="blue" />
                <MetricCard title="Avg Response Time" value={`${data.avgResponseTime} min`} icon="⚡" color="green" />
                <MetricCard title="False Reports" value={`${data.falseReportRate}%`} icon="⚠️" color="yellow" />
                <MetricCard title="Critical Cases" value="12" icon="🔥" color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Peak Hours Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Peak Emergency Hours</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.peakHoursData}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="incidents" stroke="#8884d8" fillOpacity={1} fill="url(#colorHours)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Crisis Types Pie */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Common Crisis Types</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.crisisTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.crisisTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="middle" align="right" layout="vertical" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Region Wise Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Incidents by Region</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.regionData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="region" type="category" width={100} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Response Rate Trend */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Response Time Trend (Last 7 Days)</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={MOCK_RESPONSE_TREND}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="time" stroke="#ff7300" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon, color }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        red: 'bg-red-50 text-red-600',
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

// Mock Data for Fallback/Demo
const MOCK_DATA = {
    totalIncidents: 1240,
    avgResponseTime: 8.5,
    falseReportRate: 2.4,
    peakHoursData: [
        { name: '00:00', incidents: 10 }, { name: '04:00', incidents: 5 },
        { name: '08:00', incidents: 30 }, { name: '12:00', incidents: 80 },
        { name: '16:00', incidents: 65 }, { name: '20:00', incidents: 90 },
        { name: '23:59', incidents: 20 },
    ],
    crisisTypeData: [
        { name: 'Medical', value: 450 }, { name: 'Police', value: 300 },
        { name: 'Fire', value: 150 }, { name: 'Women Safety', value: 200 },
        { name: 'Other', value: 140 },
    ],
    regionData: [
        { region: 'Indiranagar', count: 120 }, { region: 'Koramangala', count: 95 },
        { region: 'Whitefield', count: 80 }, { region: 'Jayanagar', count: 60 },
        { region: 'MG Road', count: 45 },
    ]
};

const MOCK_RESPONSE_TREND = [
    { day: 'Mon', time: 12 }, { day: 'Tue', time: 10 }, { day: 'Wed', time: 8 },
    { day: 'Thu', time: 9 }, { day: 'Fri', time: 7 }, { day: 'Sat', time: 15 },
    { day: 'Sun', time: 14 },
];
