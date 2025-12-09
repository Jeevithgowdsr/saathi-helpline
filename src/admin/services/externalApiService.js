/**
 * Service to fetch external alerts from various agencies
 * Refreshes data every 15 minutes
 */

// 1. Weather Alerts (OpenMeteo - Real API)
export const fetchWeatherAlerts = async (lat = 12.9716, lon = 77.5946) => {
    try {
        // Using OpenMeteo for current weather as a proxy for alerts in this demo
        // In production, use a dedicated severe weather API like NWS or IMD
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=precipitation_sum,windspeed_10m_max`);
        const data = await response.json();

        const alerts = [];
        const weather = data.current_weather;

        // Simple logic to generate "Alerts" based on real data
        if (weather.windspeed > 50) {
            alerts.push({
                id: `w-${Date.now()}`,
                source: 'IMD / OpenMeteo',
                type: 'weather',
                severity: 'high',
                title: 'High Wind Warning',
                description: `Wind speeds reaching ${weather.windspeed} km/h detected.`,
                timestamp: new Date().toISOString()
            });
        }

        // Mocking a rain alert for demo purposes if real data isn't extreme
        if (Math.random() > 0.7) {
            alerts.push({
                id: `w-mock-${Date.now()}`,
                source: 'IMD',
                type: 'weather',
                severity: 'medium',
                title: 'Heavy Rainfall Expected',
                description: 'Moderate to heavy rainfall expected in the next 24 hours.',
                timestamp: new Date().toISOString()
            });
        }

        return alerts;
    } catch (error) {
        console.error("Weather API Error:", error);
        return [];
    }
};

// 2. Disaster Alerts (Mock - Simulating GDACS/NDRF)
export const fetchDisasterAlerts = async () => {
    // Simulate API latency
    await new Promise(r => setTimeout(r, 800));

    // Return mock data
    return [
        {
            id: `d-1`,
            source: 'NDRF',
            type: 'disaster',
            severity: 'critical',
            title: 'Earthquake Warning (Mock)',
            description: 'Magnitude 4.2 earthquake detected in North Karnataka region.',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 mins ago
        }
    ];
};

// 3. Cybercrime Alerts (Mock - Simulating CERT-In)
export const fetchCyberAlerts = async () => {
    await new Promise(r => setTimeout(r, 600));

    return [
        {
            id: `c-1`,
            source: 'CERT-In',
            type: 'cyber',
            severity: 'high',
            title: 'Phishing Campaign Alert',
            description: 'New SMS phishing campaign targeting banking users detected.',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
        }
    ];
};

/**
 * Aggregator function
 */
export const fetchAllExternalAlerts = async () => {
    const [weather, disaster, cyber] = await Promise.all([
        fetchWeatherAlerts(),
        fetchDisasterAlerts(),
        fetchCyberAlerts()
    ]);

    return [...disaster, ...weather, ...cyber].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};
