// UK-shaped numbers ("07700 900000") are the common case here, so a leading
// 0 is swapped for the UK country code -- wa.me needs digits with a country
// code and no leading zero, unlike tel: which accepts the number as typed.
export function toWhatsAppDigits(phone: string): string {
  const digits = phone.trim().replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits.slice(1);
  if (digits.startsWith("0")) return `44${digits.slice(1)}`;
  return digits;
}

export function whatsAppLink(phone: string, message?: string): string {
  const base = `https://wa.me/${toWhatsAppDigits(phone)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export type MessageVariables = {
  name: string;
  parent: string;
  age: string;
  level: string;
  time: string;
};

// Shown as insertable buttons in the message composer -- token order here is
// the order they're offered in.
export const MESSAGE_VARIABLES: { token: keyof MessageVariables; label: string }[] = [
  { token: "name", label: "Student name" },
  { token: "parent", label: "Parent name" },
  { token: "age", label: "Age" },
  { token: "level", label: "Level" },
  { token: "time", label: "Lesson time" },
];

export function resolveTemplate(template: string, vars: MessageVariables): string {
  return MESSAGE_VARIABLES.reduce(
    (text, { token }) => text.replaceAll(`{{${token}}}`, vars[token]),
    template
  );
}
