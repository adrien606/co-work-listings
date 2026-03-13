import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

interface ComparatifFinancierProps {
  prixPrestation: number;
  surfaceM2: number;
}

function fmtEur(n: number) {
  return Math.round(n).toLocaleString("fr-FR");
}

interface Hypotheses {
  loyerM2An: number;       // €/m²/an (défaut 150)
  taxeFonciereM2: number;  // €/m²/mois (défaut 1.75)
  chargesM2An: number;     // €/m²/an (défaut 20)
  energieM2: number;       // €/m²/mois (défaut 3.50)
  internet: number;        // €/mois fixe (défaut 50)
  mobilierPoste: number;   // €/poste achat (défaut 2000)
  installationM2: number;  // €/m² achat (défaut 250)
  gestionTechM2: number;   // €/m²/mois (défaut 2.25)
  menageM2: number;        // €/m²/mois (défaut 8)
  assuranceM2: number;     // €/m²/mois (défaut 1.25)
  m2ParPoste: number;      // m² par poste (défaut 5)
  coeffSurface: number;    // multiplicateur surface accessible (défaut 4)
  franchiseMois: number;   // mois de franchise de loyer (défaut 0)
}

const DEFAULTS: Hypotheses = {
  loyerM2An: 150,
  taxeFonciereM2: 1.75,
  chargesM2An: 20,
  energieM2: 3.5,
  internet: 50,
  mobilierPoste: 2000,
  installationM2: 250,
  gestionTechM2: 2.25,
  menageM2: 8,
  assuranceM2: 1.25,
  m2ParPoste: 5,
  coeffSurface: 4,
  franchiseMois: 1,
};

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, step, unit, onChange }: SliderRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value.toLocaleString("fr-FR")} {unit}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
    </div>
  );
}

