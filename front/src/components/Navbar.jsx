import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { LogOut, User, ListTodo, BarChart3, Home, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2 text-amber-400">
            <ListTodo className="h-7 w-7" />
            <span className="text-xl font-bold">TodoApp</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-6">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-1 text-gray-300 hover:text-amber-400 transition"
            >
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/tasks" 
              className="flex items-center space-x-1 text-gray-300 hover:text-amber-400 transition"
            >
              <ListTodo className="h-5 w-5" />
              <span>Mes Tâches</span>
            </Link>
            <Link 
              to="/history" 
              className="flex items-center space-x-1 text-gray-300 hover:text-amber-400 transition"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Historique</span>
            </Link>
          </div>

          {/* User + Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-300">
              <User className="h-5 w-5 text-amber-400" />
              <span>Bonjour {user?.nom}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-black font-medium transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileOpen(!mobileOpen)} 
              className="text-gray-300 focus:outline-none"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-800 px-4 py-3 space-y-2">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-2 text-gray-300 hover:text-amber-400"
            onClick={() => setMobileOpen(false)}
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/tasks" 
            className="flex items-center space-x-2 text-gray-300 hover:text-amber-400"
            onClick={() => setMobileOpen(false)}
          >
            <ListTodo className="h-5 w-5" />
            <span>Mes Tâches</span>
          </Link>
          <Link 
            to="/history" 
            className="flex items-center space-x-2 text-gray-300 hover:text-amber-400"
            onClick={() => setMobileOpen(false)}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Historique</span>
          </Link>
          <div className="border-t border-gray-700 pt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-400">
              <User className="h-5 w-5 text-amber-400" />
              <span>{user?.nom} {user?.prenom}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-1 text-amber-400 hover:underline"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
