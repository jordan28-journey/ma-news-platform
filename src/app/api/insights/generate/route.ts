import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getDealsByDateRange } from "@/lib/deals";
import { isAuthenticated } from "../../auth/route";

export const dynamic = "force-dynamic";

function getQuarterDateRange(quarter: string, year: number): { start: string; end: string } {
  switch (quarter) {
    case "Q1":
      return { start: `${year}-01-01`, end: `${year}-04-01` };
    case "Q2":
      return { start: `${year}-04-01`, end: `${year}-07-01` };
    case "Q3":
      return { start: `${year}-07-01`, end: `${year}-10-01` };
    case "Q4":
      return { start: `${year}-10-01`, end: `${year + 1}-01-01` };
    default:
      return { start: `${year}-01-01`, end: `${year}-04-01` };
  }
}

export async function POST(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured. Add it to your .env.local file." },
      { status: 500 }
    );
  }

  const { quarter, year } = await request.json();
  if (!quarter || !year) {
    return NextResponse.json({ error: "Quarter and year are required" }, { status: 400 });
  }

  const { start, end } = getQuarterDateRange(quarter, year);
  const deals = await getDealsByDateRange(start, end);

  const dealsContext = deals.length > 0
    ? deals
        .map(
          (d, i) =>
            `${i + 1}. "${d.title}" — Firms: ${d.firms} | Value: ${d.deal_value} | Date: ${d.deal_date}\n   Summary: ${d.summary}`
        )
        .join("\n\n")
    : "No deals were recorded for this quarter.";

  const prompt = `You are a professional analyst writing for Acting Office's M&A Tracker — a platform that covers mergers, acquisitions, and consolidation in the UK accounting market. Your audience is accounting firm partners, M&A advisors, and industry observers.

Write a quarterly insight report for ${quarter} ${year} (covering ${start} to ${end}).

Here are the deals recorded during this quarter:

${dealsContext}

Write the report in the following structure:
1. **Executive Summary** — A concise overview of the quarter's M&A activity (2-3 paragraphs)
2. **Key Deals** — Highlight the most significant deals from the quarter, explaining why they matter and what they signal about market trends
3. **Market Trends** — Analyse the broader patterns: consolidation trends, geographic hotspots, deal sizes, acquirer profiles, and what's driving activity
4. **Outlook** — What to watch for in the coming quarter based on these trends

Guidelines:
- Write in a professional, authoritative tone suitable for an industry publication (think Accountancy Age, FT)
- Reference specific deals from the data provided where relevant
- Keep the total length to roughly 800-1200 words
- Do not use markdown headers (the platform will handle formatting) — just use the section names as plain text labels followed by a blank line
- Be analytical, not just descriptive — draw insights and connections between deals
- If there are few or no deals, note this and focus more on broader UK accounting M&A market context and outlook`;

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const reportBody = textBlock?.text || "";

  // Generate a summary too
  const summaryMessage = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `Based on this quarterly M&A report, write a 1-2 sentence summary suitable for a card preview. Be specific and mention key stats or themes.\n\nReport:\n${reportBody}`,
      },
    ],
  });

  const summaryBlock = summaryMessage.content.find((b) => b.type === "text");
  const summary = summaryBlock?.text || "";

  const title = `UK Accounting M&A: ${quarter} ${year} Review`;

  return NextResponse.json({
    title,
    summary,
    body: reportBody,
    dealCount: deals.length,
  });
}
