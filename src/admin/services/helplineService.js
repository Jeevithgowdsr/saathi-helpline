import { db } from '../../firebase';
import {
    collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp
} from 'firebase/firestore';

const COLLECTION = 'helplines';

/**
 * Fetch all helplines
 */
export const getHelplines = async () => {
    try {
        const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching helplines:", error);
        throw error;
    }
};

/**
 * Add a new helpline
 */
export const addHelpline = async (data) => {
    try {
        const payload = {
            ...data,
            isVerified: false,
            isPromoted: false,
            isActive: true,
            authenticityScore: data.authenticityScore || 50, // Default score
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        await addDoc(collection(db, COLLECTION), payload);
    } catch (error) {
        console.error("Error adding helpline:", error);
        throw error;
    }
};

/**
 * Update an existing helpline
 */
export const updateHelpline = async (id, data) => {
    try {
        const docRef = doc(db, COLLECTION, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating helpline:", error);
        throw error;
    }
};

/**
 * Delete a helpline
 */
export const deleteHelpline = async (id) => {
    try {
        await deleteDoc(doc(db, COLLECTION, id));
    } catch (error) {
        console.error("Error deleting helpline:", error);
        throw error;
    }
};

/**
 * Toggle Verification Status
 */
export const toggleVerification = async (id, currentStatus) => {
    try {
        const docRef = doc(db, COLLECTION, id);
        await updateDoc(docRef, {
            isVerified: !currentStatus,
            authenticityScore: !currentStatus ? 100 : 50, // Boost score if verified
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error toggling verification:", error);
        throw error;
    }
};

/**
 * Toggle Promotion Status
 */
export const togglePromotion = async (id, currentStatus) => {
    try {
        const docRef = doc(db, COLLECTION, id);
        await updateDoc(docRef, {
            isPromoted: !currentStatus,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error toggling promotion:", error);
        throw error;
    }
};

/**
 * Toggle Active Status (Deactivate/Activate)
 */
export const toggleActive = async (id, currentStatus) => {
    try {
        const docRef = doc(db, COLLECTION, id);
        await updateDoc(docRef, {
            isActive: !currentStatus,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error toggling active status:", error);
        throw error;
    }
};
