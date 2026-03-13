import { useState, useMemo } from "react";
import { usePublicAnnonces } from "@/hooks/useAnnonces";
import AnnonceCard from "@/components/AnnonceCard";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Search, Check, X, Building2, Briefcase, FileText, Zap, Sparkles, Clock, Users, Calculator } from "lucide-react";

export default function Index() {
  const { data: annonces, isLoading } = usePublicAnnonces();
  const [filtreType, setFiltreType] = useState("");
  const [filtreSurface, setFiltreSurface] = useState("");
  const [filtrePrix, setFiltrePrix] = useState("");

  const filtered = useMemo(() => {
    if (!annonces) return [];
    return annonces.filter((a) => {
      if (filtreType && a.type_espace !== filtreType) return false;
      if (filtreSurface === "small" && (a.surface || 0) >= 50) return false;
      if (filtreSurface === "large" && (a.surface || 0) < 50) return false;
      if (filtrePrix === "low" && (a.prix_mensuel || 0) >= 1000) return false;
      if (filtrePrix === "high" && (a.prix_mensuel || 0) < 1000) return false;
      return true;
    });
  }, [annonces, filtreType, filtreSurface, filtrePrix]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((a) => {
      const key = a.type_espace || "Autres";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    });
    return map;
  }, [filtered]);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-primary py-20 md:py-28">
        <div className="container text-center">
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-primary-foreground mb-4 animate-fade-in">
            Trouvez l'espace idéal <span className="text-gold">pour vos prospects</span>
          </h1>
          <p className="text-lavender text-lg md:text-xl max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Flexible, tout compris, prêt à l'emploi.
          </p>
          <p className="text-lavender/80 text-sm md:text-base max-w-3xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            Acheter ou aménager ses propres locaux, c'est du CAPEX : un investissement lourd, figé, qui pèse sur le bilan et mobilise du capital. Bel Air Camp propose une alternative OPEX : vous payez l'espace que vous utilisez, quand vous en avez besoin, sans engagement long terme. Pour une PME en croissance, c'est une décision de trésorerie autant qu'une décision stratégique.
          </p>
          <div className="flex justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <button
              onClick={() => {
                document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-accent text-accent-foreground font-heading font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Voir les espaces disponibles
            </button>
          </div>
        </div>
      </section>

      {/* Barre de recherche */}
      <section className="bg-primary pb-12 -mt-2">
        <div className="container">
          <div className="bg-card rounded-xl shadow-lg p-4 md:p-6 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Type d'espace</label>
              <select
                value={filtreType}
                onChange={(e) => setFiltreType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm"
              >
                <option value="">Tous les types</option>
                <option>Bureau privatif</option>
                <option>Open space flex</option>
                <option>Atelier</option>
                <option>Salle de formation</option>
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Surface</label>
              <select
                value={filtreSurface}
                onChange={(e) => setFiltreSurface(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm"
              >
                <option value="">Toutes surfaces</option>
                <option value="small">Moins de 50 m²</option>
                <option value="large">Plus de 50 m²</option>
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Prix mensuel</label>
              <select
                value={filtrePrix}
                onChange={(e) => setFiltrePrix(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm"
              >
                <option value="">Tous les prix</option>
                <option value="low">Moins de 1 000 €</option>
                <option value="high">Plus de 1 000 €</option>
              </select>
            </div>
            <button
              onClick={() => { setFiltreType(""); setFiltreSurface(""); setFiltrePrix(""); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 pb-1"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </section>

      {/* Catalogue */}
      <section id="catalogue" className="bg-light-section py-16 flex-1">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              Espaces disponibles
            </h2>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-primary/10 rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg">Aucun espace disponible pour le moment.</p>
            </div>
          ) : (
            Array.from(grouped.entries()).map(([batimentNom, items]) => (
              <div key={batimentNom} className="mb-12">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold" />
                  {batimentNom}
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((a) => (
                    <AnnonceCard key={a.id} annonce={a} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Tableau comparatif */}
      <section className="bg-primary py-16">
        <div className="container max-w-5xl">
          <h2 className="font-heading text-3xl font-bold text-center text-primary-foreground mb-2">
            Pourquoi choisir Bel Air Camp ?
          </h2>
          <p className="text-lavender text-center mb-10 max-w-2xl mx-auto">
            Comparez notre offre avec un bail commercial classique
          </p>
          
          <div className="bg-card rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-sidebar-accent border-b border-border">
                    <th className="text-left px-4 py-4 font-heading font-semibold text-foreground w-1/3">Critère</th>
                    <th className="text-left px-4 py-4 font-heading font-semibold text-foreground w-1/3">
                      <span className="flex items-center gap-2 text-gold">
                        <Building2 className="h-4 w-4" />
                        Bel Air Camp
                      </span>
                    </th>
                    <th className="text-left px-4 py-4 font-heading font-semibold text-muted-foreground w-1/3">
                      <span className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Bail commercial classique (3-6-9)
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-foreground">Accessibilité</td>
                    <td className="px-4 py-4 text-foreground">
                      <span className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[hsl(var(--success))] shrink-0 mt-0.5" />
                        24h/24, 7j/7, sécurisé
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      <span className="flex items-start gap-2">
                        <X className="h-4 w-4 text-[hsl(var(--destructive))] shrink-0 mt-0.5" />
                        Selon bailleur, souvent limité
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-foreground">Mobilier, IT & aménagement</td>
                    <td className="px-4 py-4 text-foreground">
                      <span className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[hsl(var(--success))] shrink-0 mt-0.5" />
                        Inclus et opérationnel
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      <span className="flex items-start gap-2">
                        <X className="h-4 w-4 text-[hsl(var(--destructive))] shrink-0 mt-0.5" />
                        À investir par le locataire
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-foreground">Charges (eau, électricité, entretien)</td>
                    <td className="px-4 py-4 text-foreground">
                      <span className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[hsl(var(--success))] shrink-0 mt-0.5" />
                        Incluses
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      <span className="flex items-start gap-2">
                        <X className="h-4 w-4 text-[hsl(var(--destructive))] shrink-0 mt-0.5" />
                        À prévoir séparément
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-foreground">Ménage & maintenance</td>
                    <td className="px-4 py-4 text-foreground">
                      <span className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[hsl(var(--success))] shrink-0 mt-0.5" />
                        Inclus
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      <span className="flex items-start gap-2">
                        <X className="h-4 w-4 text-[hsl(var(--destructive))] shrink-0 mt-0.5" />
                        À organiser et financer
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-foreground">Gestion administrative</td>
                    <td className="px-4 py-4 text-foreground">
                      <span className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        Ultra-simplifiée, contrat clé en main
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      <span className="flex items-start gap-2">
                        <X className="h-4 w-4 text-[hsl(var(--destructive))] shrink-0 mt-0.5" />
                        Multiples démarches à gérer
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-foreground">Flexibilité</td>
                    <td className="px-4 py-4 text-foreground">
                      <span className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        Souple, court terme possible
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      <span className="flex items-start gap-2">
                        <X className="h-4 w-4 text-[hsl(var(--destructive))] shrink-0 mt-0.5" />
                        Minimum 3 ans fermes, pénalités
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-foreground">Coût</td>
                    <td className="px-4 py-4 text-foreground">
                      <span className="flex items-start gap-2">
                        <Calculator className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        Tout compris, sans surprise
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      <span className="flex items-start gap-2">
                        <X className="h-4 w-4 text-[hsl(var(--destructive))] shrink-0 mt-0.5" />
                        Extras et imprévus possibles
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-foreground">Communauté & services</td>
                    <td className="px-4 py-4 text-foreground">
                      <span className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        Networking et services inclus
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      <span className="flex items-start gap-2">
                        <X className="h-4 w-4 text-[hsl(var(--destructive))] shrink-0 mt-0.5" />
                        Espace vide, aucun service
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
