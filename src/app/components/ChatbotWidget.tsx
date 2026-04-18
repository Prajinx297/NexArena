import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

interface ChatbotWidgetProps {
  eventId?: string;
}

const quickReplies = ["Best gate now?", "Any alerts?", "Shortest food queue?"];
let msgId = 0;

export function ChatbotWidget({ eventId = "default" }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: ++msgId,
      text: "I’m NexBot. Ask about gates, alerts, or food queues and I’ll use live stadium context.",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((current) => [...current, { id: ++msgId, text: trimmed, sender: "user" }]);
    setInput("");
    setTyping(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, { event_id: eventId, message: trimmed });
      setMessages((current) => [...current, { id: ++msgId, text: response.data.answer, sender: "bot" }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: ++msgId,
          text: "I couldn’t reach live context right now. Try again in a moment.",
          sender: "bot",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[150] flex h-14 w-14 items-center justify-center rounded-full bg-sky-300 text-slate-950 shadow-[0_0_34px_rgba(56,189,248,0.42)] transition hover:brightness-110"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[150] flex h-[540px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-300/15">
                  <Bot className="h-5 w-5 text-sky-200" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">NexBot</h3>
                  <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-sky-200">Live context</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-xl p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                      message.sender === "user"
                        ? "rounded-br-md bg-sky-300 font-medium text-slate-950"
                        : "rounded-bl-md bg-white/10 text-slate-200"
                    }`}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}

              {typing ? (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white/10 px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-white/10 bg-white/[0.04] px-3 py-3">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
                >
                  {reply}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2 border-t border-white/10 bg-white/[0.04] p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask NexBot..."
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300/50"
              />
              <button type="submit" className="rounded-xl bg-sky-300 p-2.5 text-slate-950 transition hover:brightness-110">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
