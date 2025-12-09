import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ML_API_URL } from '../config';
import L from 'leaflet';
import 'leaflet.heat';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom Icons with larger touch targets and better visibility
const createIcon = (url, size = [40, 40], className = '') => new L.Icon({
    iconUrl: url,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]], // Center bottom
    popupAnchor: [0, -size[1]],
    className: className
});

const userIcon = createIcon('https://cdn-icons-png.flaticon.com/512/149/149071.png', [45, 45], 'animate-pulse drop-shadow-lg');

const serviceIcons = {
    police: createIcon('https://cdn-icons-png.flaticon.com/512/2560/2560416.png'),
    hospital: createIcon('https://cdn-icons-png.flaticon.com/512/4320/4320371.png'),
    fire_station: createIcon('https://cdn-icons-png.flaticon.com/512/921/921067.png'),
    women_safety: createIcon('https://cdn-icons-png.flaticon.com/512/942/942748.png'),
    child_helpline: createIcon('https://cdn-icons-png.flaticon.com/512/2919/2919600.png'),
    default: createIcon('https://cdn-icons-png.flaticon.com/512/684/684908.png')
};

function MapUpdater({ center, zoom, trigger }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, zoom || 14, { duration: 1.5 });
    }, [center, zoom, map, trigger]);
    return null;
}

function HeatmapLayer({ points }) {
    const map = useMap();
    useEffect(() => {
        if (!points || points.length === 0) return;

        const heat = L.heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            max: 1.0,
            gradient: {
                0.4: 'blue',
                0.6: 'cyan',
                0.7: 'lime',
                0.8: 'yellow',
                1.0: 'red'
            }
        }).addTo(map);

        return () => {
            map.removeLayer(heat);
        };
    }, [points, map]);

    return null;
}

