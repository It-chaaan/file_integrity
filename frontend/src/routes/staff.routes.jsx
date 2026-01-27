import Dashboard from '../pages/staff/Dashboard';
import Verify from '../pages/staff/Verify';
import Upload from '../pages/staff/Upload';
import Registry from '../pages/staff/Registry';
import Tickets from '../pages/staff/Tickets';
import Settings from '../pages/staff/Settings';
import Report from '../pages/staff/Report';
import ProfilePage from '../components/ProfilePage';
import { mockProfiles } from '../mock';

const staffRoutes = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'verify', element: <Verify /> },
  { path: 'upload', element: <Upload /> },
  { path: 'registry', element: <Registry /> },
  { path: 'tickets', element: <Tickets /> },
  { path: 'settings', element: <Settings /> },
  { path: 'report', element: <Report /> },
  { path: 'profile', element: <ProfilePage initialProfile={mockProfiles.staff} /> },
  { path: '', element: <Dashboard /> }
];

export default staffRoutes;