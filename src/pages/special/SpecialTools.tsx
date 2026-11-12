import { BrowserQRCodeReader } from "@zxing/browser";
import JSZip from "jszip";
import JsBarcode from "jsbarcode";
import Papa from "papaparse";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Copy,
  Download,
  FileUp,
  Image,
  LoaderCircle,
  Play,
  Printer,
  Square,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { downloadBlob, qrDataUrl } from "../../services/qr";
import { addHistory, clearHistory, getHistory, type HistoryItem } from "../../services/storage";

export function ScannerTool() {
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef<{ stop: () => void } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("Camera starts only when you ask.");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  useEffect(() => {
    getHistory().then(setHistory);
    return () => controls.current?.stop();
  }, []);

  const start = async () => {
    try {
      setMessage("Starting camera…");
      const reader = new BrowserQRCodeReader();
      controls.current = await reader.decodeFromVideoDevice(undefined, video.current!, (scan) => {
        if (scan) {
          const value = scan.getText();
          setResult(value);
          addHistory("scan", value);
          controls.current?.stop();
          setScanning(false);
          getHistory().then(setHistory);
        }
      });
      setScanning(true);
      setMessage("Point your camera at a QR code.");
    } catch {
      setMessage("Camera access was unavailable. Check permission or upload an image instead.");
    }
  };
  const stop = () => {
    controls.current?.stop();
    controls.current = null;
    setScanning(false);
    setMessage("Scanner stopped. Camera access has been released.");
  };
  const decodeFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10_000_000) return setMessage("Choose an image smaller than 10 MB.");
    const url = URL.createObjectURL(file);
    try {
      const found = await new BrowserQRCodeReader().decodeFromImageUrl(url);
      setResult(found.getText());
      setMessage("QR code decoded locally.");
      await addHistory("scan", found.getText());
      setHistory(await getHistory());
    } catch {
      setMessage("No readable QR code was found in that image.");
    } finally {
      URL.revokeObjectURL(url);
    }
  };
  const isLink = /^https?:\/\//i.test(result);
  const open = () => {
    if (confirm(`Open this untrusted link?\n\n${result}`))
      window.open(result, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="workspace scanner-workspace">
      <section className="panel camera-panel">
        <div className="camera-view">
          <video ref={video} muted playsInline />
          <div className="scan-frame"></div>
          {!scanning && (
            <div className="camera-empty">
              <Camera size={36} />
              <strong>Ready to scan</strong>
              <span>Camera permission is requested only after Start</span>
            </div>
          )}
        </div>
        <div className="scanner-actions">
          <button className="button" onClick={start}>
            <Play size={16} /> Start Camera
          </button>
          <button className="button secondary" onClick={stop}>
            <Square size={15} /> Stop
          </button>
          <label className="button secondary">
            <Upload size={16} /> Upload Image
            <input
              hidden
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={decodeFile}
            />
          </label>
        </div>
        <div className="tip">
          <AlertCircle size={17} />
          {message}
        </div>
      </section>
      <section className="scanner-side">
        <div className="panel result-panel">
          <div className="panel-heading">
            <strong>Scan result</strong>
          </div>
          <div className={result ? "result-value success" : "result-value"}>
            {result ? <CheckCircle2 /> : <ScanPlaceholder />}
            <strong>{result || "Your decoded content will appear here"}</strong>
          </div>
          <div className="scanner-actions">
            {isLink && (
              <button className="button" onClick={open}>
                Open Link
              </button>
            )}
            <button
              className="button secondary"
              disabled={!result}
              onClick={() => navigator.clipboard.writeText(result)}
            >
              <Copy size={16} /> Copy
            </button>
          </div>
        </div>
        <div className="panel history-panel">
          <div className="panel-heading">
            <strong>Local scan history</strong>
            <button
              onClick={async () => {
                await clearHistory();
                setHistory([]);
              }}
            >
              Clear
            </button>
          </div>
          {history.slice(0, 4).map((item) => (
            <div className="history-item" key={item.id}>
              <span>{item.content}</span>
              <small>{new Date(item.createdAt).toLocaleString()}</small>
            </div>
          ))}
          {!history.length && <p>No saved scans yet.</p>}
        </div>
      </section>
    </div>
  );
}
function ScanPlaceholder() {
  return <Camera />;
}

