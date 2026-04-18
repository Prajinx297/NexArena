import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router";
import { Shield, User, Loader2 } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { Navbar } from "../components/Navbar";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const [role, setRole] = useState<"fan" | "host">("fan");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refreshUserRole, logout } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const resolvedRole = await refreshUserRole(credential.user);

      if (role === "host" && resolvedRole !== "host") {
        await logout();
        setError("Access denied. This account is not registered as a host.");
        setLoading(false);
        return;
      }

      localStorage.setItem("userEmail", email);
      showToast("Login successful! Redirecting...", "success");

      setTimeout(() => {
        if (resolvedRole === "host") {
          navigate("/host/events", { replace: true });
        } else {
          navigate("/events", { replace: true });
        }
      }, 600);
    } catch (err: any) {
      if (auth.currentUser) {
        await logout();
      }
      const msg = err.code === "auth/invalid-credential"
        ? "Invalid email or password."
        : err.code === "auth/user-not-found"
        ? "No account found with this email."
        : err.message || "Failed to log in.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <Navbar />
      <main className="relative flex flex-col lg:flex-row w-full min-h-screen">
        {/* Left — Visual Side */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--accent) 24%, transparent), var(--bg-primary) 72%)" }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(6,182,212,0.1) 50px, rgba(6,182,212,0.1) 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(6,182,212,0.1) 50px, rgba(6,182,212,0.1) 51px)',
          }} />
          <div className="relative z-10 text-center px-12">
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 tracking-tight leading-tight mb-6">
              Welcome to<br />NexArena
            </h2>
            <p className="text-lg max-w-md" style={{ color: "var(--text-secondary)" }}>The smartest stadium experience platform. AI-powered insights at your fingertips.</p>
          </div>
        </div>

        {/* Right — Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-900/10 blur-[150px] rounded-full pointer-events-none lg:hidden" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-md rounded-3xl border p-8 shadow-2xl backdrop-blur-xl"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black py-1" style={{ color: "var(--text-primary)" }}>Welcome Back</h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Log in to view live updates or manage events</p>
            </div>

            {/* Role Toggle */}
            <div className="flex rounded-xl border p-1 mb-8" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
              <button
                onClick={() => setRole("fan")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  role === "fan" ? "shadow-md" : ""
                }`}
                style={{ background: role === "fan" ? "var(--bg-card)" : "transparent", color: role === "fan" ? "var(--accent)" : "var(--text-secondary)" }}
              >
                <User className="w-4 h-4" />Fan Login
              </button>
              <button
                onClick={() => setRole("host")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  role === "host" ? "shadow-md" : ""
                }`}
                style={{ background: role === "host" ? "var(--bg-card)" : "transparent", color: role === "host" ? "var(--accent)" : "var(--text-secondary)" }}
              >
                <Shield className="w-4 h-4" />Host Admin
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl mb-4 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Email Address</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  placeholder={role === "host" ? "admin@stadium.com" : "you@example.com"}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Password</label>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full mt-4 flex items-center justify-center py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />Authenticating...
                  </span>
                ) : "Sign In"}
              </button>
              <p className="text-center text-sm mt-4" style={{ color: "var(--text-secondary)" }}>
                Don't have an account?{" "}
                <Link to="/signup" className="text-cyan-400 hover:underline">Sign Up</Link>
              </p>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
