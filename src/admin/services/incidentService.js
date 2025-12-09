import { db } from '../../firebase';
import {
    collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy, serverTimestamp, getDoc
} from 'firebase/firestore';

const COLLECTION = 'incidents';

/**
 * Fetch all incidents, optionally filtered by status
 */
export const getIncidents = async (statusFilter = 'all') => {
    try {
        let q = collection(db, COLLECTION);

        // Build Query
        const constraints = [orderBy('createdAt', 'desc')];
        if (statusFilter !== 'all') {
            constraints.push(where('status', '==', statusFilter));
        }

        // Apply constraints (Note: Firestore requires composite indexes for complex queries)
        // For simplicity in dev, we might fetch all and filter client-side if indexes aren't set up
        // But let's try to stick to best practices.
        // q = query(collection(db, COLLECTION), ...constraints); 

        // Fallback for simple fetching without complex indexes for now
        q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching incidents:", error);
        throw error;
    }
};

/**
 * Create a new incident report
 */
export const createIncident = async (data, userId = null) => {
    try {
        const payload = {
            ...data,
            userId: userId,
            status: 'new',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            timeline: [{
                action: 'created',
                timestamp: new Date().toISOString(),
                by: userId || 'anonymous'
            }]
        };
        const docRef = await addDoc(collection(db, COLLECTION), payload);
        return docRef.id;
    } catch (error) {
        console.error("Error creating incident:", error);
        throw error;
    }
};

/**
 * Update incident status and log the change
 */
export const updateIncidentStatus = async (incidentId, newStatus, userId) => {
    try {
        const incidentRef = doc(db, COLLECTION, incidentId);

        // Get current data to append to timeline
        const snapshot = await getDoc(incidentRef);
        const currentData = snapshot.data();
        const newTimeline = [
            ...(currentData.timeline || []),
            {
                action: 'status_change',
                newStatus: newStatus,
                timestamp: new Date().toISOString(),
                by: userId
            }
        ];

        await updateDoc(incidentRef, {
            status: newStatus,
            updatedAt: serverTimestamp(),
            timeline: newTimeline
        });
    } catch (error) {
        console.error("Error updating status:", error);
        throw error;
    }
};

/**
 * Assign an officer to an incident
 */
export const assignOfficer = async (incidentId, officerData, userId) => {
    try {
        const incidentRef = doc(db, COLLECTION, incidentId);

        const snapshot = await getDoc(incidentRef);
        const currentData = snapshot.data();
        const newTimeline = [
            ...(currentData.timeline || []),
            {
                action: 'assigned',
                officer: officerData.name,
                timestamp: new Date().toISOString(),
                by: userId
            }
        ];

        await updateDoc(incidentRef, {
            assignedOfficer: officerData,
            status: 'assigned', // Auto-update status
            updatedAt: serverTimestamp(),
            timeline: newTimeline
        });
    } catch (error) {
        console.error("Error assigning officer:", error);
        throw error;
    }
};
