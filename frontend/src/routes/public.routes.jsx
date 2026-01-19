import Home from '../pages/public/Home';
import Verify from '../pages/public/Verify';
import HowItWorks from '../pages/public/HowItWorks';
import About from '../pages/public/About';
import Report from '../pages/public/Report';

const publicRoutes = [
  { path: '', element: <Home /> },
  { path: 'verify', element: <Verify /> },
  { path: 'how-it-works', element: <HowItWorks /> },
  { path: 'about', element: <About /> },
  { path: 'report', element: <Report /> }
];

export default publicRoutes;