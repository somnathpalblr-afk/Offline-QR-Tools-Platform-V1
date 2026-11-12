import QRCode from "qrcode";

self.onmessage = async (event: MessageEvent<{ rows: { name: string; content: string }[] }>) => {
  for (let index = 0; index < event.data.rows.length; index++) {
    const row = event.data.rows[index];
    const canvas = new OffscreenCanvas(512, 512);
    await QRCode.toCanvas(canvas as unknown as HTMLCanvasElement, row.content, {
      width: 512,
      margin: 4,
      errorCorrectionLevel: "H",
      color: { dark: "#07132f", light: "#ffffff" },
    });
    const blob = await canvas.convertToBlob({ type: "image/png" });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    self.postMessage({ index, name: row.name, base64: btoa(binary) });
  }
  self.postMessage({ done: true });
};
