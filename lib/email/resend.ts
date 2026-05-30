import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = process.env.EMAIL_FROM ?? "FinanceKu <noreply@financeku.app>";

export { resend };