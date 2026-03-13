import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { usePageContent, useBatiments } from "@/hooks/useAnnonces";
import { OWNER } from "@/lib/supabase";
import { Mail, Phone, Building2, Ruler, LayoutGrid, Users, Briefcase } from "lucide-react";

export default function APropos() {
  const { data: content } = usePageContent();
  const { data: batiments } = useBatiments();

  const chiffres = content?.chiffres as Record<string, string> || {};
  const avantages = (content?.avantages || []) as Array<{ titre: string; description: string; icone: string }>;

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-primary py-20">
        <div className="container text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            {content?.titre || "À propos"}
          </h1>
          <p className="text-lavender text-lg max-w-2xl mx-auto">
            {content?.description || ""}
          </p>
        </div>
      </section>

      {/* Chiffres clés */}
      {Object.keys(chiffres).length > 0 && (
        <section className="bg-light-section py-16">
          <div className="container">
            <h2 className="font-heading text-2xl font-bold text-center mb-10">Chiffres clés</h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <Building2 className="h-8 w-8 mx-auto mb-3 text-gold" />
                <div className="font-heading text-4xl font-bold text-foreground">{chiffres.sites || "0"}</div>
                <div className="text-muted-foreground text-sm mt-1">Sites</div>
              </div>
              <div className="text-center">
                <Ruler className="h-8 w-8 mx-auto mb-3 text-gold" />
                <div className="font-heading text-4xl font-bold text-foreground">{chiffres.surface || "0"} m²</div>
                <div className="text-muted-foreground text-sm mt-1">Surface totale</div>
              </div>
              <div className="text-center">
                <LayoutGrid className="h-8 w-8 mx-auto mb-3 text-gold" />
                <div className="font-heading text-4xl font-bold text-foreground">{chiffres.espaces || "0"}</div>
                <div className="text-muted-foreground text-sm mt-1">Espaces proposés</div>
              </div>
              <div className="text-center">
                <Briefcase className="h-8 w-8 mx-auto mb-3 text-gold" />
                <div className="font-heading text-4xl font-bold text-foreground">{chiffres.entreprises || "0"}</div>
                <div className="text-muted-foreground text-sm mt-1">Entreprises résidentes</div>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-gold" />
                <div className="font-heading text-4xl font-bold text-foreground">{chiffres.utilisateurs || "0"}</div>
                <div className="text-muted-foreground text-sm mt-1">Utilisateurs quotidiens</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Avantages */}
      {avantages.length > 0 && (
        <section className="bg-primary py-16">
          <div className="container">
            <h2 className="font-heading text-2xl font-bold text-center text-primary-foreground mb-10">
              Pourquoi nous choisir ?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {avantages.map((a, i) => (
                <div key={i} className="bg-sidebar-accent rounded-lg p-6 text-center">
                  <span className="text-3xl mb-3 block">{a.icone}</span>
                  <h3 className="font-heading font-semibold text-primary-foreground mb-2">{a.titre}</h3>
                  <p className="text-lavender text-sm">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bâtiments */}
      {batiments && batiments.length > 0 && (
        <section className="bg-light-section py-16">
          <div className="container">
            <h2 className="font-heading text-2xl font-bold text-center mb-10">Nos sites</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {batiments.map((b) => (
                <div key={b.id} className="bg-card rounded-lg border overflow-hidden">
                  {b.photo_url && (
                    <img src={b.photo_url} alt={b.nom} className="w-full h-48 object-cover" loading="lazy" />
                  )}
                  <div className="p-5">
                    <h3 className="font-heading font-semibold text-lg mb-1">{b.nom}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{b.adresse}</p>
                    {b.description && <p className="text-sm text-muted-foreground">{b.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="bg-accent py-12">
        <div className="container text-center">
          <h2 className="font-heading text-2xl font-bold text-accent-foreground mb-4">Contactez-nous</h2>
          <p className="text-accent-foreground/80 mb-4 font-medium">{OWNER.name}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={`mailto:${OWNER.email}`} className="flex items-center gap-2 text-accent-foreground hover:underline">
              <Mail className="h-4 w-4" /> {OWNER.email}
            </a>
            <a href={`tel:${OWNER.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-accent-foreground hover:underline">
              <Phone className="h-4 w-4" /> {OWNER.phone}
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
