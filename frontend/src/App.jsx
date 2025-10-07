import { Outlet } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <h1>My Visual Dictionary</h1>
      <main>
        {/* The Outlet component renders the active page (e.g., HomePage or PostDetailPage) */}
        <Outlet />
      </main>
    </div>
  );
}

export default App;