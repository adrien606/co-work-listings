import { Link, useLocation } from "react-router-dom";
import { OWNER } from "@/lib/supabase";
import { Mail, Phone, Menu, X, ExternalLink } from "lucide-react";
import logoBelaircamp from "@/assets/logo-belaircamp.png";
import { useState } from "react";

export default function PublicHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: "/", label: "Catalogue" },
    { to: "/a-propos", label: "À propos" },
    { to: "https://belaircamp.org", label: "belaircamp.org", external: true },
  ];

  return (
    <header className="bg-primary sticky top-0 z-50">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoBelaircamp} alt="Bel Air Camp" className="h-10 w-auto invert brightness-0 invert" style={{ filter: "brightness(0) invert(1)" }} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) =>
            l.external ? (
              <a
                key={l.to}
                href={l.to}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm font-medium text-lavender hover:text-gold transition-colors"
              >
                {l.label} <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === l.to ? "text-gold" : "text-lavender hover:text-primary-foreground"
                }`}
              >
                {l.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4 text-sm">
          <a href={`mailto:${OWNER.email}`} className="flex items-center gap-1.5 text-lavender hover:text-gold transition-colors">
            <Mail className="h-4 w-4" /> {OWNER.email}
          </a>
          <a href={`tel:${OWNER.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 text-lavender hover:text-gold transition-colors">
            <Phone className="h-4 w-4" /> {OWNER.phone}
          </a>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-primary-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-primary border-t border-sidebar-border pb-4">
          <nav className="container flex flex-col gap-3 pt-3">
            {links.map((l) =>
              l.external ? (
                <a key={l.to} href={l.to} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="text-lavender hover:text-gold py-1 flex items-center gap-1">
                  {l.label} <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-lavender hover:text-gold py-1">
                  {l.label}
                </Link>
              )
            )}
            <div className="flex flex-col gap-2 text-sm text-lavender pt-2 border-t border-sidebar-border">
              <span className="text-primary-foreground font-medium">{OWNER.name}</span>
              <a href={`mailto:${OWNER.email}`} className="hover:text-gold">{OWNER.email}</a>
              <a href={`tel:${OWNER.phone.replace(/\s/g, "")}`} className="hover:text-gold">{OWNER.phone}</a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
