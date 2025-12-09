import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainApp } from './MainApp';
import { AdminAuthProvider } from './admin/context/AdminAuth';
import { AdminLogin } from './admin/pages/AdminLogin';
import { AdminLayout } from './admin/components/AdminLayout';
import { Dashboard } from './admin/pages/Dashboard';
import { RoleRoute } from './admin/components/RoleRoute';

import { AgencyDashboard } from './admin/pages/AgencyDashboard';
import { AdvancedAnalytics } from './admin/components/AdvancedAnalytics';
import { HelplineManager } from './admin/pages/HelplineManager';
import { AlertManager } from './admin/pages/AlertManager';
import { ReportManager } from './admin/pages/ReportManager';
import { AuditLogs } from './admin/pages/AuditLogs';

function App() {
  return (
    <Router>
      <AdminAuthProvider>
        <Routes>
          {/* Public App Route */}
          <Route path="/" element={<MainApp />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/admin" element={
            <RoleRoute allowedRoles={['admin', 'super-admin', 'agency-officer']}>
              <AdminLayout />
            </RoleRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="agency-dashboard" element={<AgencyDashboard />} />
            <Route path="analytics" element={<AdvancedAnalytics />} />
            <Route path="helplines" element={<HelplineManager />} />
            <Route path="alerts" element={<AlertManager />} />
            <Route path="reports" element={<ReportManager />} />
            <Route path="logs" element={<AuditLogs />} />
          </Route>
        </Routes>
      </AdminAuthProvider>
    </Router>
  );
}

export default App;
