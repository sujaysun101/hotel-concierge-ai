"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Message { role: "user" | "assistant"; content: string; }
interface HotelContext { hotelName: string; location: string; amenities: string; checkIn: string; checkOut: string; notes: string; }

const DEFAULTS: HotelContext = {
  hotelName: "The Grand Meridian",
  location: "Miami Beach, Florida",
  amenities: "Rooftop pool, world-class spa, fitness center, three restaurants, 24/7 room service, valet parking, beach access",
  checkIn: "3:00 PM",
  checkOut: "11:00 AM",
  notes: "Pet-friendly (up to 25lbs). Complimentary breakfast for suite guests.",
};

export default function Home() {
  const [tab, setTab] = useState<"setup" | "chat">("setup");
  const [ctx, setCtx] = useState<HotelContext>(DEFAULTS);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function setCtxField(field: keyof HotelContext, value: string) {
    setCtx(c => ({ ...c, [field]: value }));
  }

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input;
    const newMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          hotelContext: ctx,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply || "I apologize, I am having trouble responding right now." }]);
    } finally {
      setLoading(false);
    }
  }

  const SUGGESTED = [
    "What restaurants do you recommend nearby?",
    "Can I book a spa treatment for tomorrow morning?",
    "What time is checkout and can I get a late checkout?",
    "I would like to order room service please.",
    "What are the best local attractions?",
  ];

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100">
      <header className="border-b border-stone-700 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-serif text-lg font-bold">H</div>
            <div>
              <h1 className="text-xl font-serif font-semibold tracking-wide">{ctx.hotelName}</h1>
              <p className="text-xs text-stone-400">{ctx.location}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setTab("setup")} className="border-stone-600 text-stone-300 hover:bg-stone-800">Hotel Setup</Button>
            <Button size="sm" onClick={() => setTab("chat")} className="bg-amber-600 hover:bg-amber-700">Guest Concierge</Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {tab === "setup" && (
          <Card className="bg-stone-800 border-stone-700">
            <CardHeader>
              <CardTitle className="text-stone-100">Configure Your Hotel</CardTitle>
              <CardDescription className="text-stone-400">Set up the concierge with your hotel details. Guests will interact with the Chat tab.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {([
                  { key: "hotelName", label: "Hotel Name" },
                  { key: "location", label: "Location" },
                  { key: "checkIn", label: "Check-in Time" },
                  { key: "checkOut", label: "Check-out Time" },
                ] as { key: keyof HotelContext; label: string }[]).map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-stone-300">{label}</Label>
                    <Input
                      value={ctx[key]}
                      onChange={e => setCtxField(key, e.target.value)}
                      className="bg-stone-900 border-stone-600 text-stone-100"
                    />
                  </div>
                ))}
              </div>
              {([
                { key: "amenities", label: "Amenities" },
                { key: "notes", label: "Special Notes" },
              ] as { key: keyof HotelContext; label: string }[]).map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-stone-300">{label}</Label>
                  <Input
                    value={ctx[key]}
                    onChange={e => setCtxField(key, e.target.value)}
                    className="bg-stone-900 border-stone-600 text-stone-100"
                  />
                </div>
              ))}
              <Button onClick={() => { setMessages([]); setTab("chat"); }} className="w-full bg-amber-600 hover:bg-amber-700">
                Launch Concierge Chat
              </Button>
            </CardContent>
          </Card>
        )}

        {tab === "chat" && (
          <div className="flex flex-col h-[calc(100vh-180px)]">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-white font-serif text-3xl font-bold mx-auto mb-4">H</div>
                  <p className="text-stone-300 font-serif text-lg">Welcome to {ctx.hotelName}</p>
                  <p className="text-stone-500 text-sm mt-1">How may I assist you today?</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-6">
                    {SUGGESTED.map(s => (
                      <button key={s} onClick={() => setInput(s)} className="text-xs bg-stone-800 text-amber-400 border border-stone-700 px-3 py-1.5 rounded-full hover:bg-stone-700">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 bg-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">H</div>
                  )}
                  <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-amber-600 text-white"
                      : "bg-stone-800 text-stone-200 border border-stone-700"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 bg-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">H</div>
                  <div className="bg-stone-800 border border-stone-700 rounded-2xl px-4 py-3 text-sm text-stone-400">One moment...</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ask your concierge anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                disabled={loading}
                className="flex-1 bg-stone-800 border-stone-600 text-stone-100 placeholder:text-stone-500"
              />
              <Button onClick={send} disabled={loading || !input.trim()} className="bg-amber-600 hover:bg-amber-700">
                {loading ? "..." : "Send"}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
