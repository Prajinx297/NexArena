import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
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
  const { setRole: setAuthRole, logout } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);

      localStorage.setItem("userRole", role);
      localStorage.setItem("nexarena-role", role);
      localStorage.setItem("userEmail", credential.user.email ?? email);
      setAuthRole(role);

      showToast("Login successful! Redirecting...", "success");
      navigate(role === "host" ? "/host/events" : "/events", { replace: true });
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
      <main className="relative flex min-h-screen w-full flex-col lg:flex-row">
        <div className="relative hidden flex-1 items-center justify-center overflow-hidden lg:flex">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--accent) 24%, transparent), var(--bg-primary) 72%)" }} />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(6,182,212,0.1) 50px, rgba(6,182,212,0.1) 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(6,182,212,0.1) 50px, rgba(6,182,212,0.1) 51px)",
            }}
          />
          <div className="relative z-10 px-12 text-center">
            <h2 className="mb-6 text-5xl font-black leading-tight tracking-tight text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
              Welcome to
              <br />
              NexArena
            </h2>
            <p className="max-w-md text-lg" style={{ color: "var(--text-secondary)" }}>The smartest stadium experience platform. AI-powered insights at your fingertips.</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-24">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-900/10 blur-[150px] lg:hidden" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-md rounded-3xl border p-8 shadow-2xl backdrop-blur-xl"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
          >
            <div className="mb-8 text-center">
              <h1 className="py-1 text-3xl font-black" style={{ color: "var(--text-primary)" }}>Welcome Back</h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Log in to view live updates or manage events</p>
            </div>

            <div className="mb-8 flex rounded-xl border p-1" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
              <button
                type="button"
                onClick={() => setRole("fan")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${role === "fan" ? "shadow-md" : ""}`}
                style={{ background: role === "fan" ? "var(--bg-card)" : "transparent", color: role === "fan" ? "var(--accent)" : "var(--text-secondary)" }}
              >
                <User className="h-4 w-4" />
                Fan Login
              </button>
              <button
                type="button"
                onClick={() => setRole("host")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${role === "host" ? "shadow-md" : ""}`}
                style={{ background: role === "host" ? "var(--bg-card)" : "transparent", color: role === "host" ? "var(--accent)" : "var(--text-secondary)" }}
              >
                <Shield className="h-4 w-4" />
                Host Admin
              </button>
            </div>

            {error ? (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-center text-sm text-red-400"
              >
                {error}
              </motion.div>
            ) : null}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border px-4 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  placeholder={role === "host" ? "admin@stadium.com" : "you@example.com"}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border px-4 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  style={{ background: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  placeholder="********"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-cyan-500 py-4 font-bold text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Authenticating...
                  </span>
                ) : "Sign In"}
              </button>
              <p className="mt-4 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
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
