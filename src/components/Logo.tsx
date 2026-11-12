import { QrCode } from "lucide-react";
import { Link } from "react-router";

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="QR Tools home">
      <span className="logo-mark">
        <QrCode size={25} strokeWidth={2.6} />
      </span>
      <span>QR Tools</span>
    </Link>
  );
}
