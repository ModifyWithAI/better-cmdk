import { convertToModelMessages, streamText, type UIMessage } from "ai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "anthropic/claude-haiku-4.5",
    messages: await convertToModelMessages(messages),
    system:
      "You are a helpful assistant in a command palette. Keep responses concise.",
  });

  return result.toUIMessageStreamResponse({ headers: corsHeaders });
}
