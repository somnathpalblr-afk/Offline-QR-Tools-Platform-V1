import { Link } from "react-router";

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="ScanProGo home — Scan • Generate • Go">
      <img src="/brand/scanprogo-logo.png" width="1000" height="321" alt="ScanProGo — Scan • Generate • Go. 100% Private • Works Offline" />
    </Link>
  );
}
