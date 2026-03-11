import { useState, useMemo } from "react";
import { usePublicAnnonces } from "@/hooks/useAnnonces";
import AnnonceCard from "@/components/AnnonceCard";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Search } from "lucide-react";

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
      const key = a.batiment?.nom || "Autres";
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
            Trouvez votre <span className="text-gold">espace idéal</span>
          </h1>
          <p className="text-lavender text-lg md:text-xl max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Co-working, bureaux privatifs, ateliers et salles de formation — des espaces flexibles adaptés à vos besoins.
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
            <button
              onClick={() => { setFiltreType(""); setFiltreSurface(""); }}
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

      <PublicFooter />
    </div>
  );
}
