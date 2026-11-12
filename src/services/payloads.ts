export type FormValues = Record<string, string | boolean>;

const cleanPhone = (value: string) => value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
const escapeWifi = (value: string) => value.replace(/([\\;,":])/g, "\\$1");
const escapeVcard = (value: string) => value.replace(/([\\,;])/g, "\\$1").replace(/\n/g, "\\n");

export function buildPayload(toolId: string, values: FormValues): string {
  const str = (key: string) => String(values[key] ?? "").trim();
  switch (toolId) {
    case "wifi-qr-code-generator": {
      const security = str("security");
      return `WIFI:T:${security === "None" ? "nopass" : security};S:${escapeWifi(str("ssid"))};P:${security === "None" ? "" : escapeWifi(str("password"))};H:${values.hidden ? "true" : "false"};;`;
    }
    case "whatsapp-qr-code-generator": {
      const phone = cleanPhone(`${str("country")}${str("phone")}`).replace(/^\+/, "");
      return `https://wa.me/${phone}${str("message") ? `?text=${encodeURIComponent(str("message"))}` : ""}`;
    }
    case "vcard-qr-code-generator":
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${escapeVcard(str("lastName"))};${escapeVcard(str("firstName"))};;;`,
        `FN:${escapeVcard(`${str("firstName")} ${str("lastName")}`.trim())}`,
        str("organization") && `ORG:${escapeVcard(str("organization"))}`,
        str("title") && `TITLE:${escapeVcard(str("title"))}`,
        str("phone") && `TEL;TYPE=CELL:${cleanPhone(str("phone"))}`,
        str("email") && `EMAIL:${str("email")}`,
        str("website") && `URL:${str("website")}`,
        str("address") && `ADR:;;${escapeVcard(str("address"))};;;;`,
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\r\n");
    case "email-qr-code-generator": {
      const query = new URLSearchParams();
      if (str("subject")) query.set("subject", str("subject"));
      if (str("message")) query.set("body", str("message"));
      return `mailto:${str("email")}${query.size ? `?${query}` : ""}`;
    }
    case "phone-qr-code-generator":
      return `tel:${cleanPhone(`${str("country")}${str("phone")}`)}`;
    case "sms-qr-code-generator":
      return `sms:${cleanPhone(str("phone"))}${str("message") ? `?body=${encodeURIComponent(str("message"))}` : ""}`;
    case "location-qr-code-generator":
      return `geo:${str("latitude")},${str("longitude")}${str("place") ? `?q=${str("latitude")},${str("longitude")}(${encodeURIComponent(str("place"))})` : ""}`;
    case "google-review-qr-code-generator":
    case "social-media-qr-code-generator":
      return str("url");
    default:
      return str("content");
  }
}

export function validatePayload(toolId: string, values: FormValues): string | null {
  const text = (key: string) => String(values[key] ?? "").trim();
  if (toolId === "wifi-qr-code-generator" && !text("ssid")) return "Network name is required.";
  if (
    toolId === "wifi-qr-code-generator" &&
    text("security") !== "None" &&
    text("password").length < 8
  )
    return "Secure WiFi passwords must be at least 8 characters.";
  if (
    ["whatsapp-qr-code-generator", "phone-qr-code-generator"].includes(toolId) &&
    text("phone").replace(/\D/g, "").length < 6
  )
    return "Enter a valid international phone number.";
  if (toolId === "sms-qr-code-generator" && text("phone").replace(/\D/g, "").length < 6)
    return "Enter a valid phone number.";
  if (toolId === "email-qr-code-generator" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text("email")))
    return "Enter a valid email address.";
  if (toolId === "vcard-qr-code-generator" && !text("firstName") && !text("lastName"))
    return "Enter at least a first or last name.";
  if (toolId === "location-qr-code-generator") {
    const lat = Number(text("latitude"));
    const lng = Number(text("longitude"));
    if (
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90 ||
      !Number.isFinite(lng) ||
      lng < -180 ||
      lng > 180
    )
      return "Enter coordinates within valid latitude and longitude ranges.";
  }
  if (["google-review-qr-code-generator", "social-media-qr-code-generator"].includes(toolId)) {
    try {
      const url = new URL(text("url"));
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      return "Enter a valid http or https URL.";
    }
  }
  if (toolId === "qr-code-generator" || toolId === "qr-code-with-logo") {
    if (!text("content")) return "Enter content to generate a QR code.";
    if (text("content").length > 2950) return "Content is too long for reliable QR generation.";
  }
  return null;
}
