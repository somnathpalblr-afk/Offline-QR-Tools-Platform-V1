import {
  ArrowRight,
  Barcode,
  Check,
  Infinity,
  LockKeyhole,
  QrCode,
  Rocket,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { Link } from "react-router";
import { tools } from "../data/tools";

export function HomePage() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <Check size={14} /> 100% Offline · No Backend Required
          </div>
          <h1>
            All-in-One QR &<br />
            Barcode <span>Toolkit</span>
          </h1>
          <p>Generate, scan, decode and export — completely offline. Fast, secure and free.</p>
          <div className="hero-actions">
            <Link to="/qr-code-generator" className="button">
              <Rocket size={18} /> Explore All Tools <ArrowRight size={17} />
            </Link>
            <button
              className="button secondary"
              onClick={() => alert("Use your browser menu to install QR Tools.")}
            >
              Install App
            </button>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one"></div>
          <div className="orbit orbit-two"></div>
          <div className="floating-icon icon-wifi">
            <Wifi />
          </div>
          <div className="floating-icon icon-barcode">
            <Barcode />
          </div>
          <div className="floating-icon icon-lock">
            <LockKeyhole />
          </div>
          <div className="qr-hero-card">
            <QrCode size={142} strokeWidth={1.65} />
          </div>
        </div>
      </section>

      <section className="tools-showcase">
        <div className="section-heading">
          <div>
            <span className="heading-icon">
              <QrCode />
            </span>
            <h2>Our 15 Powerful Tools</h2>
          </div>
          <Link to="/qr-code-generator">
            View All Tools <ArrowRight size={16} />
          </Link>
        </div>
        <div className="tool-grid">
          {tools.map((tool) => (
            <Link to={`/${tool.id}`} className="tool-card" key={tool.id}>
              <span className="tool-icon" style={{ color: tool.color }}>
                <tool.icon />
              </span>
              <strong>{tool.short}</strong>
              <span>{tool.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="trust-strip">
        <div>
          <ShieldCheck />
          <span>
            <strong>Your Privacy Matters</strong>All processing happens on your device.
          </span>
        </div>
        <div>
          <Rocket />
          <span>
            <strong>Lightning Fast</strong>No upload wait times
          </span>
        </div>
        <div>
          <LockKeyhole />
          <span>
            <strong>100% Private</strong>Your data stays yours
          </span>
        </div>
        <div>
          <Infinity />
          <span>
            <strong>Works Offline</strong>Available anywhere
          </span>
        </div>
      </section>

      <section className="home-content">
        <span className="eyebrow blue">PRIVATE BY DESIGN</span>
        <h2>Everything you need, nothing you don't.</h2>
        <p>
          QR Tools is built for people who want powerful utilities without trading away their data.
          Every code is generated locally in your browser.
        </p>
        <div className="feature-grid">
          <article>
            <ShieldCheck />
            <h3>Private by default</h3>
            <p>Content, passwords, contacts and images never leave your device.</p>
          </article>
          <article>
            <Wifi />
            <h3>Offline-ready</h3>
            <p>Install once and keep generating even without a connection.</p>
          </article>
          <article>
            <QrCode />
            <h3>Professional output</h3>
            <p>Download crisp PNG and vector SVG files ready for print.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
