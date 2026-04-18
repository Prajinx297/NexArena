import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

interface OnboardingTourProps {
  restartSignal: number;
}

const steps = [
  "Welcome to NexArena. This dashboard combines live entry, food, alerts, and friend location in one place.",
  "Use Best Gate Right Now to reduce queue time before crowd surges.",
  "Tap stadium gates to inspect wait time and density details.",
  "Order concessions from the lowest-wait counter and skip the physical line.",
  "Find friends by name or ticket ID and highlight their location on the map.",
];

export function OnboardingTour({ restartSignal }: OnboardingTourProps) {
  const [step, setStep] = useState(() => (localStorage.getItem("nexarena-tour-done") ? -1 : 0));

  useEffect(() => {
    if (restartSignal > 0) {
      setStep(0);
    }
  }, [restartSignal]);

  const close = () => {
    localStorage.setItem("nexarena-tour-done", "true");
    setStep(-1);
  };

  return (
    <AnimatePresence>
      {step >= 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[220] flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center"
        >
          <motion.div
            initial={{ y: 24, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 24, scale: 0.96 }}
            className="w-full max-w-lg rounded-[32px] border border-white/10 bg-slate-950/95 p-6 shadow-2xl"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-sky-200">NexArena tour</p>
            <p className="mt-4 text-xl font-semibold text-white">{steps[step]}</p>
            <div className="mt-6 flex items-center justify-between gap-3">
              <button onClick={close} className="text-sm font-medium text-slate-400 hover:text-white">
                Skip
              </button>
              <div className="flex items-center gap-2">
                {steps.map((_, index) => (
                  <span key={index} className={`h-1.5 rounded-full ${index === step ? "w-6 bg-sky-300" : "w-2 bg-white/20"}`} />
                ))}
              </div>
              <button
                onClick={() => (step === steps.length - 1 ? close() : setStep((value) => value + 1))}
                className="rounded-full bg-sky-300 px-4 py-2 text-sm font-semibold text-slate-950"
              >
                {step === steps.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
