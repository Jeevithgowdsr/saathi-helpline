import { db } from '../../firebase';
import { ML_API_URL } from '../../config';
import {
    collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, where, serverTimestamp, Timestamp
} from 'firebase/firestore';

const COLLECTION = 'alerts';

/**
 * Fetch all alerts (optionally filter by status)
 */
export const getAlerts = async () => {
    try {
        const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching alerts:", error);
        throw error;
    }
};

/**
 * Create and Broadcast an Alert
 */
export const createAlert = async (data) => {
    try {
        const payload = {
            ...data,
            status: 'active', // or 'scheduled' if scheduledAt is future
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // 1. Save to Firestore
        const docRef = await addDoc(collection(db, COLLECTION), payload);

        // 2. Trigger Notifications (Mock/Real)
        await triggerBroadcast(payload);

        return docRef.id;
    } catch (error) {
        console.error("Error creating alert:", error);
        throw error;
    }
};

/**
 * Delete an alert
 */
export const deleteAlert = async (id) => {
    try {
        await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
        console.error("Error deleting alert:", error);
        throw error;
    }
};

/**
 * Trigger Broadcast Logic (Push + SMS)
 */
const triggerBroadcast = async (alertData) => {
    console.log("Broadcasting Alert:", alertData);

    // 1. SMS Fallback (using our Python Backend)
    if (alertData.channels.includes('sms')) {
        try {
            // In a real app, we'd fetch users in the 'region' and loop through them.
            // Here we simulate sending to a generic list or the '112' simulation endpoint.
            await fetch(`${ML_API_URL}/send-sms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: "BROADCAST_LIST", // Backend would handle this special case or we loop here
                    message: `[${alertData.severity.toUpperCase()} ALERT]: ${alertData.title} - ${alertData.body}. Region: ${alertData.region}`
                })
            });
        } catch (e) {
            console.error("SMS Broadcast failed", e);
        }
    }

    // 2. Push Notification (Simulated)
    if (alertData.channels.includes('push')) {
        // This would typically use Firebase Cloud Messaging (FCM) Admin SDK on the backend
        // triggered by the Firestore write (Cloud Function).
        // Since we are frontend-only for this logic right now:
        console.log("Push Notification sent to topic:", `region_${alertData.region}`);
    }
};

/**
 * Check for expired alerts and update status
 * (This should ideally be a scheduled Cloud Function)
 */
export const checkExpirations = async () => {
    // Frontend implementation for demo
    const now = new Date();
    const q = query(collection(db, COLLECTION), where('status', '==', 'active'));
    const snapshot = await getDocs(q);

    snapshot.docs.forEach(async (d) => {
        const data = d.data();
        if (data.expiresAt && new Date(data.expiresAt) < now) {
            await updateDoc(doc(db, COLLECTION, d.id), { status: 'expired' });
        }
    });
};
