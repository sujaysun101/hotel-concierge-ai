import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { message, hotelContext, conversationHistory } = await req.json();

  const messages: Anthropic.Messages.MessageParam[] = [
    ...(conversationHistory || []),
    { role: "user", content: message },
  ];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `You are an expert, warm, and professional hotel concierge at ${hotelContext.hotelName || "The Grand Hotel"}, located in ${hotelContext.location || "a beautiful destination"}.

Your personality: Warm, knowledgeable, attentive, and always eager to make the guest stay exceptional. You speak in a refined but approachable tone.

Hotel amenities: ${hotelContext.amenities || "Pool, spa, fitness center, restaurant, room service, concierge desk"}
Check-in: ${hotelContext.checkIn || "3:00 PM"}, Check-out: ${hotelContext.checkOut || "11:00 AM"}
Special notes: ${hotelContext.notes || ""}

You help guests with: local restaurant recommendations, transportation, room service orders, spa bookings, local attractions, hotel amenities, and any special requests. Always offer to help with follow-up needs. Keep responses concise but warm.`,
    messages,
  });

  const content = response.content[0];
  if (content.type !== "text") return NextResponse.json({ error: "Unexpected response" }, { status: 500 });

  return NextResponse.json({ reply: content.text });
}
