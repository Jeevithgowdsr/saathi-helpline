import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

export function AdminLayout() {
    const { role } = useAdminAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/admin/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-2xl font-bold text-blue-400">Saathi Admin</h1>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{role}</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavLink to="/admin/dashboard" icon="📊" label="Dashboard" />

                    {(role === 'admin' || role === 'super-admin') && (
                        <>
                            <div className="pt-4 pb-2 text-xs text-gray-500 font-bold uppercase">Management</div>
                            <NavLink to="/admin/helplines" icon="📞" label="Helplines" />
                            <NavLink to="/admin/agencies" icon="🏢" label="Agencies" />
                            <NavLink to="/admin/logs" icon="🛡️" label="Audit Logs" />
                        </>
                    )}

                    <div className="pt-4 pb-2 text-xs text-gray-500 font-bold uppercase">Operations</div>
                    <NavLink to="/admin/agency-dashboard" icon="🖥️" label="Command Center" />
                    <NavLink to="/admin/analytics" icon="📈" label="Analytics" />
                    <NavLink to="/admin/alerts" icon="📢" label="Alerts" />
                    <NavLink to="/admin/reports" icon="📝" label="User Reports" />

                    {role === 'super-admin' && (
                        <>
                            <div className="pt-4 pb-2 text-xs text-gray-500 font-bold uppercase">System</div>
                            <NavLink to="/admin/users" icon="👥" label="User Roles" />
                            <NavLink to="/admin/logs" icon="📜" label="Audit Logs" />
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-gray-800 rounded transition-colors"
                    >
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <Outlet />
            </main>
        </div>
    );
}

function NavLink({ to, icon, label }) {
    return (
        <Link
            to={to}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-all"
        >
            <span className="text-xl">{icon}</span>
            <span className="font-medium">{label}</span>
        </Link>
    );
}
