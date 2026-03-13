import { useState, useMemo } from "react";
import { usePublicAnnonces } from "@/hooks/useAnnonces";
import AnnonceCard from "@/components/AnnonceCard";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Search, Check, X, Building2, Briefcase, FileText, Zap, Sparkles, Clock, Users, Calculator } from "lucide-react";

export default function Index() {
  const { data: annonces, isLoading } = usePublicAnnonces();
  const [filtreContrat, setFiltreContrat] = useState("");
  const [filtreType, setFiltreType] = useState("");
  const [filtreSurface, setFiltreSurface] = useState("");
  const [filtrePrix, setFiltrePrix] = useState("");

  // Types de contrat disponibles (extraits des données)
  const typesContrat = useMemo(() => {
    if (!annonces) return [];
    const set = new Set(annonces.map((a) => a.conditions_bail).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [annonces]);

  // Types de produit disponibles (filtrés par contrat sélectionné)
  const typesProduit = useMemo(() => {
    if (!annonces) return [];
    const base = filtreContrat ? annonces.filter((a) => a.conditions_bail === filtreContrat) : annonces;
    const set = new Set(base.map((a) => a.type_espace).filter(Boolean));
    return Array.from(set).sort();
  }, [annonces, filtreContrat]);

  const filtered = useMemo(() => {
    if (!annonces) return [];
    return annonces.filter((a) => {
      if (filtreContrat && a.conditions_bail !== filtreContrat) return false;
      if (filtreType && a.type_espace !== filtreType) return false;
      if (filtreSurface === "s1" && (a.surface || 0) >= 50) return false;
      if (filtreSurface === "s2" && ((a.surface || 0) < 50 || (a.surface || 0) >= 100)) return false;
      if (filtreSurface === "s3" && ((a.surface || 0) < 100 || (a.surface || 0) >= 200)) return false;
      if (filtreSurface === "s4" && (a.surface || 0) < 200) return false;
      if (filtrePrix === "p1" && (a.prix_mensuel || 0) >= 500) return false;
      if (filtrePrix === "p2" && ((a.prix_mensuel || 0) < 500 || (a.prix_mensuel || 0) >= 1000)) return false;
      if (filtrePrix === "p3" && ((a.prix_mensuel || 0) < 1000 || (a.prix_mensuel || 0) >= 2000)) return false;
      if (filtrePrix === "p4" && (a.prix_mensuel || 0) < 2000) return false;
      return true;
    });
  }, [annonces, filtreContrat, filtreType, filtreSurface, filtrePrix]);

  // Grouper par type de contrat, puis par type de produit
  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, typeof filtered>>();
    filtered.forEach((a) => {
      const contratKey = a.conditions_bail || "Autre";
      const produitKey = a.type_espace || "Autres";
      if (!map.has(contratKey)) map.set(contratKey, new Map());
      const sub = map.get(contratKey)!;
      if (!sub.has(produitKey)) sub.set(produitKey, []);
      sub.get(produitKey)!.push(a);
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
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Type de contrat</label>
              <select
                value={filtreContrat}
                onChange={(e) => { setFiltreContrat(e.target.value); setFiltreType(""); }}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm"
              >
                <option value="">Tous les contrats</option>
                {typesContrat.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Type de produit</label>
              <select
                value={filtreType}
                onChange={(e) => setFiltreType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm"
              >
                <option value="">Tous les types</option>
                {typesProduit.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
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
                <option value="p1">Moins de 500 €</option>
                <option value="p2">500 – 1 000 €</option>
                <option value="p3">1 000 – 2 000 €</option>
                <option value="p4">Plus de 2 000 €</option>
              </select>
            </div>
            <button
              onClick={() => { setFiltreContrat(""); setFiltreType(""); setFiltreSurface(""); setFiltrePrix(""); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 pb-1 whitespace-nowrap"
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
            Array.from(grouped.entries()).map(([contratNom, subMap]) => (
              <div key={contratNom} className="mb-14">
                <h3 className="font-heading text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gold" />
                  {contratNom}
                </h3>
                {Array.from(subMap.entries()).map(([produitNom, items]) => (
                  <div key={produitNom} className="mb-8 ml-4">
                    <h4 className="font-heading text-lg font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-lavender" />
                      {produitNom}
                    </h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((a) => (
                        <AnnonceCard key={a.id} annonce={a} />
                      ))}
                    </div>
                  </div>
                ))}
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
