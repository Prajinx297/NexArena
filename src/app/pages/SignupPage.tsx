import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router";
import { Shield, User, Loader2 } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../context/ToastContext";

export function SignupPage() {
  const [role, setRole] = useState<"fan" | "host">("fan");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refreshUserRole } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const resolvedRole = await refreshUserRole(credential.user, role);
      
      localStorage.setItem("userEmail", email);
      showToast("Account created successfully!", "success");

      setTimeout(() => {
        if (resolvedRole === "host") {
          navigate("/host/events", { replace: true });
        } else {
          navigate("/events", { replace: true });
        }
      }, 600);
    } catch (err: any) {
      console.error(err);
      const msg = err.code === "auth/email-already-in-use"
        ? "This email is already registered."
        : err.code === "auth/weak-password"
        ? "Password is too weak. Use at least 8 characters."
        : err.message || "Failed to create an account.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />
      <main className="relative flex flex-col lg:flex-row w-full min-h-screen">
        {/* Left Visual */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0A2540_0%,#0A0F1E_70%)]" />
          <div className="relative z-10 text-center px-12">
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 tracking-tight leading-tight mb-6">
              Join the<br />Future of Stadiums
            </h2>
            <p className="text-slate-400 text-lg max-w-md">Create an account to access real-time crowd intelligence and personalized fan experiences.</p>
          </div>
        </div>

        {/* Right Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-white py-1">Create Account</h1>
              <p className="text-slate-400 text-sm">Sign up to get real-time updates and more</p>
            </div>

            <div className="flex p-1 bg-slate-950/50 rounded-xl mb-6 border border-white/5">
              <button onClick={() => setRole("fan")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === "fan" ? "bg-slate-800 text-cyan-400 shadow-md" : "text-slate-500 hover:text-slate-300"}`}>
                <User className="w-4 h-4" />Fan
              </button>
              <button onClick={() => setRole("host")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === "host" ? "bg-slate-800 text-cyan-400 shadow-md" : "text-slate-500 hover:text-slate-300"}`}>
                <Shield className="w-4 h-4" />Host
              </button>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl mb-4 text-sm text-center">{error}</motion.div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  placeholder="Minimum 8 characters" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full mt-2 flex items-center justify-center py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? (<span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />Creating Account...</span>) : "Sign Up"}
              </button>
              <p className="text-center text-sm text-slate-400 mt-4">
                Already have an account?{" "}<Link to="/login" className="text-cyan-400 hover:underline">Log In</Link>
              </p>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
