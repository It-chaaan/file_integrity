import Dashboard from '../pages/staff/Dashboard';
import Verify from '../pages/staff/Verify';
import Upload from '../pages/staff/Upload';
import Registry from '../pages/staff/Registry';
import Report from '../pages/staff/Report';
import ProfilePage from '../components/ProfilePage';
import { mockProfiles } from '../mock';

const staffRoutes = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'verify', element: <Verify /> },
  { path: 'upload', element: <Upload /> },
  { path: 'registry', element: <Registry /> },
  { path: 'report', element: <Report /> },
  { path: 'profile', element: <ProfilePage initialProfile={mockProfiles.staff} /> },
  { path: '', element: <Dashboard /> }
];

export default staffRoutes;