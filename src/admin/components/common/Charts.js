import React from 'react';
import {
    LineChart as ReLineChart, Line, BarChart as ReBarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    AreaChart, Area
} from 'recharts';

const THEME_COLORS = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    grid: '#E5E7EB',
    text: '#6B7280'
};

export const CommonLineChart = ({ data, xKey, lines, height = 300 }) => (
    <div style={{ height }} className="w-full">
        <ResponsiveContainer>
            <ReLineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={THEME_COLORS.grid} vertical={false} />
                <XAxis dataKey={xKey} stroke={THEME_COLORS.text} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={THEME_COLORS.text} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
                {lines.map((line, idx) => (
                    <Line
                        key={line.key}
                        type="monotone"
                        dataKey={line.key}
                        stroke={line.color || THEME_COLORS.primary}
                        strokeWidth={2}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                    />
                ))}
            </ReLineChart>
        </ResponsiveContainer>
    </div>
);

export const CommonBarChart = ({ data, xKey, bars, height = 300, layout = 'horizontal' }) => (
    <div style={{ height }} className="w-full">
        <ResponsiveContainer>
            <ReBarChart data={data} layout={layout} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={THEME_COLORS.grid} horizontal={layout === 'vertical'} vertical={layout === 'horizontal'} />
                <XAxis type={layout === 'vertical' ? 'number' : 'category'} dataKey={layout === 'vertical' ? undefined : xKey} stroke={THEME_COLORS.text} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type={layout === 'vertical' ? 'category' : 'number'} dataKey={layout === 'vertical' ? xKey : undefined} stroke={THEME_COLORS.text} fontSize={12} tickLine={false} axisLine={false} width={layout === 'vertical' ? 100 : 40} />
                <Tooltip
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
                {bars.map((bar, idx) => (
                    <Bar
                        key={bar.key}
                        dataKey={bar.key}
                        fill={bar.color || THEME_COLORS.primary}
                        radius={layout === 'vertical' ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                        barSize={30}
                    />
                ))}
            </ReBarChart>
        </ResponsiveContainer>
    </div>
);

export const HeatmapGrid = ({ data, xLabels, yLabels, colorScale = ['#E0F2FE', '#0284C7'] }) => {
    // data is a 2D array [y][x] containing values
    // Simple implementation using CSS Grid

    const getOpacity = (value, max) => {
        return 0.2 + (0.8 * (value / max));
    };

    const flatValues = data.flat();
    const maxValue = Math.max(...flatValues);

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[500px]">
                <div className="flex">
                    <div className="w-20"></div> {/* Y-axis label spacer */}
                    <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${xLabels.length}, 1fr)` }}>
                        {xLabels.map((label, i) => (
                            <div key={i} className="text-xs text-center text-gray-500 font-medium py-2">{label}</div>
                        ))}
                    </div>
                </div>
                {yLabels.map((yLabel, yIndex) => (
                    <div key={yIndex} className="flex mb-1">
                        <div className="w-20 text-xs text-gray-500 font-medium flex items-center justify-end pr-3">{yLabel}</div>
                        <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${xLabels.length}, 1fr)` }}>
                            {data[yIndex].map((value, xIndex) => (
                                <div
                                    key={xIndex}
                                    className="h-10 rounded hover:ring-2 ring-blue-400 transition-all relative group cursor-default"
                                    style={{
                                        backgroundColor: colorScale[1],
                                        opacity: getOpacity(value, maxValue)
                                    }}
                                >
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                                        {yLabel}, {xLabels[xIndex]}: <strong>{value}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
