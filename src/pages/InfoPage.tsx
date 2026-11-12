import { Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { clearAllLocalData } from "../services/storage";

export function InfoPage({ type }: { type: "about" | "privacy" | "contact" }) {
  const [cleared, setCleared] = useState(false);
  const content = {
    about: {
      icon: Sparkles,
      title: "Useful tools. Thoughtful privacy.",
      intro:
        "QR Tools is an offline-first utility suite designed to make everyday QR and barcode tasks fast, accessible and private.",
    },
    privacy: {
      icon: ShieldCheck,
      title: "Your data stays on your device.",
      intro:
        "We do not upload your QR content, images, WiFi passwords or contact details. Processing happens locally in your browser.",
    },
    contact: {
      icon: Mail,
      title: "We would love to hear from you.",
      intro:
        "Have a question or suggestion? This demo does not transmit form data. Reach the project team through your deployment contact channel.",
    },
  }[type];
  return (
    <section className="info-page">
      <content.icon />
      <span className="eyebrow blue">QR TOOLS</span>
      <h1>{content.title}</h1>
      <p>{content.intro}</p>
      <div className="info-card">
        <h2>Simple, transparent and local</h2>
        <p>
          No account is required. History is optional and stored in IndexedDB. You can clear it at
          any time. Browser storage may be cleared by your operating system or browser.
        </p>
        {type === "privacy" && (
          <button
            className="button secondary"
            onClick={async () => {
              if (confirm("Delete all QR Tools history and preferences stored on this device?")) {
                await clearAllLocalData();
                setCleared(true);
              }
            }}
          >
            {cleared ? "Local data deleted" : "Delete all local data"}
          </button>
        )}
      </div>
    </section>
  );
}
