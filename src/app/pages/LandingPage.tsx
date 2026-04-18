import { motion } from "motion/react";
import { ArrowRight, BarChart3, Bell, Github, Instagram, Linkedin, Mail, Navigation, Shield, Sparkles, Twitter } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Navbar } from "../components/Navbar";
import { ChatbotWidget } from "../components/ChatbotWidget";

const features = [
  { title: "AI Crowd Analytics", description: "Detect density shifts and route fans before congestion becomes unsafe.", icon: BarChart3 },
  { title: "Smart Wayfinding", description: "Recommend the best gate, stand, concession, or exit in real time.", icon: Navigation },
  { title: "Command Center", description: "Give hosts a premium operations console with alerts and CCTV intelligence.", icon: Shield },
  { title: "Live Alerts", description: "Broadcast high-priority updates to fans and staff from one system.", icon: Bell },
];

const footerSections = [
  { title: "Company", links: [["About", "/"], ["Careers", "/"], ["Press", "/"], ["Partners", "/"]] },
  { title: "Product", links: [["Fan Dashboard", "/events"], ["Host Console", "/host/events"], ["AI Routing", "/events"], ["Live Alerts", "/host/events"]] },
  { title: "Support", links: [["Help Center", "mailto:support@nexarena.ai"], ["Status", "/"], ["Contact", "mailto:support@nexarena.ai"], ["Documentation", "/"]] },
  { title: "Legal", links: [["Privacy", "/"], ["Terms", "/"], ["Security", "/"], ["Compliance", "/"]] },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <Navbar />
      <main className="relative overflow-hidden">
        <section className="relative flex min-h-screen items-center justify-center px-4 pb-20 pt-28 sm:px-6 lg:px-8">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--accent) 28%, transparent), transparent 28%), radial-gradient(circle at 78% 12%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 24%)",
            }}
          />
          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em]"
                style={{ borderColor: "var(--border-color)", background: "var(--bg-card)", color: "var(--accent)" }}
              >
                <Sparkles className="h-4 w-4" />
                Smart stadium OS
              </div>
              <div className="space-y-5">
                <h1 className="font-display text-5xl font-semibold tracking-tight md:text-7xl">
                  Stadium intelligence that feels premium, live, and effortless.
                </h1>
                <p className="max-w-2xl text-lg leading-8" style={{ color: "var(--text-secondary)" }}>
                  NexArena combines AI crowd management, predictive surge alerts, smart gate routing, food pickup, and host operations into one production-ready platform.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("/events")}
                  className="inline-flex items-center justify-center gap-3 rounded-full px-6 py-4 font-semibold transition hover:brightness-110"
                  style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
                >
                  Explore events
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate("/host/events")}
                  className="inline-flex items-center justify-center gap-3 rounded-full border px-6 py-4 font-semibold transition"
                  style={{ borderColor: "var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}
                >
                  Host command center
                </button>
              </div>
              <div className="grid max-w-xl grid-cols-3 gap-4">
                {[
                  ["50K+", "Fans managed"],
                  ["3s", "Live loop"],
                  ["AI", "Routing"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-3xl border p-4" style={{ borderColor: "var(--border-color)", background: "var(--bg-card)" }}>
                    <p className="font-display text-3xl font-semibold">{value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em]" style={{ color: "var(--text-secondary)" }}>{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="rounded-[40px] border p-4 shadow-2xl"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-card)" }}
            >
              <div className="rounded-[32px] border p-5" style={{ borderColor: "var(--border-color)", background: "var(--bg-secondary)" }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: "var(--text-secondary)" }}>Live preview</p>
                  <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "color-mix(in srgb, var(--accent) 16%, transparent)", color: "var(--accent)" }}>
                    Online
                  </span>
                </div>
                <div className="mt-6 grid gap-4">
                  {["Gate B recommended", "Surge warning: East Stand", "Drinks queue: 4 min"].map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + index * 0.08 }}
                      className="rounded-3xl border p-5"
                      style={{ borderColor: "var(--border-color)", background: "var(--bg-card)" }}
                    >
                      <p className="font-semibold">{item}</p>
                      <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                        Powered by the central simulation loop and live dashboard state.
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-4 py-20 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="rounded-[30px] border p-6"
                style={{ borderColor: "var(--border-color)", background: "var(--bg-card)" }}
              >
                <div className="mb-5 inline-flex rounded-2xl border p-3" style={{ borderColor: "var(--border-color)", color: "var(--accent)" }}>
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="font-display text-xl font-semibold">{feature.title}</h2>
                <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>{feature.description}</p>
              </motion.article>
            );
          })}
        </section>
      </main>
      <footer className="border-t px-4 py-14 sm:px-6 lg:px-8" style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link to="/" className="font-display text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              NexArena
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6">
              AI-powered smart stadium operations for safer crowds, faster fan journeys, and cleaner command-center decisions.
            </p>
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: "var(--text-primary)" }}>Follow Us</p>
              <div className="mt-3 flex gap-3">
                {[
                  [Twitter, "https://x.com"],
                  [Instagram, "https://instagram.com"],
                  [Linkedin, "https://linkedin.com"],
                  [Github, "https://github.com"],
                  [Mail, "mailto:support@nexarena.ai"],
                ].map(([Icon, href], index) => (
                  <a
                    key={index}
                    href={href as string}
                    className="flex h-10 w-10 items-center justify-center rounded-full border transition hover:-translate-y-0.5"
                    style={{ borderColor: "var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}
                    aria-label="Social link"
                    target={(href as string).startsWith("http") ? "_blank" : undefined}
                    rel={(href as string).startsWith("http") ? "noreferrer" : undefined}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerSections.map((section) => (
              <div key={section.title}>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{section.title}</p>
                <div className="mt-4 space-y-3">
                  {section.links.map(([item, href]) => (
                    <a
                      key={item}
                      href={href}
                      className="block text-sm transition hover:translate-x-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--border-color)" }}>
          <span>© 2026 NexArena. Built for modern live-event operations.</span>
          <span>Ready for Cloud Run deployment</span>
        </div>
      </footer>
      <ChatbotWidget />
    </div>
  );
}
