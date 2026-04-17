import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Landmark, Menu, X, Ticket, LogOut, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { ThemeToggle } from './ThemeToggle';

function SystemStatusBadge() {
  const [status, setStatus] = useState<'LIVE' | 'HIGH LOAD'>('LIVE');
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(Math.random() > 0.15 ? 'LIVE' : 'HIGH LOAD');
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 cursor-default"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className={`w-2 h-2 rounded-full ${status === 'LIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
      <span className={`text-[10px] font-bold tracking-wider uppercase ${status === 'LIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>
        {status}
      </span>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full mt-2 right-0 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 shadow-2xl whitespace-nowrap z-50"
          >
            <p className="text-xs text-slate-300 font-medium">
              {status === 'LIVE' ? 'All Systems Operational' : 'Elevated Traffic Detected'}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Latency: {Math.floor(Math.random() * 15 + 8)}ms</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Events', to: '/events' },
    { label: 'Host Panel', to: '/host' },
  ];

  const userInitial = currentUser?.email?.[0]?.toUpperCase() || '?';

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 lg:px-8 py-3 transition-all duration-300 ${
          scrolled ? 'py-2' : ''
        }`}
      >
        <div className={`max-w-7xl mx-auto backdrop-blur-xl border rounded-2xl px-5 py-3 flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? 'bg-slate-950/80 border-white/10 shadow-2xl shadow-black/40'
            : 'bg-slate-950/60 border-white/5'
        }`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
              <Landmark className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Nex<span className="text-cyan-400">Arena</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2.5">
            <SystemStatusBadge />
            <ThemeToggle />

            {currentUser ? (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold">
                    {userInitial}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 4 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[60]"
                    >
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                        <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold mt-1">{role || 'fan'}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => { navigate('/events'); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <Ticket className="w-4 h-4" />
                          My Events
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] text-sm"
              >
                Login
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 z-[70] p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-bold text-white">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="pt-6 border-t border-white/10 space-y-3">
                <ThemeToggle />
                {currentUser ? (
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center bg-cyan-500 text-slate-950 font-bold py-3 rounded-xl"
                  >
                    Login
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
