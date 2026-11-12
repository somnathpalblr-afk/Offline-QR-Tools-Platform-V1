import {
  Barcode,
  Contact,
  FileSpreadsheet,
  Globe2,
  ImagePlus,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  QrCode,
  ScanLine,
  Star,
  Wifi,
} from "lucide-react";

export type ToolId =
  | "qr-code-generator"
  | "qr-code-scanner"
  | "wifi-qr-code-generator"
  | "whatsapp-qr-code-generator"
  | "barcode-generator"
  | "vcard-qr-code-generator"
  | "email-qr-code-generator"
  | "phone-qr-code-generator"
  | "sms-qr-code-generator"
  | "location-qr-code-generator"
  | "google-review-qr-code-generator"
  | "social-media-qr-code-generator"
  | "qr-code-with-logo"
  | "qr-code-decoder"
  | "bulk-qr-code-generator";

export const tools = [
  {
    id: "qr-code-generator",
    name: "QR Code Generator",
    short: "QR Generator",
    description: "Create a QR code for any text, URL or data.",
    icon: QrCode,
    color: "#0969f6",
  },
  {
    id: "qr-code-scanner",
    name: "QR Code Scanner",
    short: "QR Scanner",
    description: "Scan with your camera or upload an image.",
    icon: ScanLine,
    color: "#1675ff",
  },
  {
    id: "wifi-qr-code-generator",
    name: "WiFi QR Generator",
    short: "WiFi QR",
    description: "Share WiFi access without revealing it online.",
    icon: Wifi,
    color: "#1689ea",
  },
  {
    id: "whatsapp-qr-code-generator",
    name: "WhatsApp QR Generator",
    short: "WhatsApp QR",
    description: "Start a WhatsApp conversation instantly.",
    icon: MessageCircle,
    color: "#20bd5a",
  },
  {
    id: "barcode-generator",
    name: "Barcode Generator",
    short: "Barcode",
    description: "Create professional barcodes in multiple formats.",
    icon: Barcode,
    color: "#111827",
  },
  {
    id: "vcard-qr-code-generator",
    name: "vCard QR Generator",
    short: "vCard QR",
    description: "Share contact details with one scan.",
    icon: Contact,
    color: "#1767ea",
  },
  {
    id: "email-qr-code-generator",
    name: "Email QR Generator",
    short: "Email QR",
    description: "Pre-fill a recipient, subject and message.",
    icon: Mail,
    color: "#0874ec",
  },
  {
    id: "phone-qr-code-generator",
    name: "Phone QR Generator",
    short: "Phone QR",
    description: "Create a scannable telephone link.",
    icon: Phone,
    color: "#263b77",
  },
  {
    id: "sms-qr-code-generator",
    name: "SMS QR Generator",
    short: "SMS QR",
    description: "Create a ready-to-send text message.",
    icon: MessageSquare,
    color: "#f5b829",
  },
  {
    id: "location-qr-code-generator",
    name: "Location QR Generator",
    short: "Location QR",
    description: "Share coordinates without geocoding.",
    icon: MapPin,
    color: "#ee4555",
  },
  {
    id: "google-review-qr-code-generator",
    name: "Google Review QR Generator",
    short: "Google Review",
    description: "Turn your supplied review link into a QR.",
    icon: Star,
    color: "#f55b2a",
  },
  {
    id: "social-media-qr-code-generator",
    name: "Social Media QR Generator",
    short: "Social Media",
    description: "Share any social profile URL.",
    icon: Globe2,
    color: "#7c3aed",
  },
  {
    id: "qr-code-with-logo",
    name: "QR Code with Logo",
    short: "QR with Logo",
    description: "Add your logo while preserving readability.",
    icon: ImagePlus,
    color: "#0a75f5",
  },
  {
    id: "qr-code-decoder",
    name: "QR Decoder",
    short: "QR Decoder",
    description: "Decode a QR image privately on your device.",
    icon: ScanLine,
    color: "#273b73",
  },
  {
    id: "bulk-qr-code-generator",
    name: "Bulk QR Generator",
    short: "Bulk QR",
    description: "Generate multiple QR codes from CSV or text.",
    icon: FileSpreadsheet,
    color: "#17b830",
  },
] as const;

export type Tool = (typeof tools)[number];
export const getTool = (id?: string) => tools.find((tool) => tool.id === id) ?? tools[0];
