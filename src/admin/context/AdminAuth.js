import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { logActivity, logoutAdmin } from '../services/authService';

const AdminAuthContext = createContext();

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function AdminAuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastActivity, setLastActivity] = useState(Date.now());

    // Activity Monitor
    useEffect(() => {
        const updateActivity = () => setLastActivity(Date.now());

        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);
        window.addEventListener('click', updateActivity);

        return () => {
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keydown', updateActivity);
            window.removeEventListener('click', updateActivity);
        };
    }, []);

    // Session Timeout Checker
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            const now = Date.now();
            if (now - lastActivity > SESSION_TIMEOUT_MS) {
                handleSessionTimeout();
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [user, lastActivity]);

    const handleSessionTimeout = async () => {
        if (user) {
            console.log("Session timed out");
            await logActivity(user.uid, 'SESSION_TIMEOUT');
            await logoutAdmin(user.uid);
            setUser(null);
            setRole(null);
            alert("Session expired due to inactivity. Please login again.");
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        // Verify role is allowed
                        if (['admin', 'super-admin', 'agency-officer'].includes(userData.role)) {
                            setUser(currentUser);
                            setRole(userData.role);
                        } else {
                            // Unauthorized role trying to access admin
                            await logoutAdmin();
                            setUser(null);
                            setRole(null);
                        }
                    } else {
                        // No user doc found
                        await logoutAdmin();
                    }
                } catch (error) {
                    console.error("Error fetching admin role:", error);
                    setUser(null);
                    setRole(null);
                }
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const hasRole = (allowedRoles) => {
        if (!role) return false;
        return allowedRoles.includes(role);
    };

    return (
        <AdminAuthContext.Provider value={{ user, role, loading, hasRole }}>
            {!loading && children}
        </AdminAuthContext.Provider>
    );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
