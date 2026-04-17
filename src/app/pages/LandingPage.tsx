import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Play, BarChart3, Shield, Navigation, Bell, Cpu, MessageSquare, Users, Zap, Clock } from 'lucide-react';
import { useNavigate, Link } from 'react-router';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Navbar } from '../components/Navbar';
import { ChatbotWidget } from '../components/ChatbotWidget';
import { useCountUp } from '../hooks/useCountUp';

/* ═══════ useCountUp with intersection observer ═══════ */
function AnimatedStat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const count = useCountUp(visible ? value : 0, 2000);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl md:text-4xl font-black text-white tabular-nums">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">{label}</p>
    </div>
  );
}

/* ═══════ HERO SECTION ═══════ */
function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="object-cover w-full h-full opacity-60"
        >
          <source src="https://cdn.coverr.co/videos/coverr-cheering-crowd-at-a-concert-4101/1080p.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-slate-950/70" />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 text-center max-w-4xl mx-auto px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 px-5 py-2 rounded-full mb-10 backdrop-blur-md"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-red-400 font-bold tracking-widest text-xs uppercase">Live System Active</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400"
          >
            The Future of
            <br />
            Stadium Intelligence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed"
          >
            AI-powered crowd management, real-time security, and seamless fan experiences — all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-16"
          >
            <button
              onClick={() => navigate('/login')}
              className="group flex items-center gap-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-full transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)]"
            >
              Enter as Fan
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/host')}
              className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white font-medium px-8 py-4 rounded-full transition-all"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              Host Dashboard
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-8 md:gap-16 pt-8 border-t border-white/10"
          >
            <AnimatedStat value={50000} suffix="+" label="Fans Managed" />
            <AnimatedStat value={99} suffix=".9%" label="Uptime" />
            <AnimatedStat value={200} suffix="ms" label="Latency" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════ LIVE PREVIEW SECTION ═══════ */
