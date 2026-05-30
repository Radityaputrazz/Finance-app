import { formatCurrency } from "@/lib/utils";

export function budgetAlertTemplate({
  userName,
  categoryName,
  categoryIcon,
  spent,
  limit,
  percentage,
  isOver,
}: {
  userName: string;
  categoryName: string;
  categoryIcon: string;
  spent: number;
  limit: number;
  percentage: number;
  isOver: boolean;
}) {
  const color = isOver ? "#ef4444" : "#f59e0b";
  const title = isOver
    ? `🚨 Anggaran ${categoryName} Melebihi Batas!`
    : `⚠️ Anggaran ${categoryName} Hampir Habis`;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <div style="background:#10b981;width:48px;height:48px;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-size:24px;line-height:48px;">💰</div>
              <div style="font-size:20px;font-weight:700;color:#111827;margin-top:8px;">FinanceKu</div>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;border:1px solid #f3f4f6;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">

              <!-- Alert icon -->
              <div style="text-align:center;margin-bottom:20px;">
                <div style="background:${isOver ? "#fef2f2" : "#fffbeb"};width:64px;height:64px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;line-height:64px;">
                  ${isOver ? "🚨" : "⚠️"}
                </div>
              </div>

              <h1 style="font-size:18px;font-weight:700;color:#111827;text-align:center;margin:0 0 8px;">
                ${title}
              </h1>
              <p style="font-size:14px;color:#6b7280;text-align:center;margin:0 0 24px;">
                Halo ${userName}, berikut update anggaran Anda.
              </p>

              <!-- Category info -->
              <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:20px;">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                  <span style="font-size:28px;">${categoryIcon}</span>
                  <div>
                    <div style="font-size:16px;font-weight:600;color:#111827;">${categoryName}</div>
                    <div style="font-size:13px;color:#6b7280;">Kategori pengeluaran</div>
                  </div>
                </div>

                <!-- Progress bar -->
                <div style="background:#e5e7eb;border-radius:999px;height:8px;margin-bottom:8px;overflow:hidden;">
                  <div style="background:${color};height:8px;border-radius:999px;width:${Math.min(percentage, 100).toFixed(0)}%;"></div>
                </div>

                <div style="display:flex;justify-content:space-between;font-size:13px;">
                  <span style="color:#6b7280;">Terpakai: <strong style="color:${color};">${formatCurrency(spent)}</strong></span>
                  <span style="font-weight:700;color:${color};">${percentage.toFixed(0)}%</span>
                  <span style="color:#6b7280;">Limit: <strong>${formatCurrency(limit)}</strong></span>
                </div>
              </div>

              ${isOver ? `
              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:12px 16px;margin-bottom:20px;text-align:center;">
                <span style="color:#dc2626;font-size:14px;font-weight:600;">
                  Melebihi limit sebesar ${formatCurrency(spent - limit)}
                </span>
              </div>
              ` : `
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:12px 16px;margin-bottom:20px;text-align:center;">
                <span style="color:#d97706;font-size:14px;font-weight:600;">
                  Sisa anggaran: ${formatCurrency(limit - spent)}
                </span>
              </div>
              `}

              <!-- CTA -->
              <div style="text-align:center;">
                <a href="${process.env.AUTH_URL}/budgets" style="display:inline-block;background:#10b981;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:12px;text-decoration:none;">
                  Lihat Detail Anggaran →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align:center;padding-top:20px;">
              <p style="font-size:12px;color:#9ca3af;margin:0;">
                Email ini dikirim oleh FinanceKu · <a href="${process.env.AUTH_URL}" style="color:#10b981;">financeku.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}