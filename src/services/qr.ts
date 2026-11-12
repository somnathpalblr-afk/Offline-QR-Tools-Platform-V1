import QRCode from "qrcode";

export type QRSettings = {
  size: number;
  margin: number;
  foreground: string;
  background: string;
  level: "L" | "M" | "Q" | "H";
};

export const defaultSettings: QRSettings = {
  size: 320,
  margin: 4,
  foreground: "#07132f",
  background: "#ffffff",
  level: "H",
};

export async function qrDataUrl(content: string, settings: QRSettings) {
  return QRCode.toDataURL(content, {
    width: settings.size,
    margin: settings.margin,
    errorCorrectionLevel: settings.level,
    color: { dark: settings.foreground, light: settings.background },
  });
}

export async function qrSvg(content: string, settings: QRSettings) {
  return QRCode.toString(content, {
    type: "svg",
    width: settings.size,
    margin: settings.margin,
    errorCorrectionLevel: settings.level,
    color: { dark: settings.foreground, light: settings.background },
  });
}

export function downloadBlob(data: BlobPart, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadQR(content: string, settings: QRSettings, format: "png" | "svg") {
  if (format === "svg")
    return downloadBlob(await qrSvg(content, settings), "image/svg+xml", "qr-code.svg");
  const data = await qrDataUrl(content, { ...settings, size: Math.max(1024, settings.size) });
  const blob = await (await fetch(data)).blob();
  downloadBlob(blob, "image/png", "qr-code.png");
}
