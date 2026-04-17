import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router";
import { Shield, User, Loader2 } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { Navbar } from "../components/Navbar";
import { useToast } from "../context/ToastContext";

export function LoginPage() {
  const [role, setRole] = useState<"fan" | "host">("fan");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("userEmail", email);
      showToast("Login successful! Redirecting...", "success");

      setTimeout(() => {
        if (role === "host") {
          navigate("/host");
        } else {
          navigate("/events");
        }
      }, 600);
    } catch (err: any) {
      console.error(err);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />
      <main className="relative flex flex-col lg:flex-row w-full min-h-screen">
        {/* Left — Visual Side */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0A2540_0%,#0A0F1E_70%)]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(6,182,212,0.1) 50px, rgba(6,182,212,0.1) 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(6,182,212,0.1) 50px, rgba(6,182,212,0.1) 51px)',
          }} />
          <div className="relative z-10 text-center px-12">
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 tracking-tight leading-tight mb-6">
              Welcome to<br />NexArena
            </h2>
            <p className="text-slate-400 text-lg max-w-md">The smartest stadium experience platform. AI-powered insights at your fingertips.</p>
          </div>
        </div>

        {/* Right — Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-900/10 blur-[150px] rounded-full pointer-events-none lg:hidden" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-white py-1">Welcome Back</h1>
              <p className="text-slate-400 text-sm">Log in to view live updates or manage events</p>
            </div>

            {/* Role Toggle */}
            <div className="flex p-1 bg-slate-950/50 rounded-xl mb-8 border border-white/5">
              <button
                onClick={() => setRole("fan")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  role === "fan" ? "bg-slate-800 text-cyan-400 shadow-md" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <User className="w-4 h-4" />Fan Login
              </button>
              <button
                onClick={() => setRole("host")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  role === "host" ? "bg-slate-800 text-cyan-400 shadow-md" : "text-slate-500 hover:text-slate-300"
                }`}
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
                <label className="block text-sm font-medium text-slate-300">Email Address</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                  placeholder={role === "host" ? "admin@stadium.com" : "you@example.com"}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
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
              <p className="text-center text-sm text-slate-400 mt-4">
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
