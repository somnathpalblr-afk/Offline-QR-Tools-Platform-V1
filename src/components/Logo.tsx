import { useEffect } from "react";
import { Link } from "react-router";
import { useTheme } from "../app/ThemeProvider";

const LOGOS = {
  light: "/brand/scanprogo-logo.png",
  dark: "/brand/scanprogo-logo-dark.png",
} as const;

export function Logo() {
  const { theme } = useTheme();

  // Preload both variants so switching themes never shows a blank frame.
  useEffect(() => {
    Object.values(LOGOS).forEach((src) => {
      new Image().src = src;
    });
  }, []);

  return (
    <Link to="/" className="logo" aria-label="ScanProGo home — Scan • Generate • Go">
      <img
        src={LOGOS[theme]}
        width="2172"
        height="724"
        alt="ScanProGo — Scan • Generate • Go. 100% Private • Works Offline"
      />
    </Link>
  );
}
