import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface ComparatifFinancierProps {
  prixPrestation: number;
  surfaceM2: number;
}

function fmtEur(n: number) {
  return Math.round(n).toLocaleString("fr-FR");
}

export default function ComparatifFinancier({ prixPrestation, surfaceM2 }: ComparatifFinancierProps) {
  const [open, setOpen] = useState(false);

  const postes = Math.floor(surfaceM2 / 5);
  if (postes < 1) return null;

  // Bail classique
  const loyer = surfaceM2 * 12.5;
  const taxeFonciere = surfaceM2 * 1.75;
  const charges = surfaceM2 * 1.75;
  const electricite = surfaceM2 * 3.5;
  const internet = 50;
  const mobilier = postes * 55;
  const installation = surfaceM2 * 7;
  const gestionTech = surfaceM2 * 2.25;
  const menage = surfaceM2 * 8;
  const assurance = surfaceM2 * 1.25;

  const totalBail = loyer + taxeFonciere + charges + electricite + internet + mobilier + installation + gestionTech + menage + assurance;
  const coutParPosteBail = totalBail / postes;
  const coutM2Bail = totalBail / surfaceM2;
  const fraisEntreeBail = (loyer * 3) + loyer + (postes * 2000) + (surfaceM2 * 250);
  const coutTotal3ansBail = fraisEntreeBail + (totalBail * 36);

  // Prestation
  const totalPrestation = prixPrestation;
  const coutParPostePrestation = prixPrestation / postes;
  const surfaceAccessible = surfaceM2 * 4;
  const coutM2Prestation = prixPrestation / surfaceAccessible;
  const fraisEntreePrestation = prixPrestation;
  const coutTotal3ansPrestation = fraisEntreePrestation + (prixPrestation * 36);

  const economie3ans = coutTotal3ansBail - coutTotal3ansPrestation;
  const pourcentageEconomie = Math.round((economie3ans / coutTotal3ansBail) * 100);

  const detailRows = [
    { label: "Loyer / redevance", bail: `${fmtEur(loyer)} €/mois HT`, presta: "—" },
    { label: "Taxe foncière", bail: `${fmtEur(taxeFonciere)} €`, presta: "✅ incluse" },
    { label: "Charges locatives", bail: `${fmtEur(charges)} €`, presta: "✅ incluses" },
    { label: "Électricité, eau, chauffage", bail: `${fmtEur(electricite)} €`, presta: "✅ inclus" },
    { label: "Internet fibre pro", bail: `${fmtEur(internet)} €`, presta: "✅ inclus" },
    { label: "Mobilier (amort. 36 mois)", bail: `${fmtEur(mobilier)} €`, presta: "✅ inclus" },
    { label: "Installation (amort. 36 mois)", bail: `${fmtEur(installation)} €`, presta: "✅ inclus" },
    { label: "Gestion technique", bail: `${fmtEur(gestionTech)} €`, presta: "✅ incluse" },
    { label: "Ménage", bail: `${fmtEur(menage)} €`, presta: "✅ inclus" },
    { label: "Assurance locaux", bail: `${fmtEur(assurance)} €`, presta: "✅ incluse" },
  ];

  const sharedRows = [
    { label: "Cuisine équipée / détente", bail: "❌ à aménager", presta: "✅ accès libre" },
    { label: "Salles de réunion", bail: "❌ externe ~50 €/h", presta: "✅ sur réservation" },
    { label: "Phone box / cabine acoustique", bail: "❌ non disponible", presta: "✅ accès libre" },
    { label: "Espace accueil / réception", bail: "❌ non disponible", presta: "✅ inclus" },
  ];

  const syntheseRows = [
    { label: "Surface accessible", bail: `${fmtEur(surfaceM2)} m²`, presta: `~${fmtEur(surfaceAccessible)} m²` },
    { label: "Total mensuel réel", bail: `${fmtEur(totalBail)} €/mois`, presta: `${fmtEur(totalPrestation)} €/mois` },
    { label: "Coût par poste", bail: `${fmtEur(coutParPosteBail)} €`, presta: `${fmtEur(coutParPostePrestation)} €` },
    { label: "Coût au m² accessible", bail: `${fmtEur(coutM2Bail)} €/m²`, presta: `${fmtEur(coutM2Prestation)} €/m²` },
    { label: "Frais d'entrée", bail: `~${fmtEur(fraisEntreeBail)} €`, presta: `${fmtEur(fraisEntreePrestation)} €` },
    { label: "Engagement minimum", bail: "3 ans", presta: "1 mois" },
    { label: "Préavis de sortie", bail: "6 mois", presta: "1 mois" },
    { label: "Coût total sur 3 ans", bail: `${fmtEur(coutTotal3ansBail)} €`, presta: `${fmtEur(coutTotal3ansPrestation)} €` },
  ];

  // Desktop table
  const DesktopTable = () => (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left p-3 font-semibold text-foreground"></th>
            <th className="text-center p-3 font-semibold bg-muted text-destructive rounded-tl-lg">Bail classique 3-6-9</th>
            <th className="text-center p-3 font-semibold bg-emerald-50 text-emerald-700 rounded-tr-lg">Contrat de prestation</th>
          </tr>
        </thead>
        <tbody>
          {/* Coûts mensuels */}
          <tr>
            <td colSpan={3} className="pt-4 pb-2 px-3 font-semibold text-foreground text-xs uppercase tracking-wider">Coûts mensuels détaillés</td>
          </tr>
          {detailRows.map((r, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-background" : ""}>
              <td className="p-3 text-muted-foreground">{r.label}</td>
              <td className="p-3 text-center bg-muted/50 text-orange-600 font-medium">{r.bail}</td>
              <td className="p-3 text-center bg-emerald-50/50 text-emerald-600">{r.presta}</td>
            </tr>
          ))}

          {/* Espaces partagés */}
          <tr>
            <td colSpan={3} className="pt-6 pb-2 px-3 font-semibold text-foreground text-xs uppercase tracking-wider">Espaces partagés inclus</td>
          </tr>
          {sharedRows.map((r, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-background" : ""}>
              <td className="p-3 text-muted-foreground">{r.label}</td>
              <td className="p-3 text-center bg-muted/50 text-orange-600">{r.bail}</td>
              <td className="p-3 text-center bg-emerald-50/50 text-emerald-600">{r.presta}</td>
            </tr>
          ))}

          {/* Synthèse */}
          <tr>
            <td colSpan={3} className="pt-6 pb-2 px-3 font-semibold text-foreground text-xs uppercase tracking-wider">Synthèse</td>
          </tr>
          {syntheseRows.map((r, i) => (
            <tr key={i} className="font-semibold">
              <td className="p-3 text-foreground">{r.label}</td>
              <td className="p-3 text-center bg-muted text-orange-600">{r.bail}</td>
              <td className="p-3 text-center bg-emerald-100 text-emerald-700">{r.presta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Mobile cards
  const MobileCards = () => (
    <div className="md:hidden space-y-4">
      {/* Bail card */}
      <div className="bg-muted rounded-lg p-4">
        <h4 className="font-semibold text-destructive mb-3 text-center">Bail classique 3-6-9</h4>
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Coûts mensuels</p>
          {detailRows.map((r, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="text-orange-600 font-medium">{r.bail}</span>
            </div>
          ))}
          <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mt-4 mb-2">Espaces partagés</p>
          {sharedRows.map((r, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="text-orange-600">{r.bail}</span>
            </div>
          ))}
          <div className="border-t border-border mt-3 pt-3 space-y-2">
            <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Synthèse</p>
            {syntheseRows.map((r, i) => (
              <div key={i} className="flex justify-between font-semibold">
                <span className="text-foreground">{r.label}</span>
                <span className="text-orange-600">{r.bail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prestation card */}
      <div className="bg-emerald-50 rounded-lg p-4">
        <h4 className="font-semibold text-emerald-700 mb-3 text-center">Contrat de prestation</h4>
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Coûts mensuels</p>
          {detailRows.map((r, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="text-emerald-600">{r.presta}</span>
            </div>
          ))}
          <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mt-4 mb-2">Espaces partagés</p>
          {sharedRows.map((r, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="text-emerald-600">{r.presta}</span>
            </div>
          ))}
          <div className="border-t border-emerald-200 mt-3 pt-3 space-y-2">
            <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Synthèse</p>
            {syntheseRows.map((r, i) => (
              <div key={i} className="flex justify-between font-semibold">
                <span className="text-foreground">{r.label}</span>
                <span className="text-emerald-700">{r.presta}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-8">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="w-full flex items-center justify-between bg-primary text-primary-foreground rounded-lg px-5 py-3 font-medium hover:bg-primary/90 transition-colors">
          <span>📊 Comparer avec un bail classique</span>
          <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="bg-card border rounded-lg p-4">
            <DesktopTable />
            <MobileCards />

            {/* Bandeau économie */}
            <div className="mt-4 bg-emerald-100 border border-emerald-200 rounded-lg px-5 py-4 text-center">
              <p className="text-emerald-800 font-semibold text-base">
                💡 Économie estimée sur 3 ans : {fmtEur(economie3ans)} € ({pourcentageEconomie} %) — sans engagement
              </p>
            </div>

            {/* Source */}
            <p className="mt-3 text-xs text-muted-foreground text-center">
              Estimations basées sur le marché bureaux Villeurbanne — 150 €/m²/an (BureauxLocaux.com 2025)
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
