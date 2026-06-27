import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, PlusCircle, LayoutDashboard, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { username, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/create', label: 'New Signal', icon: PlusCircle },
  ];

  return (
    <>
      <motion.nav
        className="navbar"
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            <motion.div
              className="navbar-logo-icon"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap size={18} />
            </motion.div>
            <span className="navbar-logo-text">ZUMOVO</span>
            <span className="navbar-logo-tag">signals</span>
          </Link>

          <div className="navbar-links">
            {links.map((link) => (
              <motion.div key={link.to} whileHover={{ y: -1 }} whileTap={{ y: 0 }}>
                <Link
                  to={link.to}
                  className={`navbar-link ${location.pathname === link.to ? 'active' : ''}`}
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="navbar-user">
            <motion.span
              className="navbar-username"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              @{username}
            </motion.span>
            <motion.button
              className="navbar-logout-btn"
              onClick={logout}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <LogOut size={14} />
              Logout
            </motion.button>
          </div>

          <div
            className={`navbar-mobile-toggle ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span />
            <span />
            <span />
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="navbar-mobile-menu open"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`navbar-link ${location.pathname === link.to ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
            <span className="navbar-username" style={{ textAlign: 'center' }}>@{username}</span>
            <button className="navbar-logout-btn" onClick={logout}>
              <LogOut size={14} />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
