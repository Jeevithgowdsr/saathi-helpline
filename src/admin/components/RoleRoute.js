import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuth';

export function RoleRoute({ children, allowedRoles }) {
    const { user, role, loading, hasRole } = useAdminAuth();

    if (loading) return <div className="p-10 text-center">Loading Admin Panel...</div>;

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    if (!hasRole(allowedRoles)) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
                <p className="text-gray-600">You do not have permission to view this page.</p>
                <p className="text-sm text-gray-500 mt-2">Required: {allowedRoles.join(', ')}</p>
                <button
                    onClick={() => window.history.back()}
                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return children;
}
