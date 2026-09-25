/** Remove control characters, collapse whitespace and trim */
export function sanitizeText(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function normalizeEmail(email: string): string {
  const [local, domain] = email.trim().toLowerCase().split("@");
  if (!domain) return email.trim().toLowerCase();
  const noTag = local.split("+")[0];
  const gmailLike = ["gmail.com", "googlemail.com"].includes(domain);
  return `${gmailLike ? noTag.replace(/\./g, "") : noTag}@${domain}`;
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("27") && digits.length > 9) return digits.slice(2);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}