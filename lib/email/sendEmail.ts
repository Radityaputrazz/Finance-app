import { resend, FROM_EMAIL } from "./resend";
import { budgetAlertTemplate } from "./templates";

interface BudgetAlertEmailProps {
  to: string;
  userName: string;
  categoryName: string;
  categoryIcon: string;
  spent: number;
  limit: number;
  percentage: number;
  isOver: boolean;
}

export async function sendBudgetAlertEmail(props: BudgetAlertEmailProps) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY tidak di-set, skip kirim email");
    return;
  }

  const subject = props.isOver
    ? `🚨 Anggaran ${props.categoryName} melebihi batas!`
    : `⚠️ Anggaran ${props.categoryName} hampir habis (${props.percentage.toFixed(0)}%)`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: props.to,
      subject,
      html: budgetAlertTemplate(props),
    });
  } catch (error) {
    console.error("[Email] Gagal kirim budget alert:", error);
  }
}