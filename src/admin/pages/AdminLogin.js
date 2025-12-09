import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin, verify2FA, logActivity } from '../services/authService';

export function AdminLogin() {
    const [step, setStep] = useState(1); // 1: Credentials, 2: 2FA
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [tempUser, setTempUser] = useState(null); // Store user temporarily until 2FA

    const navigate = useNavigate();

    const handleCredentialsSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // 1. Validate Credentials
            const { user, role } = await loginAdmin(email, password);
            setTempUser({ user, role });

            // 2. Move to 2FA Step
            // In a real app, we would trigger the SMS/Email code send here
            setStep(2);
        } catch (err) {
            setError(err.message || "Invalid credentials");
        }
        setLoading(false);
    };

    const handle2FASubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // 3. Verify OTP
            await verify2FA(tempUser.user.uid, otp);

            // 4. Log Success
            await logActivity(tempUser.user.uid, 'LOGIN_SUCCESS', { role: tempUser.role });

            // 5. Navigate
            navigate('/admin/dashboard');
        } catch (err) {
            setError("Invalid 2FA Code. Try '123456' for demo.");
            await logActivity(tempUser.user.uid, 'LOGIN_FAILED_2FA');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
                {/* Decorative Top Bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Saathi Admin</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {step === 1 ? 'Secure Access Portal' : 'Two-Factor Authentication'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-6 text-sm flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="admin@saathi.org"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? 'Verifying...' : 'Continue →'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handle2FASubmit} className="space-y-6 animate-fadeIn">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                                🛡️
                            </div>
                            <p className="text-sm text-gray-600 mb-6">
                                Enter the 6-digit verification code sent to your device.
                                <br /><span className="text-xs text-gray-400">(Demo Code: 123456)</span>
                            </p>
                        </div>

                        <div>
                            <input
                                type="text"
                                required
                                maxLength="6"
                                className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all transform active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-500/30"
                        >
                            {loading ? 'Authenticating...' : 'Verify & Login'}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setStep(1); setError(''); }}
                            className="w-full text-sm text-gray-500 hover:text-gray-700"
                        >
                            ← Back to Login
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        Protected by Saathi Security System v1.0
                    </p>
                </div>
            </div>
        </div>
    );
}
