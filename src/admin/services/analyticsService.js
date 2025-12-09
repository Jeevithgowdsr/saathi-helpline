import { db } from '../../firebase';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';

const COLLECTION = 'incidents';

/**
 * Fetch and aggregate analytics data
 * @param {string} timeRange - '24h', '7d', '30d'
 */
export const getAnalyticsData = async (timeRange = '7d') => {
    try {
        // Calculate start date based on range
        const now = new Date();
        let startDate = new Date();
        if (timeRange === '24h') startDate.setHours(now.getHours() - 24);
        else if (timeRange === '7d') startDate.setDate(now.getDate() - 7);
        else if (timeRange === '30d') startDate.setDate(now.getDate() - 30);

        // Fetch incidents within range
        // Note: Requires composite index on status + createdAt if filtering by status too
        // For analytics, we usually want ALL incidents in the timeframe
        const q = query(
            collection(db, COLLECTION),
            where('createdAt', '>=', Timestamp.fromDate(startDate)),
            orderBy('createdAt', 'asc')
        );

        const snapshot = await getDocs(q);
        const incidents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return processAnalytics(incidents);
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return null;
    }
};

/**
 * Process raw incident data into chart-friendly formats
 */
const processAnalytics = (incidents) => {
    const crisisCounts = {};
    const hourlyDistribution = new Array(24).fill(0);
    const regionCounts = {};
    const responseTimes = []; // In minutes
    let falseReports = 0;

    incidents.forEach(inc => {
        // 1. Crisis Types
        const type = inc.type || 'Unknown';
        crisisCounts[type] = (crisisCounts[type] || 0) + 1;

        // 2. Peak Hours
        if (inc.createdAt) {
            const date = inc.createdAt.toDate ? inc.createdAt.toDate() : new Date(inc.createdAt);
            const hour = date.getHours();
            hourlyDistribution[hour]++;
        }

        // 3. Region-wise (Simple grouping by city/area if available, else lat/lon rounding)
        // Assuming 'location.address' or 'location.city' exists, or we group by lat/lon grid
        const region = inc.location?.city || 'Unknown Region';
        regionCounts[region] = (regionCounts[region] || 0) + 1;

        // 4. Response Rate Trends
        // Calculate time diff between 'created' and 'assigned' status in timeline
        if (inc.timeline) {
            const createdEvent = inc.timeline.find(e => e.action === 'created');
            const assignedEvent = inc.timeline.find(e => e.action === 'assigned');
            if (createdEvent && assignedEvent) {
                const start = new Date(createdEvent.timestamp);
                const end = new Date(assignedEvent.timestamp);
                const diffMins = (end - start) / 60000;
                if (diffMins > 0 && diffMins < 1440) responseTimes.push(diffMins); // Filter outliers
            }
        }

        // 5. False Reports
        if (inc.status === 'false_alarm') {
            falseReports++;
        }
    });

    // Format for Recharts
    const crisisTypeData = Object.keys(crisisCounts).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: crisisCounts[key]
    }));

    const peakHoursData = hourlyDistribution.map((count, hour) => ({
        name: `${hour}:00`,
        incidents: count
    }));

    const regionData = Object.keys(regionCounts).map(key => ({
        region: key,
        count: regionCounts[key]
    })).sort((a, b) => b.count - a.count).slice(0, 5); // Top 5 regions

    const avgResponseTime = responseTimes.length
        ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1)
        : 0;

    return {
        totalIncidents: incidents.length,
        crisisTypeData,
        peakHoursData,
        regionData,
        avgResponseTime,
        falseReportRate: ((falseReports / incidents.length) * 100).toFixed(1) || 0
    };
};
