import {
  AlertTriangle,
  ChevronRight,
  Copy,
  Download,
  FileText,
  ImagePlus,
  Printer,
  RefreshCw,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { Sidebar } from "../components/Layout";
import { getTool } from "../data/tools";
import { buildPayload, type FormValues, validatePayload } from "../services/payloads";
import { addHistory } from "../services/storage";
import {
  defaultSettings,
  downloadBlob,
  downloadQR,
  qrDataUrl,
  qrSvg,
  type QRSettings,
} from "../services/qr";
import { BarcodeTool, BulkTool, DecoderTool, ScannerTool } from "./special/SpecialTools";

type Field = {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
  options?: string[];
  half?: boolean;
};

const formMap: Record<string, { fields: Field[]; defaults: FormValues }> = {
  "qr-code-generator": {
    fields: [
      {
        key: "content",
        label: "Enter URL, text or custom content",
        type: "textarea",
        placeholder: "https://www.example.com",
      },
    ],
    defaults: { content: "https://www.example.com" },
  },
  "wifi-qr-code-generator": {
    fields: [
      { key: "ssid", label: "Network name (SSID)", placeholder: "Office WiFi" },
      {
        key: "security",
        label: "Security type",
        type: "select",
        options: ["WPA", "WEP", "None"],
        half: true,
      },
      {
        key: "password",
        label: "Password",
        type: "password",
        placeholder: "At least 8 characters",
        half: true,
      },
      { key: "hidden", label: "Hidden network", type: "checkbox" },
    ],
    defaults: { ssid: "Office WiFi", security: "WPA", password: "password123", hidden: false },
  },
  "whatsapp-qr-code-generator": {
    fields: [
      { key: "country", label: "Country code", placeholder: "+1", half: true },
      { key: "phone", label: "Phone number", placeholder: "555 123 4567", half: true },
      {
        key: "message",
        label: "Pre-filled message",
        type: "textarea",
        placeholder: "Hi! I would like to know more.",
      },
    ],
    defaults: { country: "+1", phone: "5551234567", message: "Hi! I would like to know more." },
  },
  "vcard-qr-code-generator": {
    fields: [
      { key: "firstName", label: "First name", half: true },
      { key: "lastName", label: "Last name", half: true },
      { key: "organization", label: "Organization", half: true },
      { key: "title", label: "Job title", half: true },
      { key: "phone", label: "Mobile number", half: true },
      { key: "email", label: "Email", type: "email", half: true },
      { key: "website", label: "Website", half: true },
      { key: "address", label: "Address", half: true },
    ],
    defaults: {
      firstName: "Alex",
      lastName: "Morgan",
      organization: "",
      title: "",
      phone: "+15551234567",
      email: "alex@example.com",
      website: "",
      address: "",
    },
  },
  "email-qr-code-generator": {
    fields: [
      { key: "email", label: "Recipient", type: "email", placeholder: "hello@example.com" },
      { key: "subject", label: "Subject", placeholder: "Let’s connect" },
      { key: "message", label: "Message", type: "textarea", placeholder: "Write your message" },
    ],
    defaults: { email: "hello@example.com", subject: "Hello", message: "" },
  },
  "phone-qr-code-generator": {
    fields: [
      { key: "country", label: "Country code", placeholder: "+1", half: true },
      { key: "phone", label: "Phone number", placeholder: "555 123 4567", half: true },
    ],
    defaults: { country: "+1", phone: "5551234567" },
  },
  "sms-qr-code-generator": {
    fields: [
      { key: "phone", label: "Phone number", placeholder: "+1 555 123 4567" },
      { key: "message", label: "SMS message", type: "textarea", placeholder: "Type your message" },
    ],
    defaults: { phone: "+15551234567", message: "Hello from QR Tools!" },
  },
  "location-qr-code-generator": {
    fields: [
      { key: "latitude", label: "Latitude", placeholder: "40.7128", half: true },
      { key: "longitude", label: "Longitude", placeholder: "-74.0060", half: true },
      { key: "place", label: "Optional place name", placeholder: "New York City" },
    ],
    defaults: { latitude: "40.7128", longitude: "-74.0060", place: "New York City" },
  },
  "google-review-qr-code-generator": {
    fields: [
      {
        key: "url",
        label: "Google Business review URL",
        type: "url",
        placeholder: "https://g.page/r/your-business/review",
      },
    ],
    defaults: { url: "https://g.page/r/your-business/review" },
  },
  "social-media-qr-code-generator": {
    fields: [
      {
        key: "platform",
        label: "Platform",
        type: "select",
        options: [
          "Instagram",
          "Facebook",
          "YouTube",
          "LinkedIn",
          "X",
          "Pinterest",
          "Telegram",
          "Snapchat",
          "TikTok",
          "Website",
        ],
      },
      {
        key: "url",
        label: "Profile URL",
        type: "url",
        placeholder: "https://instagram.com/yourprofile",
      },
    ],
    defaults: { platform: "Instagram", url: "https://instagram.com/example" },
  },
  "qr-code-with-logo": {
    fields: [
      {
        key: "content",
        label: "QR content",
        type: "textarea",
        placeholder: "https://www.example.com",
      },
      { key: "logo", label: "Upload logo", type: "file" },
    ],
    defaults: { content: "https://www.example.com", logo: "" },
  },
};

export function ToolPage() {
  const { toolId = "qr-code-generator" } = useParams();
  const tool = getTool(toolId);
  const special =
    toolId === "qr-code-scanner" ? (
      <ScannerTool />
    ) : toolId === "barcode-generator" ? (
      <BarcodeTool />
    ) : toolId === "qr-code-decoder" ? (
      <DecoderTool />
    ) : toolId === "bulk-qr-code-generator" ? (
      <BulkTool />
    ) : null;

  useEffect(() => {
    document.title = `${tool.name} – Free Offline Tool`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", tool.description);
  }, [tool]);

  return (
    <div className="tool-layout">
      <Sidebar active={toolId} />
      <div className="tool-main">
        <div className="breadcrumbs">
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <span>{tool.name}</span>
        </div>
        <header className="tool-title">
          <span style={{ color: tool.color }}>
            <tool.icon />
          </span>
          <div>
            <h1>{tool.name}</h1>
            <p>{tool.description}</p>
          </div>
        </header>
        {special ?? <GeneratorWorkspace key={toolId} toolId={toolId} />}
        <section className="tool-explainer">
          <h2>How it works</h2>
          <div>
            <span>1</span>
            <p>
              <strong>Enter your details</strong>Your input remains in this browser.
            </p>
            <span>2</span>
            <p>
              <strong>Customize the result</strong>Choose size, colours and correction.
            </p>
            <span>3</span>
            <p>
              <strong>Download or print</strong>Export a high-quality local file.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function GeneratorWorkspace({ toolId }: { toolId: string }) {
  const config = formMap[toolId] ?? formMap["qr-code-generator"];
  const [values, setValues] = useState<FormValues>(config.defaults);
  const [settings, setSettings] = useState<QRSettings>(defaultSettings);
  const [preview, setPreview] = useState("");
  const [logo, setLogo] = useState("");
  const [save, setSave] = useState(false);
  const error = useMemo(() => validatePayload(toolId, values), [toolId, values]);
  const payload = useMemo(() => buildPayload(toolId, values), [toolId, values]);

  useEffect(() => {
    if (error) {
      setPreview("");
      return;
    }
    const timer = setTimeout(
      () =>
        qrDataUrl(payload, settings)
          .then(setPreview)
          .catch(() => setPreview("")),
      120,
    );
    return () => clearTimeout(timer);
  }, [payload, settings, error]);

  const update = (key: string, value: string | boolean) =>
    setValues((current) => ({ ...current, [key]: value }));
  const fileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 2_000_000)
      return alert("Choose an image smaller than 2 MB.");
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result));
    reader.readAsDataURL(file);
  };
  const exportFile = async (format: "png" | "svg") => {
    if (error) return;
    if (toolId === "qr-code-with-logo" && logo) {
      if (format === "png") {
        const qr = await qrDataUrl(payload, { ...settings, size: 1024 });
        const [qrImage, logoImage] = await Promise.all([loadImage(qr), loadImage(logo)]);
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 1024;
        const context = canvas.getContext("2d")!;
        context.drawImage(qrImage, 0, 0, 1024, 1024);
        const size = 180;
        const x = (1024 - size) / 2;
        const y = x;
        context.fillStyle = "#fff";
        context.beginPath();
        context.roundRect(x - 12, y - 12, size + 24, size + 24, 18);
        context.fill();
        context.drawImage(logoImage, x, y, size, size);
        canvas.toBlob((blob) => blob && downloadBlob(blob, "image/png", "qr-code-with-logo.png"));
      } else {
        const svg = await qrSvg(payload, settings);
        const image = `<image href="${logo}" x="41%" y="41%" width="18%" height="18%" preserveAspectRatio="xMidYMid meet"/>`;
        downloadBlob(
          svg.replace("</svg>", `${image}</svg>`),
          "image/svg+xml",
          "qr-code-with-logo.svg",
        );
      }
    } else await downloadQR(payload, settings, format);
    if (save) await addHistory(toolId, payload);
  };
  const saveVcard = () => downloadBlob(payload, "text/vcard", "contact.vcf");

  return (
    <div className="workspace">
      <section className="panel form-panel">
        <div className="panel-heading">
          <div>
            <RefreshCw size={17} />
            <strong>Your content</strong>
          </div>
          <span>Live preview</span>
        </div>
        <div className="form-grid">
          {config.fields.map((field) => (
            <label key={field.key} className={field.half ? "half" : ""}>
              <span>{field.label}</span>
              {field.type === "textarea" ? (
                <textarea
                  value={String(values[field.key] ?? "")}
                  onChange={(e) => update(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                />
              ) : field.type === "select" ? (
                <select
                  value={String(values[field.key] ?? "")}
                  onChange={(e) => update(field.key, e.target.value)}
                >
                  {field.options?.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === "checkbox" ? (
                <span className="check-row">
                  <input
                    type="checkbox"
                    checked={Boolean(values[field.key])}
                    onChange={(e) => update(field.key, e.target.checked)}
                  />{" "}
                  Yes, this network is hidden
                </span>
              ) : field.type === "file" ? (
                <span className="file-button">
                  <ImagePlus size={18} /> Choose PNG or JPG
                  <input
                    hidden
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={fileChange}
                  />
                </span>
              ) : (
                <input
                  type={field.type || "text"}
                  value={String(values[field.key] ?? "")}
                  onChange={(e) => update(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              )}
            </label>
          ))}
        </div>
        {error && (
          <div className="form-error" role="alert">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}
        <div className="customize-title">Customize your QR code</div>
        <div className="settings-grid">
          <label>
            <span>Size</span>
            <select
              value={settings.size}
              onChange={(e) => setSettings({ ...settings, size: +e.target.value })}
            >
              <option value="240">240px</option>
              <option value="320">320px</option>
              <option value="480">480px</option>
            </select>
          </label>
          <label>
            <span>Foreground</span>
            <input
              type="color"
              value={settings.foreground}
              onChange={(e) => setSettings({ ...settings, foreground: e.target.value })}
            />
          </label>
          <label>
            <span>Background</span>
            <input
              type="color"
              value={settings.background}
              onChange={(e) => setSettings({ ...settings, background: e.target.value })}
            />
          </label>
          <label>
            <span>Margin</span>
            <select
              value={settings.margin}
              onChange={(e) => setSettings({ ...settings, margin: +e.target.value })}
            >
              <option value="2">2 modules</option>
              <option value="4">4 modules</option>
              <option value="6">6 modules</option>
            </select>
          </label>
          <label>
            <span>Error correction</span>
            <select
              value={settings.level}
              onChange={(e) =>
                setSettings({ ...settings, level: e.target.value as QRSettings["level"] })
              }
            >
              {["L", "M", "Q", "H"].map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="save-check">
          <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} /> Save
          to local history
        </label>
        <button className="button wide" disabled={Boolean(error)}>
          <QrCodeButton /> Generate QR Code
        </button>
      </section>

      <aside className="panel preview-panel">
        <div className="panel-heading">
          <strong>Your QR code</strong>
          <span className="local-pill">
            <ShieldCheck size={13} /> Local only
          </span>
        </div>
        <div className="qr-preview">
          {preview ? (
            <>
              <img src={preview} alt="Generated QR code preview" />
              {toolId === "qr-code-with-logo" && logo && (
                <span className="logo-overlay">
                  <img src={logo} alt="" />
                </span>
              )}
            </>
          ) : (
            <div className="empty-preview">
              <FileText />
              Enter valid content to preview
            </div>
          )}
        </div>
        <button className="button wide" disabled={!preview} onClick={() => exportFile("png")}>
          <Download size={17} /> Download PNG
        </button>
        <button
          className="button secondary wide"
          disabled={!preview}
          onClick={() => exportFile("svg")}
        >
          <Download size={17} /> Download SVG
        </button>
        {toolId === "vcard-qr-code-generator" && (
          <button className="button secondary wide" onClick={saveVcard}>
            <Download size={17} /> Save .VCF
          </button>
        )}
        <button className="button ghost wide" disabled={!preview} onClick={() => print()}>
          <Printer size={17} /> Print
        </button>
        <button className="payload-copy" onClick={() => navigator.clipboard.writeText(payload)}>
          <Copy size={15} /> Copy encoded content
        </button>
      </aside>
      {toolId === "qr-code-with-logo" && (
        <div className="tip">
          <AlertTriangle size={17} /> Logos can reduce scan reliability. High error correction and a
          small centered logo are recommended.
        </div>
      )}
    </div>
  );
}

function QrCodeButton() {
  return <WandSparkles size={16} aria-hidden="true" />;
}
function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}
