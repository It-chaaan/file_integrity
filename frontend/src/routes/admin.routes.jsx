import Dashboard from '../pages/admin/Dashboard';
import Users from '../pages/admin/Users';
import Security from '../pages/admin/Security';
import AuditLogs from '../pages/admin/AuditLogs';
import Tickets from '../pages/admin/Tickets';
import ProfilePage from '../components/ProfilePage';

const adminRoutes = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'users', element: <Users /> },
  { path: 'security', element: <Security /> },
  { path: 'audit-logs', element: <AuditLogs /> },
  { path: 'tickets', element: <Tickets /> },
  { path: 'profile', element: <ProfilePage /> },
  { path: '', element: <Dashboard /> }
];

export default adminRoutes;