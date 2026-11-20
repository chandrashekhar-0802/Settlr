import "server-only";

/** Sends a transactional email via Resend when configured. Returns whether it was actually sent. */
export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, text }),
    });
    if (!res.ok) console.error("email send failed:", res.status);
    return res.ok;
  } catch {
    console.error("email send failed: network");
    return false;
  }
}
