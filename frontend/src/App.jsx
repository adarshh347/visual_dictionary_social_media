// frontend/src/App.jsx
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/NavBar';
import './App.css';

function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className={`app-layout ${isLandingPage ? 'app-layout--landing' : ''}`}>
      <Navbar />
      <main className={isLandingPage ? '' : 'app-content'}>
        <Outlet />
      </main>
    </div>
  );
}
export default App;