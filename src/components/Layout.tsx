import { ChevronDown, Menu, Moon, ShieldCheck, WifiOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { tools } from "../data/tools";
import { Logo } from "./Logo";

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [installEvent, setInstallEvent] = useState<Event | null>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname]);
  useEffect(() => {
    const status = () => setOnline(navigator.onLine);
    const capture = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    addEventListener("online", status);
    addEventListener("offline", status);
    addEventListener("beforeinstallprompt", capture);
    return () => {
      removeEventListener("online", status);
      removeEventListener("offline", status);
      removeEventListener("beforeinstallprompt", capture);
    };
  }, []);
  const install = async () => {
    if (installEvent && "prompt" in installEvent)
      await (installEvent as Event & { prompt: () => Promise<void> }).prompt();
    else alert("Use your browser menu and choose “Install app” or “Add to Home Screen”.");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <Logo />
        <nav className="desktop-nav" aria-label="Primary navigation">
          <NavLink to="/">Home</NavLink>
          <Link to="/qr-code-generator">
            All Tools <ChevronDown size={14} />
          </Link>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/privacy">Privacy</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
        <div className="header-actions">
          <span className={`connection ${online ? "" : "offline"}`}>
            {online ? <ShieldCheck size={14} /> : <WifiOff size={14} />}
            {online ? "Local processing" : "Working offline"}
          </span>
          <button className="icon-button theme-button" aria-label="Toggle appearance">
            <Moon size={19} />
          </button>
          <button className="button small" onClick={install}>
            Install App
          </button>
          <button
            className="icon-button menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <div className="mobile-menu">
            <Link to="/">Home</Link>
            <Link to="/qr-code-generator">All Tools</Link>
            <Link to="/about">About</Link>
            <Link to="/privacy">Privacy</Link>
          </div>
        )}
      </header>
      <main id="main-content">
        <Outlet />
      </main>
      <footer>
        <div>
          <Logo />
          <p>Private QR and barcode tools that work on your device.</p>
        </div>
        <div>
          <strong>Popular tools</strong>
          <Link to="/qr-code-generator">QR Generator</Link>
          <Link to="/qr-code-scanner">QR Scanner</Link>
          <Link to="/barcode-generator">Barcode Generator</Link>
        </div>
        <div>
          <strong>Privacy</strong>
          <span>No accounts</span>
          <span>No uploads</span>
          <span>No tracking</span>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} QR Tools. Built for privacy.
        </div>
      </footer>
    </div>
  );
}

export function Sidebar({ active }: { active: string }) {
  return (
    <aside className="sidebar">
      <strong>All Tools</strong>
      <nav aria-label="Tools">
        {tools.map((tool) => (
          <NavLink key={tool.id} to={`/${tool.id}`} className={active === tool.id ? "active" : ""}>
            <tool.icon size={17} />
            <span>{tool.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
