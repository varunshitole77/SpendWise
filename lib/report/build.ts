// lib/report/build.ts
import fs from 'node:fs';
import path from 'node:path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export type ReportPayload = {
  month: string;
  roll: any;
};

function n(v: any) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}
function money(v: any) {
  return n(v).toFixed(2);
}

export function buildDocxUsingTemplate(payload: ReportPayload): Uint8Array {
  const templatePath = path.join(process.cwd(), 'public', 'report_template.docx');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Missing template: ${templatePath}`);
  }

  const content = fs.readFileSync(templatePath);
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

  const r = payload.roll || {};
  const data = {
    month: payload.month || '',
    income: money(r.income),
    expenses: money(r.expenses),
    subsMonthly: money(r.subsMonthly),
    savingsTarget: money(r.savingsTarget),
    suggestedSavings: money(r.suggestedSavings),
    suggestedSavingsPct: n(r.suggestedSavingsPct).toFixed(0),
    netAfterTarget: money(r.netAfterTarget),
    netAfterSuggested: money(r.netAfterSuggested),
    safeWeeklySpendTarget: money(r.safeWeeklySpendTarget),
    safeWeeklySpendSuggested: money(r.safeWeeklySpendSuggested),
    activeSubGroupName: String(r.activeSubGroupName || ''),
  };

  // Docxtemplater v4: prefer render(data)
  // If your version still supports setData, this also works, but render(data) is the modern way.
  doc.render(data);

  const out = doc.getZip().generate({ type: 'uint8array' }) as Uint8Array;
  return out;
}
