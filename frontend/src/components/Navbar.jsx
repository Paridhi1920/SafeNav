import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldHalf, Zap, LayoutDashboard, MapPin, Router, BarChart } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', path: '/', icon: ShieldHalf },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Hotspots', path: '/hotspots', icon: MapPin },
    { name: 'Safe Route', path: '/safe-route', icon: Router },
    { name: 'Statistics', path: '/statistics', icon: BarChart },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="w-full bg-gray-950/90 backdrop-blur-md shadow-2xl shadow-black/50 border-b border-gray-800 fixed top-0 left-0 right-0 z-50 h-20">
      <div className="max-w-7xl mx-auto h-full flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <Link 
          to="/"
          className="text-2xl font-black text-red-500 cursor-pointer hover:text-red-400 transition flex items-center"
        >
          <Zap className="w-6 h-6 mr-2 text-blue-400" />
          Safe Map
        </Link>
        
        {/* Navigation Links */}
        <ul className="flex space-x-3 sm:space-x-6">
          {navItems.map(item => {
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center text-xs sm:text-sm font-semibold py-2 px-3 rounded-full transition duration-300 whitespace-nowrap
                    ${active 
                      ? 'bg-red-600/30 text-red-400 border border-red-500 shadow-lg shadow-red-500/20' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }
                  `}
                  aria-current={active ? "page" : undefined}
                >
                  <item.icon className="w-4 h-4 mr-1 hidden sm:inline" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
