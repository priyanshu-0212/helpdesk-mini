// client/src/App.jsx
import { useState, useEffect } from 'react'; // <-- Import useState and useEffect
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TicketsListPage from './pages/TicketsListPage';
import TicketDetailPage from './pages/TicketDetailPage';
import NewTicketPage from './pages/NewTicketPage';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  // --- New Dark Mode State and Logic ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  // ------------------------------------

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
    window.location.reload();
  };

  return (
    // Add dark mode background color class
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Toaster position="top-center" />

      <header className="bg-gradient-to-r from-slate-900 to-slate-700 text-white p-4 shadow-md sticky top-0 z-10">
        <nav className="container mx-auto flex justify-between items-center">
          <Link to="/tickets" className="text-xl font-bold tracking-wider">
            HelpDesk Mini
          </Link>
          <div className="flex items-center space-x-6 text-sm font-medium">
            {token ? (
              <>
                <Link to="/tickets/new" className="hover:text-sky-300 transition-colors">
                  New Ticket
                </Link>
                <button onClick={handleLogout} className="hover:text-sky-300 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="hover:text-sky-300 transition-colors">
                  Register
                </Link>
                <Link to="/login" className="bg-white text-slate-800 px-4 py-1.5 rounded-md hover:bg-slate-200 transition-colors">
                  Login
                </Link>
              </>
            )}
            
            {/* --- New Theme Toggle Button --- */}
            <button onClick={toggleTheme} className="text-2xl">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            {/* ----------------------------- */}
          </div>
        </nav>
      </header>
      
      {/* Add 'flex-grow' to make the main content area expand */}
      <main className="container mx-auto p-4 md:p-6 flex-grow">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/tickets" element={<ProtectedRoute><TicketsListPage /></ProtectedRoute>} />
          <Route path="/tickets/new" element={<ProtectedRoute><NewTicketPage /></ProtectedRoute>} />
          <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/tickets" replace />} />
        </Routes>
      </main>

      {/* --- New Footer --- */}
      <footer className="w-full text-center p-4 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm">
        Made by Priyanshu Srivastava
      </footer>
      {/* ------------------ */}
    </div>
  );
}

export default App;