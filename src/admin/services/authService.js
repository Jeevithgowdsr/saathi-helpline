import { auth, db } from '../../firebase';
import {
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from 'firebase/auth';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

const LOGS_COLLECTION = 'admin_logs';

/**
 * Log admin activity to Firestore
 */
export const logActivity = async (userId, action, details = {}) => {
    try {
        await addDoc(collection(db, LOGS_COLLECTION), {
            userId,
            action,
            details,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
};

/**
 * Login with Email/Password
 * Returns user object if successful
 */
export const loginAdmin = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch role to ensure it's an admin
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        if (!userData || !['admin', 'super-admin', 'agency-officer'].includes(userData.role)) {
            await firebaseSignOut(auth);
            throw new Error("Unauthorized access");
        }

        return { user, role: userData.role };
    } catch (error) {
        throw error;
    }
};

/**
 * Logout
 */
export const logoutAdmin = async (userId) => {
    if (userId) await logActivity(userId, 'LOGOUT', { type: 'manual' });
    await firebaseSignOut(auth);
};

/**
 * Verify 2FA Code (Simulated for Demo / Placeholder for Firebase MFA)
 * In production, use Firebase MultiFactorUser.enroll() and resolver.resolveSignIn()
 */
export const verify2FA = async (verificationId, code) => {
    // This is a placeholder. Real implementation requires Firebase MFA setup in Console.
    // For this demo, we'll accept a specific mock code '123456' or verify against a backend.

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (code === '123456') {
                resolve(true);
            } else {
                reject(new Error("Invalid 2FA Code"));
            }
        }, 1000);
    });
};

/**
 * Check Session Timeout
 * Returns true if session is valid, false if expired
 */
export const checkSessionValidity = (lastActivityTimestamp, timeoutDuration = 30 * 60 * 1000) => {
    const now = Date.now();
    return (now - lastActivityTimestamp) < timeoutDuration;
};
