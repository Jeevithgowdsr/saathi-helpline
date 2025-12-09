import React from 'react';

export function CrisisHeatmap() {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Live Crisis Heatmap</h3>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-red-500"></div> High Density</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Med Density</span>
                </div>
            </div>

            {/* Placeholder for Map - In a real app, use Google Maps or Leaflet */}
            <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden group">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Bangalore_map.png')] bg-cover bg-center opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500"></div>

                {/* Simulated Heat Points */}
                <div className="absolute top-1/4 left-1/3 w-24 h-24 bg-red-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-red-600 rounded-full blur-xl opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-yellow-500 rounded-full blur-xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>

                {/* Interactive Pins */}
                <div className="absolute top-[28%] left-[36%] w-4 h-4 bg-red-600 border-2 border-white rounded-full shadow-lg cursor-pointer hover:scale-125 transition-transform" title="Critical Incident: Fire"></div>
                <div className="absolute bottom-[36%] right-[27%] w-4 h-4 bg-red-600 border-2 border-white rounded-full shadow-lg cursor-pointer hover:scale-125 transition-transform" title="Critical Incident: Accident"></div>

                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-mono shadow">
                    Lat: 12.9716° N, Lon: 77.5946° E
                </div>
            </div>
        </div>
    );
}