function LivePreviewSection() {
  const [crowdData, setCrowdData] = useState(() =>
    ['Gate A','Gate B','Gate C','Gate D','Gate E','Gate F','Gate G','Gate H'].map(g => ({ gate: g, density: Math.floor(Math.random() * 60 + 20) }))
  );
  const [waitData, setWaitData] = useState(() =>
    ['Entrance 1','Entrance 2','Entrance 3','Entrance 4','Entrance 5'].map(e => ({ name: e, minutes: Math.floor(Math.random() * 14 + 1) }))
  );

  const alertPool = [
    { title: 'Overcrowding Alert', desc: 'Gate B capacity at 92%. Activating overflow routing.', severity: 'critical' },
    { title: 'VIP Escort Required', desc: 'VIP delegation arriving at North Gate in 3 minutes.', severity: 'high' },
    { title: 'Medical Unit Dispatched', desc: 'First aid team heading to Section E, Row 24.', severity: 'high' },
    { title: 'All Clear — Zone C', desc: 'Zone C crowd density normalized. Restrictions lifted.', severity: 'info' },
    { title: 'Gate D Congestion', desc: 'Wait time exceeding 15 min. Redirecting to Gate F.', severity: 'critical' },
    { title: 'Suspicious Package', desc: 'Security sweep initiated at West Concourse. Area cordoned.', severity: 'critical' },
    { title: 'Lost Child Report', desc: 'Child reported missing near Section B. Description broadcasted to all staff.', severity: 'high' },
    { title: 'Weather Advisory', desc: 'Rain expected in 30 minutes. Roof closure initiated.', severity: 'info' },
  ];
  const [visibleAlerts, setVisibleAlerts] = useState(alertPool.slice(0, 4));
  const alertIdx = useRef(4);

  useEffect(() => {
    const i1 = setInterval(() => { setCrowdData(prev => prev.map(d => ({ ...d, density: Math.max(10, Math.min(95, d.density + Math.floor(Math.random() * 15 - 7))) }))); }, 4000);
    const i2 = setInterval(() => { setWaitData(prev => prev.map(d => ({ ...d, minutes: Math.max(1, Math.min(18, d.minutes + Math.floor(Math.random() * 5 - 2))) }))); }, 5000);
    const i3 = setInterval(() => {
      const next = alertPool[alertIdx.current % alertPool.length];
      alertIdx.current++;
      setVisibleAlerts(prev => [next, ...prev.slice(0, 3)]);
    }, 3000);
    return () => { clearInterval(i1); clearInterval(i2); clearInterval(i3); };
  }, []);

  return (
    <section className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Simulated</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Live System Intelligence</h2>
        <p className="text-slate-400 max-w-xl mx-auto">Watch our AI engine process real-time crowd data, predict wait times, and generate security alerts.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Crowd Density */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all relative overflow-hidden">
          <div className="absolute top-4 right-4 px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/30 rounded text-[9px] font-bold text-cyan-400 uppercase">AI-Powered</div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-cyan-400" />Crowd Density Map</h3>
          <div className="h-[200px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={crowdData}>
                <defs>
                  <linearGradient id="crowdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="gate" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#06b6d4' }} formatter={(v: number) => [`${v}%`, 'Density']} />
                <Area type="monotone" dataKey="density" stroke="#06b6d4" fill="url(#crowdGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Card 2: Wait Times */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-amber-500/30 transition-all relative overflow-hidden">
          <div className="absolute top-4 right-4 px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-[9px] font-bold text-amber-400 uppercase">Real-Time</div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-amber-400" />Wait Time Predictions</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waitData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} formatter={(v: number) => [`${v} min`, 'Wait']} />
                <Bar dataKey="minutes" radius={[0, 4, 4, 0]} barSize={14}>
                  {waitData.map((d, i) => (
                    <Cell key={i} fill={d.minutes > 10 ? '#ef4444' : d.minutes > 5 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Card 3: Alert Feed */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-red-500/30 transition-all overflow-hidden">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-red-400" />Security Alert Feed</h3>
          <div className="space-y-3 h-[200px] overflow-hidden">
            {visibleAlerts.map((alert, i) => (
              <motion.div key={`${alert.title}-${i}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl bg-white/5 border-l-2 ${
                  alert.severity === 'critical' ? 'border-red-500' : alert.severity === 'high' ? 'border-amber-500' : 'border-cyan-500'
                }`}>
                <p className="text-sm font-semibold text-white">{alert.title}</p>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{alert.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════ FEATURES SECTION ═══════ */
function FeaturesSection() {
  const features = [
    { title: 'AI Crowd Analytics', icon: BarChart3, desc: 'Predict density surges before they happen.', color: 'cyan' },
    { title: 'Real-Time Security', icon: Shield, desc: '6-feed camera grid with AI scanning overlays.', color: 'blue' },
    { title: 'Smart Wayfinding', icon: Navigation, desc: 'AR-guided routes to seats, food, exits.', color: 'emerald' },
    { title: 'Instant Alerts', icon: Bell, desc: 'Push notifications to fans and staff in <1 second.', color: 'amber' },
    { title: 'IoT Sensor Ready', icon: Cpu, desc: 'Plug in physical crowd sensors.', color: 'purple', badge: 'Coming Soon' },
    { title: 'AI Chatbot', icon: MessageSquare, desc: 'Fan assistant powered by AI.', color: 'pink', badge: 'Coming Soon' },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    cyan:    { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', glow: 'group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]' },
    blue:    { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]' },
    amber:   { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]' },
    purple:  { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'group-hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]' },
    pink:    { bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400', glow: 'group-hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]' },
  };

  return (
    <section className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Everything You Need</h2>
        <p className="text-slate-400 max-w-xl mx-auto">Comprehensive tools for smart stadium management, from crowd analytics to emergency response.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => {
          const c = colorMap[f.color];
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className={`group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:border-white/20 ${c.glow} cursor-default relative`}
            >
              {f.badge && (
                <span className="absolute top-4 right-4 px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-[9px] font-bold text-purple-400 uppercase">{f.badge}</span>
              )}
              <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.text} border ${c.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════ CTA SECTION ═══════ */
function CTASection() {
  const navigate = useNavigate();
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 via-blue-900/20 to-purple-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent_70%)]" />
      <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">Ready to Transform Your Stadium?</h2>
        <p className="text-slate-400 text-lg mb-10">Join the next generation of smart stadium management. Start with a free account and experience the future.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => navigate('/signup')} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-full transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            Get Started Free
          </button>
          <button className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-4 rounded-full transition-all">
            <Play className="w-4 h-4 text-cyan-400" />
            Watch Demo (2 min)
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══════ FOOTER ═══════ */
function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-lg font-bold text-white">Nex<span className="text-cyan-400">Arena</span></span>
            <p className="text-sm text-slate-500 mt-3 max-w-xs">AI-powered stadium intelligence for the next generation of live events.</p>
          </div>
          <div className="flex gap-8">
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Navigation</p>
              <Link to="/" className="block text-sm text-slate-400 hover:text-white transition-colors">Home</Link>
              <Link to="/events" className="block text-sm text-slate-400 hover:text-white transition-colors">Events</Link>
              <Link to="/login" className="block text-sm text-slate-400 hover:text-white transition-colors">Login</Link>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Legal</p>
              <span className="block text-sm text-slate-500 cursor-default">Privacy Policy</span>
              <span className="block text-sm text-slate-500 cursor-default">Terms of Service</span>
            </div>
          </div>
          <div className="md:text-right">
            <p className="text-sm text-slate-500">© 2025 NexArena. Built for the future of live events.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════ LANDING PAGE ═══════ */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />
      <main className="relative flex flex-col w-full overflow-x-hidden">
        <HeroSection />
        <LivePreviewSection />
        <FeaturesSection />
        <CTASection />
        <Footer />
      </main>
      <ChatbotWidget />
    </div>
  );
}
