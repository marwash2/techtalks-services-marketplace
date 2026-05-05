import { useEffect, useState } from "react";
import { Bot, X, Zap, Shield, MessageSquare, ArrowRight } from "lucide-react";

const STORAGE_KEY = "ai_assistant_welcomed";

const STEPS = [
  {
    icon: MessageSquare,
    title: "Describe what you need",
    description:
      'Type naturally — "I need a plumber in Beirut" or "find me a math tutor for my child".',
  },
  {
    icon: Zap,
    title: "AI finds the best match",
    description:
      "The assistant searches verified providers in real time and ranks them for your situation.",
  },
  {
    icon: Shield,
    title: "Book in one tap",
    description:
      "Each result shows ratings, price, and a personal reason. Hit Book Now to reserve instantly.",
  },
];

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // Small delay so the page renders first
      const t = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    setClosing(true);
    localStorage.setItem(STORAGE_KEY, "1");
    setTimeout(() => setVisible(false), 300);
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    /* Backdrop */
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
      onClick={dismiss}
    >
      {/* Card — stop clicks propagating */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ${
          closing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Top gradient strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600" />

        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7">
          {/* Header — only on first step */}
          {step === 0 && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg leading-tight">
                  Meet your AI Assistant
                </p>
                <p className="text-xs text-slate-400">Quick 3-step intro</p>
              </div>
            </div>
          )}

          {/* Step content */}
          <div
            key={step}
            className="animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 mb-4">
              <Icon className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {current.title}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {current.description}
            </p>
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-1.5 mt-6">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-6 bg-blue-600"
                    : "w-1.5 bg-slate-200 hover:bg-slate-300"
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6">
            {!isLast && (
              <button
                onClick={dismiss}
                className="flex-1 rounded-2xl border border-slate-200 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Skip
              </button>
            )}
            <button
              onClick={next}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              {isLast ? (
                "Start chatting"
              ) : (
                <>
                  Next
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
