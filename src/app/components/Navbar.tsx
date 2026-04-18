import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Landmark, LogOut, Menu, Shield, Ticket, X, Zap } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ThemeToggle } from "./ThemeToggle";

function SystemStatusBadge() {
  const [status, setStatus] = useState<"Nominal" | "Peak Flow">("Nominal");

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setStatus(Math.random() > 0.18 ? "Nominal" : "Peak Flow");
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div
      className="hidden items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] sm:flex"
      style={{ borderColor: "var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}
    >
      <span className={`h-2 w-2 rounded-full ${status === "Nominal" ? "bg-emerald-400 animate-pulse" : "bg-amber-300 animate-pulse"}`} />
      {status}
    </div>
  );
}

export function Navbar() {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLinks = [
    { label: "Home", to: "/", icon: <Zap className="h-3.5 w-3.5" /> },
    { label: "Events", to: "/events", icon: <Ticket className="h-3.5 w-3.5" /> },
    { label: "Host", to: "/host/events", icon: <Shield className="h-3.5 w-3.5" /> },
  ];

  const userInitial = currentUser?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <>
      <motion.header initial={{ y: -80 }} animate={{ y: 0 }} className="fixed inset-x-0 top-0 z-50 px-4 py-3 sm:px-6 lg:px-8">
        <div
          className="mx-auto flex max-w-[1540px] items-center justify-between rounded-[28px] border px-5 py-3 shadow-[0_22px_70px_rgba(15,23,42,0.14)] backdrop-blur-2xl transition-all duration-300"
          style={{
            borderColor: "var(--border-color)",
            background: scrolled ? "var(--nav-bg)" : "color-mix(in srgb, var(--nav-bg) 82%, transparent)",
          }}
        >
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/10 shadow-[0_10px_30px_rgba(56,189,248,0.18)]">
              <Landmark className="h-5 w-5 text-sky-300" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>NexArena</p>
              <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: "var(--text-secondary)" }}>Smart stadium OS</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to || location.pathname.startsWith(`${link.to}/`);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5"
                  style={{
                    borderColor: isActive ? "var(--border-color)" : "transparent",
                    background: isActive ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent",
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  }}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <SystemStatusBadge />
            <ThemeToggle />

            {currentUser ? (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 transition"
                  style={{ borderColor: "var(--border-color)", background: "var(--bg-card)" }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-300/15 text-xs font-bold text-sky-200">
                    {userInitial}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{role === "host" ? "Host access" : "Fan access"}</p>
                    <p className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--text-secondary)" }}>Account</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-[24px] border shadow-[0_30px_80px_rgba(2,6,23,0.24)] backdrop-blur-2xl"
                      style={{ borderColor: "var(--border-color)", background: "var(--bg-card)" }}
                    >
                      <div className="border-b px-4 py-4" style={{ borderColor: "var(--border-color)" }}>
                        <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>{currentUser.email}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.24em]" style={{ color: "var(--text-secondary)" }}>{role ?? "fan"}</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            navigate("/events");
                            setDropdownOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <Ticket className="h-4 w-4 text-sky-300" />
                          Browse events
                        </button>
                        <button
                          onClick={handleLogout}
                          className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-red-200 transition hover:bg-red-400/10"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-[linear-gradient(90deg,#38bdf8,#0ea5e9)] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110"
              >
                Login
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-2xl border p-2.5 transition md:hidden"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
              className="fixed right-0 top-0 z-[80] flex h-full w-80 flex-col border-l p-6 backdrop-blur-2xl"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-primary)" }}
            >
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="font-display text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Navigation</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-secondary)" }}>NexArena</p>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                    className="rounded-2xl border p-2.5 transition"
                    style={{ borderColor: "var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-[22px] border px-4 py-3 text-sm font-medium transition"
                    style={{ borderColor: "var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="space-y-3 border-t pt-6" style={{ borderColor: "var(--border-color)" }}>
                <ThemeToggle />
                {currentUser ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-[22px] border border-red-400/15 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-[22px] bg-[linear-gradient(90deg,#38bdf8,#0ea5e9)] px-4 py-3 text-center text-sm font-semibold text-slate-950"
                  >
                    Login
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
