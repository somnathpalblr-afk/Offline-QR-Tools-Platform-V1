import QRCode from "qrcode";

self.onmessage = async (event: MessageEvent<{ rows: { name: string; content: string }[] }>) => {
  for (let index = 0; index < event.data.rows.length; index++) {
    const row = event.data.rows[index];
    const data = await QRCode.toDataURL(row.content, {
      width: 512,
      margin: 4,
      errorCorrectionLevel: "H",
      color: { dark: "#07132f", light: "#ffffff" },
    });
    self.postMessage({ index, name: row.name, base64: data.split(",")[1] });
  }
  self.postMessage({ done: true });
};