const formats = ["CODE128", "CODE39", "EAN13", "EAN8", "UPC", "UPCE", "ITF14"];
function validateBarcode(format: string, value: string) {
  if (!value) return "Enter barcode data.";
  if (format === "CODE39" && !/^[0-9A-Z .$/+%-]+$/.test(value))
    return "Code 39 supports uppercase letters, numbers and . $ / + % - only.";
  const lengths: Record<string, number[]> = {
    EAN13: [13],
    EAN8: [8],
    UPC: [12],
    UPCE: [8],
    ITF14: [14],
  };
  if (lengths[format] && (!/^\d+$/.test(value) || !lengths[format].includes(value.length)))
    return `${format} requires exactly ${lengths[format][0]} digits.`;
  if (
    ["EAN13", "EAN8", "UPC", "ITF14"].includes(format) &&
    /^\d+$/.test(value) &&
    !hasValidCheckDigit(value)
  )
    return `The ${format} check digit is invalid. Product identifiers are never modified automatically.`;
  return "";
}
function hasValidCheckDigit(value: string) {
  const digits = value.split("").map(Number);
  const supplied = digits.pop();
  const sum = digits.reduce(
    (total, digit, index) => total + digit * ((digits.length - index) % 2 === 1 ? 3 : 1),
    0,
  );
  return (10 - (sum % 10)) % 10 === supplied;
}
export function BarcodeTool() {
  const svg = useRef<SVGSVGElement>(null);
  const [format, setFormat] = useState("CODE128");
  const [value, setValue] = useState("123456789012");
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [showText, setShowText] = useState(true);
  const error = validateBarcode(format, value);
  useEffect(() => {
    if (!svg.current || error) return;
    try {
      JsBarcode(svg.current, value, {
        format,
        width,
        height,
        displayValue: showText,
        margin: 14,
        background: "#fff",
        lineColor: "#07132f",
      });
    } catch {
      /* validation message handles unsupported input */
    }
  }, [format, value, width, height, showText, error]);
  const downloadSvg = () => {
    if (!svg.current || error) return;
    downloadBlob(
      new XMLSerializer().serializeToString(svg.current),
      "image/svg+xml",
      "barcode.svg",
    );
  };
  const downloadPng = () => {
    if (!svg.current || error) return;
    const source = new XMLSerializer().serializeToString(svg.current);
    const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml" }));
    const image = new window.Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width * 2;
      canvas.height = image.height * 2;
      canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => blob && downloadBlob(blob, "image/png", "barcode.png"));
      URL.revokeObjectURL(url);
    };
    image.src = url;
  };
  return (
    <div className="panel barcode-panel">
      <div className="barcode-fields">
        <label>
          <span>Barcode type</span>
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            {formats.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Data</span>
          <input value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        <label>
          <span>Bar width</span>
          <input
            type="number"
            min="1"
            max="4"
            value={width}
            onChange={(e) => setWidth(+e.target.value)}
          />
        </label>
        <label>
          <span>Height (px)</span>
          <input
            type="number"
            min="50"
            max="240"
            value={height}
            onChange={(e) => setHeight(+e.target.value)}
          />
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={showText}
            onChange={(e) => setShowText(e.target.checked)}
          />{" "}
          Show text
        </label>
      </div>
      {error && (
        <div className="form-error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      <div className="barcode-preview">
        <svg ref={svg} aria-label="Generated barcode preview" />
      </div>
      <div className="barcode-buttons">
        <button className="button" disabled={!!error} onClick={downloadPng}>
          <Download size={16} /> Download PNG
        </button>
        <button className="button secondary" disabled={!!error} onClick={downloadSvg}>
          <Download size={16} /> Download SVG
        </button>
        <button className="button ghost" onClick={() => print()}>
          <Printer size={16} /> Print
        </button>
      </div>
      <div className="success-strip">
        <span>
          <CheckCircle2 />7 industry formats
        </span>
        <span>
          <CheckCircle2 />
          High-quality output
        </span>
        <span>
          <CheckCircle2 />
          100% offline
        </span>
      </div>
    </div>
  );
}

export function DecoderTool() {
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("Choose a PNG, JPG or WebP image up to 10 MB.");
  const decode = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 10_000_000)
      return setStatus("Unsupported file. Use PNG, JPG or WebP under 10 MB.");
    setStatus("Decoding locally…");
    const url = URL.createObjectURL(file);
    try {
      const found = await new BrowserQRCodeReader().decodeFromImageUrl(url);
      setResult(found.getText());
      setStatus("QR code decoded successfully.");
    } catch {
      setResult("");
      setStatus("No readable QR code was found.");
    } finally {
      URL.revokeObjectURL(url);
    }
  };
  const isLink = /^https?:\/\//i.test(result);
  return (
    <div className="decoder-grid">
      <label className="panel drop-zone">
        <Image size={42} />
        <strong>Drop your QR image here</strong>
        <span>or click to choose a local image</span>
        <small>PNG, JPG, JPEG or WebP · Max 10 MB</small>
        <input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={decode} />
      </label>
      <section className="panel decode-result">
        <div className="panel-heading">
          <strong>Decoded content</strong>
        </div>
        {result ? (
          <>
            <CheckCircle2 className="success-icon" />
            <pre>{result}</pre>
            <div className="scanner-actions">
              <button className="button" onClick={() => navigator.clipboard.writeText(result)}>
                <Copy size={16} /> Copy
              </button>
              {isLink && (
                <button
                  className="button secondary"
                  onClick={() =>
                    confirm(`Open this untrusted link?\n\n${result}`) &&
                    window.open(result, "_blank", "noopener,noreferrer")
                  }
                >
                  Open link
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <FileUp size={38} />
            <p>{status}</p>
          </>
        )}
      </section>
    </div>
  );
}

type BulkRow = { name: string; content: string; valid: boolean };
export function BulkTool() {
  const [mode, setMode] = useState<"csv" | "text">("csv");
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const cancelled = useRef(false);
  const parseCsv = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) =>
        setRows(
          data.map((row, index) => ({
            name: row.name || `qr-${index + 1}`,
            content: row.content || "",
            valid: Boolean(row.content?.trim()),
          })),
        ),
    });
  };
  const parseText = () =>
    setRows(
      text
        .split("\n")
        .filter(Boolean)
        .map((content, index) => ({
          name: `qr-${index + 1}`,
          content: content.trim(),
          valid: Boolean(content.trim()),
        })),
    );
  const generate = async () => {
    const valid = rows.filter((row) => row.valid);
    if (!valid.length) return;
    setRunning(true);
    cancelled.current = false;
    setProgress(0);
    const zip = new JSZip();
    const worker = new Worker(new URL("../../workers/bulkQR.worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = async (
      event: MessageEvent<{ index?: number; name?: string; base64?: string; done?: boolean }>,
    ) => {
      if (cancelled.current) {
        worker.terminate();
        setRunning(false);
        return;
      }
      if (event.data.done) {
        downloadBlob(await zip.generateAsync({ type: "blob" }), "application/zip", "qr-codes.zip");
        worker.terminate();
        setRunning(false);
        return;
      }
      if (event.data.name && event.data.base64 && event.data.index !== undefined) {
        zip.file(
          `${event.data.name.replace(/[^a-z0-9_-]/gi, "-").slice(0, 60)}.png`,
          event.data.base64,
          { base64: true },
        );
        setProgress(Math.round(((event.data.index + 1) / valid.length) * 100));
      }
    };
    worker.onerror = () => {
      worker.terminate();
      setRunning(false);
    };
    worker.postMessage({ rows: valid.map(({ name, content }) => ({ name, content })) });
  };
  return (
    <div className="panel bulk-panel">
      <div className="tabs">
        <button className={mode === "csv" ? "active" : ""} onClick={() => setMode("csv")}>
          CSV File
        </button>
        <button className={mode === "text" ? "active" : ""} onClick={() => setMode("text")}>
          Text List
        </button>
      </div>
      {mode === "csv" ? (
        <label className="drop-zone">
          <Upload size={42} />
          <strong>Drop your CSV file here</strong>
          <span>or click to upload</span>
          <small>Columns: name, content</small>
          <input hidden type="file" accept=".csv,text/csv" onChange={parseCsv} />
        </label>
      ) : (
        <div className="text-import">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"https://example.com\nHello world\nmailto:hello@example.com"}
            rows={8}
          />
          <button className="button secondary" onClick={parseText}>
            Import list
          </button>
        </div>
      )}
      {rows.length > 0 && (
        <div className="bulk-preview">
          <div className="panel-heading">
            <strong>Imported rows ({rows.length})</strong>
            <span>{rows.filter((row) => !row.valid).length} invalid</span>
          </div>
          {rows.slice(0, 5).map((row, index) => (
            <div key={index}>
              <span>
                {row.valid ? <CheckCircle2 /> : <XCircle />}
                {row.name}
              </span>
              <code>{row.content || "Missing content"}</code>
            </div>
          ))}
        </div>
      )}
      {running && (
        <div className="progress">
          <span style={{ width: `${progress}%` }}></span>
          <strong>{progress}%</strong>
        </div>
      )}
      <div className="bulk-actions">
        <button
          className="button"
          disabled={!rows.some((r) => r.valid) || running}
          onClick={generate}
        >
          {running ? <LoaderCircle className="spin" /> : <Download />} Generate & Download ZIP
        </button>
        {running && (
          <button
            className="button secondary"
            onClick={() => {
              cancelled.current = true;
            }}
          >
            <Trash2 /> Cancel
          </button>
        )}
      </div>
    </div>
  );
}
