import Dashboard from '../pages/admin/Dashboard';
import Verify from '../pages/admin/Verify';
import Upload from '../pages/admin/Upload';
import Registry from '../pages/admin/Registry';
import Users from '../pages/admin/Users';
import Security from '../pages/admin/Security';
import Settings from '../pages/admin/Settings';
import AuditLogs from '../pages/admin/AuditLogs';
import Tickets from '../pages/admin/Tickets';
import ProfilePage from '../components/ProfilePage';
import { mockProfiles } from '../mock';

const adminRoutes = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'verify', element: <Verify /> },
  { path: 'upload', element: <Upload /> },
  { path: 'registry', element: <Registry /> },
  { path: 'users', element: <Users /> },
  { path: 'security', element: <Security /> },
  { path: 'settings', element: <Settings /> },
  { path: 'audit-logs', element: <AuditLogs /> },
  { path: 'tickets', element: <Tickets /> },
  { path: 'profile', element: <ProfilePage initialProfile={mockProfiles.admin} /> },
  { path: '', element: <Dashboard /> }
];

export default adminRoutes;