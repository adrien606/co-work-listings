import { OWNER } from "@/lib/supabase";
import { Mail, Phone, ExternalLink, Linkedin, Calendar } from "lucide-react";
import logoBelaircamp from "@/assets/logo-belaircamp.png";

export default function PublicFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <img src={logoBelaircamp} alt="Bel Air Camp" className="h-12 w-auto mb-3" style={{ filter: "brightness(0) invert(1)" }} />
            <p className="text-lavender text-sm">
              Espaces de co-working, bureaux privatifs, ateliers et salles de formation.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3 text-gold">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-lavender">
              <span className="text-primary-foreground font-medium">{OWNER.name}</span>
              <a href={`mailto:${OWNER.email}`} className="flex items-center gap-2 hover:text-gold transition-colors">
                <Mail className="h-4 w-4" /> {OWNER.email}
              </a>
              <a href={`tel:${OWNER.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-gold transition-colors">
                <Phone className="h-4 w-4" /> {OWNER.phone}
              </a>
              <a href={OWNER.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gold transition-colors">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
              <a href={OWNER.agenda} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gold transition-colors">
                <Calendar className="h-4 w-4" /> Prendre rendez-vous
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3 text-gold">Navigation</h4>
            <div className="flex flex-col gap-2 text-sm text-lavender">
              <a href="/" className="hover:text-gold transition-colors">Catalogue</a>
              <a href="/a-propos" className="hover:text-gold transition-colors">À propos</a>
              <a href="https://belaircamp.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gold transition-colors">
                belaircamp.org <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-sidebar-border mt-8 pt-6 text-center text-xs text-lavender">
          © {new Date().getFullYear()} Bel Air Camp — Tous droits réservés. Mentions légales.
        </div>
      </div>
    </footer>
  );
}
