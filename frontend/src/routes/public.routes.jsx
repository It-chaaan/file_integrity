import Home from '../pages/public/Home';
import HowItWorks from '../pages/public/HowItWorks';
import About from '../pages/public/About';
import Report from '../pages/public/Report';
import ContactSales from '../pages/public/ContactSales';

const publicRoutes = [
  { path: '', element: <Home /> },
  { path: 'how-it-works', element: <HowItWorks /> },
  { path: 'about', element: <About /> },
  { path: 'report', element: <Report /> },
  { path: 'contact-sales', element: <ContactSales /> }
];

export default publicRoutes;