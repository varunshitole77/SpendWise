// app/api/report/pdf/route.ts
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Payload = {
  month: string; // YYYY-MM
  roll: any;
};

function toNum(v: any) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}
function fmt(v: any) {
  return toNum(v).toFixed(2);
}
function safeStr(v: any) {
  if (v == null) return '';
  return typeof v === 'string' ? v : String(v);
}

export async function POST(req: Request) {
  const payload = (await req.json()) as Payload;

  const month = safeStr(payload.month || 'Unknown');
  const r = payload.roll || {};

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const W = page.getWidth();
  const H = page.getHeight();

  const margin = 56;
  let y = H - margin;

  const textColor = rgb(0.08, 0.08, 0.08);
  const mutedColor = rgb(0.35, 0.35, 0.35);

  const drawLeft = (t: string, size = 11, bold = false, muted = false, x = margin) => {
    page.drawText(String(t ?? ''), {
      x,
      y,
      size,
      font: bold ? fontBold : font,
      color: muted ? mutedColor : textColor,
    });
  };

  const drawRight = (t: string, size = 11, bold = false, muted = false, right = W - margin) => {
    const s = String(t ?? '');
    const f = bold ? fontBold : font;
    const width = f.widthOfTextAtSize(s, size);
    page.drawText(s, {
      x: right - width,
      y,
      size,
      font: f,
      color: muted ? mutedColor : textColor,
    });
  };

  // Title
  drawLeft('SpendWise Report', 24, true);
  y -= 28;

  drawLeft(`Month: ${month}`, 11, false, true);
  y -= 22;

  drawLeft('Summary', 13, true);
  y -= 18;

  const rows: Array<[string, string]> = [
    ['Income', `$${fmt(r.income)}`],
    ['Subscriptions (expenses)', `$${fmt(r.expenses ?? r.subsMonthly)}`],
    ['Savings target (Settings)', `$${fmt(r.savingsTarget)}`],
    ['Suggested savings (Recommended)', `$${fmt(r.suggestedSavings)} (${toNum(r.suggestedSavingsPct).toFixed(0)}%)`],
    ['Net after target', `$${fmt(r.net ?? r.netAfterTarget)}`],
    ['Net after suggested', `$${fmt(r.netAfterSuggested)}`],
    ['Safe weekly spend (target)', `$${fmt(r.safeWeeklySpendTarget ?? r.safeWeeklySpend)}`],
    ['Safe weekly spend (suggested)', `$${fmt(r.safeWeeklySpendSuggested)}`],
  ];

  for (const [k, v] of rows) {
    drawLeft(k, 11, false, false);
    drawRight(v, 11, true, false);
    y -= 18;
  }

  y -= 10;
  drawLeft(`Active subscription set: ${safeStr(r.activeSubGroupName || 'All subscriptions')}`, 10, false, true);
  y -= 26;

  drawLeft('Note: Transactions are disabled; "expenses" currently represent subscriptions only.', 9.5, false, true);

  // pdf-lib returns Uint8Array<ArrayBufferLike>
  const bytes = await pdfDoc.save();

  // FIX: force-copy into a normal Uint8Array backed by ArrayBuffer
  const body = Uint8Array.from(bytes);

  return new Response(body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="SpendWise_Report_${month}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
