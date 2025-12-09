import { db } from '../../firebase';
import {
    collection, addDoc, getDocs, query, orderBy, where, serverTimestamp, limit
} from 'firebase/firestore';

const COLLECTION = 'admin_logs';

/**
 * Record an audit log entry
 * @param {string} userId - ID of the admin performing the action
 * @param {string} action - Action type (e.g., 'CREATE_HELPLINE', 'BROADCAST_ALERT')
 * @param {string} module - Module name (e.g., 'HELPLINES', 'ALERTS', 'INCIDENTS')
 * @param {object} details - Additional metadata (e.g., target ID, changes)
 * @param {string} severity - 'info', 'warning', 'critical'
 */
export const logAudit = async (userId, action, module, details = {}, severity = 'info') => {
    try {
        await addDoc(collection(db, COLLECTION), {
            userId,
            action,
            module,
            details,
            severity,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent
        });
    } catch (error) {
        console.error("Failed to write audit log:", error);
        // Don't throw, as logging failure shouldn't block the main action
    }
};

/**
 * Fetch audit logs with optional filtering
 */
export const getAuditLogs = async (limitCount = 100, filterModule = 'all') => {
    try {
        let q = query(collection(db, COLLECTION), orderBy('timestamp', 'desc'), limit(limitCount));

        if (filterModule !== 'all') {
            q = query(
                collection(db, COLLECTION),
                where('module', '==', filterModule),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return [];
    }
};