export default function ComparatifFinancier({ prixPrestation, surfaceM2 }: ComparatifFinancierProps) {
  const [showHypotheses, setShowHypotheses] = useState(false);
  const [hyp, setHyp] = useState<Hypotheses>(DEFAULTS);

  const postes = Math.floor(surfaceM2 / hyp.m2ParPoste);
  if (postes < 1) return null;

  const update = (key: keyof Hypotheses) => (v: number) => setHyp(prev => ({ ...prev, [key]: v }));

  // Bail classique
  const loyer = surfaceM2 * (hyp.loyerM2An / 12);
  const taxeFonciere = surfaceM2 * hyp.taxeFonciereM2;
  const charges = surfaceM2 * ((hyp.chargesM2An ?? 20) / 12);
  const electricite = surfaceM2 * hyp.energieM2;
  const internet = hyp.internet;
  const mobilierMensuel = postes * (hyp.mobilierPoste / 36);
  const installationMensuel = surfaceM2 * (hyp.installationM2 / 36);
  const gestionTech = surfaceM2 * hyp.gestionTechM2;
  const menage = surfaceM2 * hyp.menageM2;
  const assurance = surfaceM2 * hyp.assuranceM2;

  const totalBail = loyer + taxeFonciere + charges + electricite + internet + mobilierMensuel + installationMensuel + gestionTech + menage + assurance;
  const coutParPosteBail = totalBail / postes;
  const coutM2Bail = totalBail / surfaceM2;
  const cautionBail = loyer * 3;
  const depotGarantieBail = loyer;
  const fraisEntreeBail = cautionBail + depotGarantieBail + (postes * hyp.mobilierPoste) + (surfaceM2 * hyp.installationM2);
  const franchiseEconomie = loyer * hyp.franchiseMois;
  const coutTotal3ansBail = fraisEntreeBail + (totalBail * 36) - franchiseEconomie;

  // Prestation
  const surfaceAccessible = surfaceM2 * hyp.coeffSurface;
  const coutParPostePrestation = prixPrestation / postes;
  const coutM2Prestation = prixPrestation / surfaceAccessible;
  const fraisEntreePrestation = prixPrestation;
  const coutTotal3ansPrestation = fraisEntreePrestation + (prixPrestation * 36);

  const economie3ans = coutTotal3ansBail - coutTotal3ansPrestation;
  const pourcentageEconomie = Math.round((economie3ans / coutTotal3ansBail) * 100);

  const isModified = JSON.stringify(hyp) !== JSON.stringify(DEFAULTS);

  const detailRows = [
    { label: "Loyer / redevance", bail: `${fmtEur(loyer)} €/mois HT`, presta: "—" },
    { label: "Taxe foncière", bail: `${fmtEur(taxeFonciere)} €`, presta: "✅ incluse" },
    { label: "Charges locatives", bail: `${fmtEur(charges)} €`, presta: "✅ incluses" },
    { label: "Électricité, eau, chauffage", bail: `${fmtEur(electricite)} €`, presta: "✅ inclus" },
    { label: "Internet fibre pro", bail: `${fmtEur(internet)} €`, presta: "✅ inclus" },
    { label: "Mobilier (amort. 36 mois)", bail: `${fmtEur(mobilierMensuel)} €`, presta: "✅ inclus" },
    { label: "Installation (amort. 36 mois)", bail: `${fmtEur(installationMensuel)} €`, presta: "✅ inclus" },
    { label: "Gestion technique", bail: `${fmtEur(gestionTech)} €`, presta: "✅ incluse" },
    { label: "Ménage", bail: `${fmtEur(menage)} €`, presta: "✅ inclus" },
    { label: "Assurance locaux", bail: `${fmtEur(assurance)} €`, presta: "✅ incluse" },
  ];

  const sharedRows = [
    { label: "Franchise de loyer possible", bail: hyp.franchiseMois > 0 ? `⚠️ ${hyp.franchiseMois} mois (contre engagement 3-6 ans ferme)` : "⚠️ 0 mois (ajustable)", presta: "Négociable (engagement 6, 12 ou 24 mois)" },
    { label: "Cuisine équipée / détente", bail: "❌ à aménager", presta: "✅ accès libre" },
    { label: "Salles de réunion", bail: "❌ externe ~50 €/h", presta: "✅ sur réservation" },
    { label: "Phone box / cabine acoustique", bail: "❌ non disponible", presta: "✅ accès libre" },
    { label: "Espace accueil / réception", bail: "❌ non disponible", presta: "✅ inclus" },
  ];

  const syntheseRows = [
    { label: "Surface accessible", bail: `${fmtEur(surfaceM2)} m²`, presta: `~${fmtEur(surfaceAccessible)} m²` },
    { label: "Total mensuel réel", bail: `${fmtEur(totalBail)} €/mois`, presta: `${fmtEur(prixPrestation)} €/mois` },
    { label: "Coût par poste", bail: `${fmtEur(coutParPosteBail)} €`, presta: `${fmtEur(coutParPostePrestation)} €` },
    { label: "Coût au m² accessible", bail: `${fmtEur(coutM2Bail)} €/m²`, presta: `${fmtEur(coutM2Prestation)} €/m²` },
    { label: "Frais d'entrée", bail: `~${fmtEur(fraisEntreeBail)} €`, presta: `${fmtEur(fraisEntreePrestation)} €` },
    { label: "Engagement minimum", bail: "3 ans", presta: "1 mois" },
    { label: "Préavis de sortie", bail: "6 mois", presta: "1 mois" },
    ...(hyp.franchiseMois > 0 ? [{ label: "Franchise déduite", bail: `-${fmtEur(franchiseEconomie)} €`, presta: "—" }] : []),
    { label: "Coût total sur 3 ans", bail: `${fmtEur(coutTotal3ansBail)} €`, presta: `${fmtEur(coutTotal3ansPrestation)} €` },
  ];

  const HypothesesPanel = () => (
    <div className="bg-muted/50 border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" /> Hypothèses de calcul
          {isModified && <span className="text-xs text-accent font-normal">(modifiées)</span>}
        </h4>
        {isModified && (
          <button
            onClick={() => setHyp(DEFAULTS)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Réinitialiser
          </button>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
        <SliderRow label="Loyer marché" value={hyp.loyerM2An} min={80} max={300} step={5} unit="€/m²/an" onChange={update("loyerM2An")} />
        <SliderRow label="m² par poste" value={hyp.m2ParPoste} min={3} max={10} step={1} unit="m²" onChange={update("m2ParPoste")} />
        <SliderRow label="Taxe foncière" value={hyp.taxeFonciereM2} min={0.5} max={5} step={0.25} unit="€/m²/mois" onChange={update("taxeFonciereM2")} />
        <SliderRow label="Charges locatives" value={hyp.chargesM2An} min={5} max={50} step={1} unit="€/m²/an" onChange={update("chargesM2An")} />
        <SliderRow label="Énergie (élec, eau, chauff.)" value={hyp.energieM2} min={1} max={8} step={0.5} unit="€/m²/mois" onChange={update("energieM2")} />
        <SliderRow label="Internet fibre" value={hyp.internet} min={20} max={150} step={5} unit="€/mois" onChange={update("internet")} />
        <SliderRow label="Mobilier par poste" value={hyp.mobilierPoste} min={500} max={5000} step={100} unit="€ (achat)" onChange={update("mobilierPoste")} />
        <SliderRow label="Installation / aménagement" value={hyp.installationM2} min={50} max={600} step={25} unit="€/m² (achat)" onChange={update("installationM2")} />
        <SliderRow label="Gestion technique" value={hyp.gestionTechM2} min={0.5} max={5} step={0.25} unit="€/m²/mois" onChange={update("gestionTechM2")} />
        <SliderRow label="Ménage" value={hyp.menageM2} min={2} max={15} step={0.5} unit="€/m²/mois" onChange={update("menageM2")} />
        <SliderRow label="Assurance locaux" value={hyp.assuranceM2} min={0.5} max={4} step={0.25} unit="€/m²/mois" onChange={update("assuranceM2")} />
        <SliderRow label="Franchise de loyer" value={hyp.franchiseMois} min={0} max={6} step={1} unit="mois" onChange={update("franchiseMois")} />
        <SliderRow label="Coeff. surface accessible (prestation uniquement)" value={hyp.coeffSurface} min={2} max={6} step={0.5} unit="×" onChange={update("coeffSurface")} />
      </div>
    </div>
  );

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
      <div id="comparatif-bail" className="bg-card border rounded-lg overflow-hidden scroll-mt-24">
        <div className="bg-primary text-primary-foreground px-5 py-3 font-medium">
          <span>📊 Comparer avec un bail classique</span>
        </div>
        <div className="p-4">
          {/* Toggle hypothèses */}
          <button
            onClick={() => setShowHypotheses(!showHypotheses)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showHypotheses ? "Masquer les hypothèses" : "Ajuster les hypothèses"}
            {isModified && <span className="text-xs text-accent">(modifiées)</span>}
          </button>

          {showHypotheses && <HypothesesPanel />}

          <DesktopTable />
          <MobileCards />

          {/* Bandeau économie */}
          <div className="mt-4 bg-emerald-100 border border-emerald-200 rounded-lg px-5 py-4 text-center">
            <p className="text-emerald-800 font-semibold text-base">
              💡 Économie estimée sur 3 ans : {fmtEur(economie3ans)} € ({pourcentageEconomie} %) — sans engagement
            </p>
          </div>

          <p className="mt-3 text-xs text-muted-foreground text-center">
            Estimations basées sur le marché bureaux Villeurbanne — 150 €/m²/an (BureauxLocaux.com 2025)
            {isModified && " · Hypothèses modifiées par l'utilisateur"}
          </p>
        </div>
      </div>
    </div>
  );
}
