import { db } from '../../firebase';
import {
    collection, addDoc, updateDoc, doc, getDocs, query, orderBy, where, serverTimestamp
} from 'firebase/firestore';

const COLLECTION = 'reports';

/**
 * Fetch reports, optionally filtered by status
 */
export const getReports = async (statusFilter = 'all') => {
    try {
        let q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));

        if (statusFilter !== 'all') {
            q = query(collection(db, COLLECTION), where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching reports:", error);
        throw error;
    }
};

/**
 * Create a new user report (Fake/Abusive Number)
 */
export const createReport = async (data, userId) => {
    try {
        const payload = {
            ...data,
            userId: userId,
            status: 'pending', // pending, verified, rejected, resolved
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            adminNotes: ''
        };
        await addDoc(collection(db, COLLECTION), payload);
    } catch (error) {
        console.error("Error creating report:", error);
        throw error;
    }
};

/**
 * Update report status (Admin Action)
 */
export const updateReportStatus = async (id, status, notes = '') => {
    try {
        const docRef = doc(db, COLLECTION, id);
        await updateDoc(docRef, {
            status: status,
            adminNotes: notes,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating report:", error);
        throw error;
    }
};

/**
 * Resolve Report & Take Action
 * e.g., If verified fake, we might want to flag the number in a blacklist (future feature)
 */
export const resolveReport = async (id, action, notes) => {
    try {
        // In a real app, 'action' might trigger a cloud function to ban the number
        // or remove the helpline from the 'helplines' collection.

        await updateReportStatus(id, 'resolved', `Action taken: ${action}. ${notes}`);
    } catch (error) {
        console.error("Error resolving report:", error);
        throw error;
    }
};