export function EmergencyMap() {
    const [userLocation, setUserLocation] = useState(null);
    const [nearbyServices, setNearbyServices] = useState([]);
    const [heatmapPoints, setHeatmapPoints] = useState([]);
    const [route, setRoute] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [mapZoom, setMapZoom] = useState(14);
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    // Hardcoded fallback data for major hubs (in case cache is empty)
    const FALLBACK_DATA = [
        { type: 'police', name: 'Central Police Station', coordinates: { lat: 12.9716, lon: 77.5946 }, number: '100' },
        { type: 'hospital', name: 'City General Hospital', coordinates: { lat: 12.9720, lon: 77.5950 }, number: '108' },
        { type: 'fire_station', name: 'Main Fire Station', coordinates: { lat: 12.9740, lon: 77.5970 }, number: '101' }
    ];

    // Detect dark mode
    useEffect(() => {
        const checkDarkMode = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Offline detection
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        locateUser();
    }, [isOffline]); // Re-run when connectivity changes

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(2);
    };

    const [recenterTrigger, setRecenterTrigger] = useState(0);

    const locateUser = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const newLoc = [latitude, longitude];
                    setUserLocation(newLoc);
                    setRecenterTrigger(prev => prev + 1); // Force map update

                    if (navigator.onLine) {
                        fetchNearbyServices(latitude, longitude);
                        fetchHeatmapData(latitude, longitude);
                    } else {
                        loadOfflineServices(latitude, longitude);
                    }
                },
                (err) => {
                    console.error("Location denied", err);
                    // Fallback to Bangalore
                    const fallback = [12.9716, 77.5946];
                    setUserLocation(fallback);
                    setRecenterTrigger(prev => prev + 1);
                    if (navigator.onLine) {
                        fetchNearbyServices(fallback[0], fallback[1]);
                        fetchHeatmapData(fallback[0], fallback[1]);
                    } else {
                        loadOfflineServices(fallback[0], fallback[1]);
                    }
                },
                { enableHighAccuracy: true }
            );
        }
    };

    const loadOfflineServices = (lat, lon) => {
        console.log("⚠️ Offline Mode: Loading cached data");
        const cached = localStorage.getItem('cached_services');
        let services = cached ? JSON.parse(cached) : FALLBACK_DATA;

        // Recalculate distances locally
        services = services.map(s => ({
            ...s,
            distance_km: calculateDistance(lat, lon, s.coordinates.lat, s.coordinates.lon),
            availability_status: "Offline Info"
        })).sort((a, b) => a.distance_km - b.distance_km);

        setNearbyServices(services);
        setLoading(false);
    };

    const fetchNearbyServices = async (lat, lon) => {
        try {
            const res = await fetch(`${ML_API_URL}/nearby`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token' // Add mock token
                },
                body: JSON.stringify({ lat, lon })
            });
            if (!res.ok) throw new Error('Failed to fetch services');
            const geojson = await res.json();

            // Parse GeoJSON to internal format
            const servicesArray = geojson.features.map(f => ({
                type: f.properties.type,
                name: f.properties.name,
                coordinates: { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] },
                distance_km: f.properties.distance_km,
                rating: f.properties.rating,
                availability_status: f.properties.availability
            }));

            // Cache for offline use
            localStorage.setItem('cached_services', JSON.stringify(servicesArray));

            setNearbyServices(servicesArray);
            setLoading(false);
        } catch (err) {
            console.error(err);
            // If fetch fails (e.g. server down), try offline mode
            loadOfflineServices(lat, lon);
        }
    };

    const fetchHeatmapData = async (lat, lon) => {
        if (!navigator.onLine) return; // Skip heatmap in offline mode
        try {
            const res = await fetch(`${ML_API_URL}/heatmap`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token'
                },
                body: JSON.stringify({ lat, lon })
            });
            if (!res.ok) throw new Error('Failed to fetch heatmap');
            const geojson = await res.json();

            // Parse GeoJSON: [lat, lon, intensity]
            const points = geojson.features.map(f => [
                f.geometry.coordinates[1],
                f.geometry.coordinates[0],
                f.properties.intensity
            ]);
            setHeatmapPoints(points);
        } catch (err) {
            console.error(err);
        }
    };

    const handleNavigate = async (service) => {
        setSelectedService(service);
        try {
            const res = await fetch(`${ML_API_URL}/route`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token'
                },
                body: JSON.stringify({
                    start_lat: userLocation[0],
                    start_lon: userLocation[1],
                    end_lat: service.coordinates.lat,
                    end_lon: service.coordinates.lon,
                    mode: 'driving'
                })
            });
            const geojson = await res.json();

            // Parse GeoJSON LineString to Leaflet Polyline [[lat, lon], ...]
            // GeoJSON is [lon, lat], Leaflet wants [lat, lon]
            const polyline = geojson.geometry.coordinates.map(c => [c[1], c[0]]);

            setRoute({
                polyline: polyline,
                total_distance: geojson.properties.total_distance,
                total_time: geojson.properties.total_time
            });
            // Zoom out to fit route (simplified)
            setMapZoom(12);
        } catch (err) {
            console.error("Routing failed", err);
        }
    };

    if (loading) return (
        <div className="w-full max-w-6xl mx-auto mt-12 h-[500px] flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse">
            <div className="text-4xl mb-4">🗺️</div>
            <div className="text-gray-500 font-medium">Locating nearest help...</div>
        </div>
    );

    // Tile Layer URL based on theme
    const tileUrl = isDarkMode
        ? "https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" // Hybrid (Satellite + Labels) for Dark Mode
        : "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"; // Standard Roadmap for Light Mode

    const subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];

    return (
        <div className="w-full max-w-6xl mx-auto mt-12 px-4 mb-20">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <span className={`p-2 rounded-lg ${isOffline ? 'bg-orange-100 dark:bg-orange-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
                        {isOffline ? '⚠️' : '🗺️'}
                    </span>
                    {isOffline ? 'Offline Emergency Map' : 'Live Emergency Map'}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all text-sm font-bold border border-gray-100 dark:border-gray-700 ${showHeatmap ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                    >
                        <span>🔥</span> {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
                    </button>
                    <button
                        onClick={locateUser}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-full shadow-md hover:shadow-lg transition-all text-sm font-bold border border-gray-100 dark:border-gray-700"
                    >
                        <span>📍</span> Recenter
                    </button>
                </div>
            </div>



            {
                isOffline && (
                    <div className="mb-4 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-r-xl animate-fadeIn">
                        <div className="flex items-center gap-3">
                            <div className="text-2xl">📡</div>
                            <div>
                                <h4 className="font-bold text-orange-800 dark:text-orange-200">You are offline</h4>
                                <p className="text-sm text-orange-700 dark:text-orange-300">Showing cached locations. Some features like live traffic and heatmaps are unavailable.</p>
                            </div>
                        </div>
                    </div>
                )
            }

            <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700 ring-1 ring-gray-200 dark:ring-gray-800">
                <MapContainer center={userLocation} zoom={mapZoom} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer
                        url={tileUrl}
                        subdomains={subdomains}
                        attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                    />

                    <MapUpdater center={userLocation} zoom={mapZoom} trigger={recenterTrigger} />

                    {showHeatmap && <HeatmapLayer points={heatmapPoints} />}

                    {/* User Marker */}
                    {userLocation && (
                        <Marker position={userLocation} icon={userIcon}>
                            <Popup className="custom-popup">
                                <div className="text-center font-bold text-gray-800">You are here</div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Service Markers */}
                    {nearbyServices.map((service, idx) => (
                        <Marker
                            key={idx}
                            position={[service.coordinates.lat, service.coordinates.lon]}
                            icon={serviceIcons[service.type] || serviceIcons.default}
                            eventHandlers={{
                                click: () => {
                                    // Optional: Auto-navigate on click if desired, or just show popup
                                }
                            }}
                        >
                            <Popup className="custom-popup">
                                <div className="p-1 min-w-[160px]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{service.type.replace('_', ' ')}</span>
                                        <span className="text-xs font-bold text-green-600">{service.availability_status}</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{service.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                        <span>📍 {service.distance_km} km</span>
                                        <span>⭐ {service.rating}</span>
                                    </div>

                                    <button
                                        onClick={() => handleNavigate(service)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                                    >
                                        <span>Navigate</span>
                                        <span>➔</span>
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Route Polyline */}
                    {route && (
                        <>
                            {/* Outer glow for visibility */}
                            <Polyline
                                positions={route.polyline}
                                color={isDarkMode ? "#60a5fa" : "#2563eb"}
                                weight={8}
                                opacity={0.4}
                            />
                            {/* Inner line */}
                            <Polyline
                                positions={route.polyline}
                                color={isDarkMode ? "#93c5fd" : "#3b82f6"}
                                weight={4}
                                opacity={1}
                                dashArray="10, 10"
                            />
                        </>
                    )}
                </MapContainer>

                {/* Navigation Overlay */}
                {route && selectedService && (
                    <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-gray-900/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl z-[1000] flex items-center justify-between animate-fadeInUp border border-white/20">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-xl text-2xl">
                                🚗
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-white text-lg">Navigating to {selectedService.name}</h4>
                                <div className="flex gap-4 text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                                    <span className="flex items-center gap-1">🏁 {route.total_distance}</span>
                                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">⏱️ {route.total_time}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setRoute(null);
                                setMapZoom(14);
                            }}
                            className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-bold text-sm"
                        >
                            End Navigation
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
}
