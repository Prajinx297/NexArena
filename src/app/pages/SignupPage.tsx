import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
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
  const { setRole: setAuthRole } = useAuth();

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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      localStorage.setItem("userRole", role);
      localStorage.setItem("nexarena-role", role);
      localStorage.setItem("userEmail", user.email ?? email);
      setAuthRole(role);

      showToast("Account created successfully!", "success");
      navigate(role === "host" ? "/host/events" : "/events", { replace: true });
    } catch (err: any) {
      console.error("Signup error:", err?.message ?? err);
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
      <main className="relative flex min-h-screen w-full flex-col lg:flex-row">
        <div className="relative hidden flex-1 items-center justify-center overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0A2540_0%,#0A0F1E_70%)]" />
          <div className="relative z-10 px-12 text-center">
            <h2 className="mb-6 text-5xl font-black leading-tight tracking-tight text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
              Join the
              <br />
              Future of Stadiums
            </h2>
            <p className="max-w-md text-lg text-slate-400">Create an account to access real-time crowd intelligence and personalized fan experiences.</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-8 text-center">
              <h1 className="py-1 text-3xl font-black text-white">Create Account</h1>
              <p className="text-sm text-slate-400">Sign up to get real-time updates and more</p>
            </div>

            <div className="mb-6 flex rounded-xl border border-white/5 bg-slate-950/50 p-1">
              <button
                type="button"
                onClick={() => setRole("fan")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${role === "fan" ? "bg-slate-800 text-cyan-400 shadow-md" : "text-slate-500 hover:text-slate-300"}`}
              >
                <User className="h-4 w-4" />
                Fan
              </button>
              <button
                type="button"
                onClick={() => setRole("host")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${role === "host" ? "bg-slate-800 text-cyan-400 shadow-md" : "text-slate-500 hover:text-slate-300"}`}
              >
                <Shield className="h-4 w-4" />
                Host
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

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="********"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center rounded-xl bg-cyan-500 py-4 font-bold text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Account...
                  </span>
                ) : "Sign Up"}
              </button>
              <p className="mt-4 text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link to="/login" className="text-cyan-400 hover:underline">Log In</Link>
              </p>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
