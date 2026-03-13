import { useParams, Link } from "react-router-dom";
import { useAnnonce } from "@/hooks/useAnnonces";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { OWNER } from "@/lib/supabase";
import { prixM2Mois, prixM2An } from "@/lib/types";
import { ArrowLeft, Share2, Download, Mail, Phone, MapPin, Calendar, FileText, CheckCircle, Linkedin, X, ChevronLeft, ChevronRight } from "lucide-react";
import ComparatifFinancier from "@/components/ComparatifFinancier";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AnnonceDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: annonce, isLoading } = useAnnonce(id!);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Chargement...</div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (!annonce) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Annonce introuvable.</p>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const pm2m = prixM2Mois(annonce.prix_mensuel, annonce.surface);
  const pm2a = prixM2An(annonce.prix_mensuel, annonce.surface);
  const photos = annonce.medias?.filter((m) => m.type === "photo") || [];
  const videos = annonce.medias?.filter((m) => m.type === "video") || [];

  const handleShare = () => {
    const subject = encodeURIComponent(`Espace disponible : ${annonce.titre}`);
    const body = encodeURIComponent(`Bonjour,\n\nJe vous partage cette annonce :\n${annonce.titre}\n\n${window.location.href}\n\nCordialement`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleDownloadPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    
    doc.setFillColor(29, 29, 86);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text(annonce.titre, 15, 25);

    doc.setTextColor(29, 29, 86);
    doc.setFontSize(12);
    let y = 55;

    const fmtNum = (n: number) => n.toLocaleString("fr-FR").replace(/\u202f/g, " ").replace(/\u00a0/g, " ");

    doc.setFontSize(16);
    doc.setTextColor(255, 205, 84);
    doc.text(`${annonce.prix_mensuel ? fmtNum(annonce.prix_mensuel) : "—"} EUR/mois`, 15, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Surface : ${annonce.surface} m2`, 15, y); y += 6;
    if (pm2m) { doc.text(`Prix/m2/mois : ${fmtNum(pm2m)} EUR`, 15, y); y += 6; }
    if (pm2a) { doc.text(`Prix/m2/an : ${fmtNum(pm2a)} EUR`, 15, y); y += 6; }
    doc.text(`Type : ${annonce.type_espace}`, 15, y); y += 6;
    doc.text(`Charges : ${annonce.charges || "Non précisé"}`, 15, y); y += 6;
    doc.text(`Disponibilité : ${annonce.disponibilite || "Non précisé"}`, 15, y); y += 10;

    if (annonce.batiment) {
      doc.text(`Site : ${annonce.batiment.nom} — ${annonce.batiment.adresse}`, 15, y); y += 10;
    }

    if (annonce.description) {
      doc.setFontSize(11);
      doc.setTextColor(29, 29, 86);
      doc.text("Description", 15, y); y += 6;
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const lines = doc.splitTextToSize(annonce.description, 180);
      doc.text(lines, 15, y); y += lines.length * 5 + 5;
    }

    if (annonce.services && annonce.services.length > 0) {
      doc.setFontSize(11);
      doc.setTextColor(29, 29, 86);
      doc.text("Services inclus", 15, y); y += 6;
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      annonce.services.forEach((s) => {
        doc.text(`- ${s.nom}`, 15, y); y += 5;
      });
      y += 5;
    }

    if (annonce.conditions_duree || annonce.conditions_bail) {
      doc.setFontSize(11);
      doc.setTextColor(29, 29, 86);
      doc.text("Conditions de location", 15, y); y += 6;
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      if (annonce.conditions_duree) { doc.text(`Durée min. : ${annonce.conditions_duree}`, 15, y); y += 5; }
      if (annonce.conditions_preavis) { doc.text(`Préavis : ${annonce.conditions_preavis}`, 15, y); y += 5; }
      if (annonce.conditions_bail) { doc.text(`Bail : ${annonce.conditions_bail}`, 15, y); y += 5; }
      if (annonce.conditions_garantie) { doc.text(`Garantie : ${annonce.conditions_garantie}`, 15, y); y += 5; }
      y += 5;
    }

    // Comparatif financier (Bureau privatif + contrat de prestation uniquement)
    if (annonce.type_espace === "Bureau privatif" && annonce.conditions_bail !== "Bail commercial 3-6-9" && annonce.prix_mensuel && annonce.surface) {
      const surf = annonce.surface;
      const prix = annonce.prix_mensuel;
      const m2ParPoste = 5;
      const postes = Math.floor(surf / m2ParPoste);

      if (postes >= 1) {
        // Hypothèses par défaut
        const loyerM2An = 150;
        const taxeFonciereM2 = 1.75;
        const chargesM2An = 20;
        const energieM2 = 3.5;
        const internet = 50;
        const mobilierPoste = 2000;
        const installationM2 = 250;
        const gestionTechM2 = 2.25;
        const menageM2 = 8;
        const assuranceM2 = 1.25;
        const coeffSurface = 4;
        const franchiseMois = 1;

        const loyer = surf * (loyerM2An / 12);
        const taxeFonciere = surf * taxeFonciereM2;
        const charges = surf * (chargesM2An / 12);
        const electricite = surf * energieM2;
        const mobilierMensuel = postes * (mobilierPoste / 36);
        const installationMensuel = surf * (installationM2 / 36);
        const gestionTech = surf * gestionTechM2;
        const menage = surf * menageM2;
        const assurance = surf * assuranceM2;

        const totalBail = loyer + taxeFonciere + charges + electricite + internet + mobilierMensuel + installationMensuel + gestionTech + menage + assurance;
        const coutParPosteBail = totalBail / postes;
        const surfaceAccessible = surf * coeffSurface;
        const coutParPostePrestation = prix / postes;
        const coutM2Prestation = prix / surfaceAccessible;
        const fraisEntreeBail = (loyer * 3) + loyer + (postes * mobilierPoste) + (surf * installationM2);
        const franchiseEconomie = loyer * franchiseMois;
        const coutTotal3ansBail = fraisEntreeBail + (totalBail * 36) - franchiseEconomie;
        const coutTotal3ansPrestation = prix + (prix * 36);
        const economie3ans = coutTotal3ansBail - coutTotal3ansPrestation;
        const pourcentageEconomie = Math.round((economie3ans / coutTotal3ansBail) * 100);

        // Nouvelle page pour le comparatif
        doc.addPage();
        doc.setFillColor(29, 29, 86);
        doc.rect(0, 0, 210, 15, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.text("Comparatif : Bail classique vs Contrat de prestation", 15, 10);

        let ty = 25;
        const col1 = 15;
        const col2 = 95;
        const col3 = 155;

        // Header
        doc.setFontSize(8);
        doc.setFillColor(240, 240, 240);
        doc.rect(col2 - 2, ty - 4, 58, 6, "F");
        doc.setFillColor(220, 252, 231);
        doc.rect(col3 - 2, ty - 4, 50, 6, "F");
        doc.setTextColor(180, 60, 60);
        doc.text("Bail classique", col2, ty);
        doc.setTextColor(21, 128, 61);
        doc.text("Contrat prestation", col3, ty);
        ty += 8;

        // Section title helper
        const sectionTitle = (title: string) => {
          doc.setFontSize(8);
          doc.setTextColor(29, 29, 86);
          doc.setFont("helvetica", "bold");
          doc.text(title, col1, ty);
          doc.setFont("helvetica", "normal");
          ty += 5;
        };

        // Row helper
        const row = (label: string, bail: string, presta: string, bold = false) => {
          doc.setFontSize(7.5);
          doc.setTextColor(100, 100, 100);
          if (bold) { doc.setFont("helvetica", "bold"); doc.setTextColor(29, 29, 86); }
          doc.text(label, col1, ty);
          doc.setTextColor(180, 80, 20);
          if (bold) doc.setFont("helvetica", "bold");
          doc.text(bail, col2, ty);
          doc.setTextColor(21, 128, 61);
          doc.text(presta, col3, ty);
          doc.setFont("helvetica", "normal");
          ty += 5;
        };

        sectionTitle("COUTS MENSUELS DETAILLES");
        row("Loyer / redevance", `${fmtNum(loyer)} EUR/mois HT`, "--");
        row("Taxe fonciere", `${fmtNum(taxeFonciere)} EUR`, "incluse");
        row("Charges locatives", `${fmtNum(charges)} EUR`, "incluses");
        row("Electricite, eau, chauffage", `${fmtNum(electricite)} EUR`, "inclus");
        row("Internet fibre pro", `${fmtNum(internet)} EUR`, "inclus");
        row("Mobilier (amort. 36 mois)", `${fmtNum(mobilierMensuel)} EUR`, "inclus");
        row("Installation (amort. 36 mois)", `${fmtNum(installationMensuel)} EUR`, "inclus");
        row("Gestion technique", `${fmtNum(gestionTech)} EUR`, "incluse");
        row("Menage", `${fmtNum(menage)} EUR`, "inclus");
        row("Assurance locaux", `${fmtNum(assurance)} EUR`, "incluse");
        ty += 3;

        sectionTitle("ESPACES PARTAGES INCLUS");
        row("Cuisine equipee / detente", "a amenager", "acces libre");
        row("Salles de reunion", "externe ~50 EUR/h", "sur reservation");
        row("Phone box / cabine acoustique", "non disponible", "acces libre");
        row("Espace accueil / reception", "non disponible", "inclus");
        ty += 3;

        sectionTitle("SYNTHESE");
        row("Surface accessible", `${fmtNum(surf)} m2`, `~${fmtNum(surfaceAccessible)} m2`, true);
        row("Total mensuel reel", `${fmtNum(totalBail)} EUR/mois`, `${fmtNum(prix)} EUR/mois`, true);
        row("Cout par poste", `${fmtNum(coutParPosteBail)} EUR`, `${fmtNum(coutParPostePrestation)} EUR`, true);
        row("Cout au m2 accessible", "--", `${fmtNum(coutM2Prestation)} EUR/m2`, true);
        row("Frais d'entree", `~${fmtNum(fraisEntreeBail)} EUR`, `${fmtNum(prix)} EUR (caution)`, true);
        row("Engagement minimum", "3 ans", "12 mois", true);
        row("Preavis de sortie", "6 mois", "3 mois", true);
        if (franchiseMois > 0) {
          row("Franchise deduite", `-${fmtNum(franchiseEconomie)} EUR`, "--", true);
        }
        row("Cout total sur 3 ans", `${fmtNum(coutTotal3ansBail)} EUR`, `${fmtNum(coutTotal3ansPrestation)} EUR`, true);
        ty += 5;

        // Bandeau économie
        doc.setFillColor(220, 252, 231);
        doc.roundedRect(col1 - 2, ty - 4, 185, 10, 2, 2, "F");
        doc.setTextColor(21, 128, 61);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`Economie estimee sur 3 ans : ${fmtNum(economie3ans)} EUR (${pourcentageEconomie} %) -- sans engagement`, col1, ty + 2);
        doc.setFont("helvetica", "normal");
        ty += 14;

        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text("Estimations basees sur le marche bureaux Villeurbanne -- 150 EUR/m2/an (BureauxLocaux.com 2025)", col1, ty);
      }
    }

    // Photos
    if (photos.length > 0) {
      const loadImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });

      for (const photo of photos) {
        try {
          const img = await loadImage(photo.url);
          doc.addPage();
          const pageW = 210;
          const pageH = 297;
          const ratio = Math.min((pageW - 20) / img.width, (pageH - 20) / img.height);
          const w = img.width * ratio;
          const h = img.height * ratio;
          const x = (pageW - w) / 2;
          const yImg = (pageH - h) / 2;

          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext("2d")!.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

          doc.addImage(dataUrl, "JPEG", x, yImg, w, h);
        } catch {
          // skip photo on error
        }
      }
    }

    // Contact footer on last page
    doc.setFillColor(29, 29, 86);
    doc.rect(0, 270, 210, 27, "F");
    doc.setTextColor(255, 205, 84);
    doc.setFontSize(11);
    doc.text(`${OWNER.name} - ${OWNER.email} - ${OWNER.phone}`, 15, 282);
    doc.setTextColor(187, 184, 255);
    doc.setFontSize(8);
    doc.text(window.location.href, 15, 289);

    doc.save(`${annonce.titre.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
    toast.success("PDF telecharge !");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <div className="bg-light-section flex-1">
        <div className="container py-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour au catalogue
          </Link>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left: Photos */}
            <div className="lg:col-span-3">
              {photos.length > 0 ? (
                <>
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="aspect-[16/10] rounded-lg overflow-hidden mb-3 w-full cursor-zoom-in"
                  >
                    <img
                      src={photos[selectedPhoto]?.url}
                      alt={annonce.titre}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  {photos.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {photos.map((p, i) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPhoto(i)}
                          className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                            i === selectedPhoto ? "border-gold" : "border-transparent"
                          }`}
                        >
                          <img src={p.url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-[16/10] rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  Aucune photo
                </div>
              )}

              {videos.length > 0 && (
                <div className="mt-6">
                  {videos.map((v) => {
                    const isYoutube = v.url.includes("youtube") || v.url.includes("youtu.be");
                    const isVimeo = v.url.includes("vimeo");
                    if (isYoutube || isVimeo) {
                      const embedUrl = isYoutube
                        ? v.url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")
                        : v.url.replace("vimeo.com/", "player.vimeo.com/video/");
                      return (
                        <iframe
                          key={v.id}
                          src={embedUrl}
                          className="w-full aspect-video rounded-lg"
                          allowFullScreen
                        />
                      );
                    }
                    return (
                      <video key={v.id} src={v.url} controls className="w-full rounded-lg" />
                    );
                  })}
                </div>
              )}

              {/* Description */}
              {annonce.description && (
                <div className="mt-8">
                  <h2 className="font-heading text-xl font-semibold mb-3">Description</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{annonce.description}</p>
                </div>
              )}

              {/* Services */}
              {annonce.services && annonce.services.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-heading text-xl font-semibold mb-3">Services & Équipements</h2>
                  <div className="flex flex-wrap gap-2">
                    {annonce.services.map((s) => (
                      <span key={s.id} className="bg-lavender text-secondary-foreground px-3 py-1.5 rounded-full text-sm font-medium">
                        {s.icone} {s.nom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Conditions */}
              {(annonce.conditions_duree || annonce.conditions_bail) && (
                <div className="mt-8">
                  <h2 className="font-heading text-xl font-semibold mb-3">Conditions de location <span className="text-sm font-normal text-muted-foreground">(négociation possible)</span></h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {annonce.conditions_duree && (
                      <div className="flex items-start gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gold mt-0.5" />
                        <div><span className="font-medium">Durée min.</span><br />{annonce.conditions_duree}</div>
                      </div>
                    )}
                    {annonce.conditions_preavis && (
                      <div className="flex items-start gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gold mt-0.5" />
                        <div><span className="font-medium">Préavis</span><br />{annonce.conditions_preavis}</div>
                      </div>
                    )}
                    {annonce.conditions_bail && (
                      <div className="flex items-start gap-2 text-sm">
                        <FileText className="h-4 w-4 text-gold mt-0.5" />
                        <div><span className="font-medium">Bail</span><br />{annonce.conditions_bail}</div>
                      </div>
                    )}
                    {annonce.conditions_garantie && (
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-gold mt-0.5" />
                        <div><span className="font-medium">Garantie</span><br />{annonce.conditions_garantie}</div>
                      </div>
                    )}
                  </div>
                  {annonce.conditions_notes && (
                    <p className="mt-3 text-sm text-muted-foreground">{annonce.conditions_notes}</p>
                  )}
                </div>
              )}

              {/* Carte */}
              {annonce.batiment?.adresse && (
                <div className="mt-8">
                  <h2 className="font-heading text-xl font-semibold mb-3">Localisation</h2>
                  <div className="rounded-lg overflow-hidden border">
                    <iframe
                      title="Localisation du bâtiment"
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(annonce.batiment.adresse)}`}
                    />
                  </div>
                </div>
              )}

              {/* Comparatif financier */}
              {annonce.type_espace === "Bureau privatif" && annonce.conditions_bail !== "Bail commercial 3-6-9" && annonce.prix_mensuel && annonce.surface && (
                <ComparatifFinancier prixPrestation={annonce.prix_mensuel} surfaceM2={annonce.surface} />
              )}
            </div>

            {/* Right: Info sidebar */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg border p-6 sticky top-24">
                <span className="inline-block bg-lavender text-secondary-foreground text-xs font-medium px-3 py-1 rounded-full mb-4">
                  {annonce.type_espace}
                </span>
                <h1 className="font-heading text-2xl font-bold mb-4">{annonce.titre}</h1>

                {annonce.batiment && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <MapPin className="h-4 w-4" />
                    {annonce.batiment.nom} — {annonce.batiment.adresse}
                  </p>
                )}

                {/* Price block */}
                <div className="bg-primary rounded-lg p-5 mb-6">
                  <div className="text-gold font-heading text-3xl font-bold mb-1">
                    {annonce.prix_mensuel?.toLocaleString("fr-FR")} €<span className="text-lg text-lavender">/mois</span>
                  </div>
                  <div className="text-lavender text-sm">
                    {annonce.surface} m² — Charges {annonce.charges}
                    {annonce.type_espace === "Bureau privatif" && annonce.conditions_bail !== "Bail commercial 3-6-9" && annonce.surface && annonce.surface >= 4 && (
                      <span className="ml-2 text-gold font-medium">· {Math.floor(annonce.surface / 4)} postes</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {pm2m && (
                      <div className="bg-sidebar-accent rounded-md p-3 text-center">
                        <div className="text-gold font-heading font-bold text-lg">{pm2m.toLocaleString("fr-FR")} €</div>
                        <div className="text-lavender text-xs">/m²/mois</div>
                      </div>
                    )}
                    {pm2a && (
                      <div className="bg-sidebar-accent rounded-md p-3 text-center">
                        <div className="text-gold font-heading font-bold text-lg">{pm2a.toLocaleString("fr-FR")} €</div>
                        <div className="text-lavender text-xs">/m²/an</div>
                      </div>
                    )}
                  </div>
                  {annonce.type_espace === "Bureau privatif" && annonce.prix_mensuel && annonce.surface && (
                    <a
                      href="#comparatif-bail"
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-gold text-primary font-medium py-2 rounded-lg hover:opacity-90 transition-opacity text-sm"
                    >
                      📊 Comparer avec un bail classique
                    </a>
                  )}
                </div>

                {annonce.disponibilite && (
                  <div className="flex items-center gap-2 mb-6 text-sm">
                    <Calendar className="h-4 w-4 text-gold" />
                    <span className="font-medium">{annonce.disponibilite}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 bg-lavender text-secondary-foreground font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm"
                  >
                    <Mail className="h-4 w-4" /> Envoyer
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm"
                  >
                    <Download className="h-4 w-4" /> Fiche PDF
                  </button>
                </div>
                <button
                  onClick={() => {
                    const today = new Date().toLocaleDateString("fr-FR");
                    const adresse = annonce.batiment?.adresse || "adresse non renseignée";
                    const subject = encodeURIComponent(`Dénonce de visite — ${annonce.titre}`);
                    const body = encodeURIComponent(
`Monsieur,

Nous avons le plaisir de vous informer que nous avons visité le bâtiment sis "${adresse}", le "${today}" à la société suivante :

La société :

Représentée par :

Activité :

Nous ne manquerons pas de vous tenir informé de la suite de cette visite.

Le nom de ce client vous est communiqué à titre confidentiel et ne doit pas être transmis à des tiers.

Si vous même ou vos services étaient directement contactés par ce client, nous vous serions reconnaissants de bien vouloir nous en aviser aussitôt.

Nous vous remercions de votre confiance et vous prions de croire, Monsieur, à l'assurance de nos sentiments les meilleurs.

Restant à votre disposition,

Bien cordialement,`
                    );
                    window.location.href = `mailto:adrien@belaircamp.org?subject=${subject}&body=${body}`;
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-sm mb-6"
                >
                  <FileText className="h-4 w-4" /> Faire une dénonce
                </button>

                <div className="border-t pt-5">
                  <h3 className="font-heading font-semibold mb-3">Contact</h3>
                  <p className="font-medium text-sm mb-2 flex items-center gap-2">
                    {OWNER.name}
                    <a href={OWNER.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </p>
                  <a href={OWNER.agenda} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 mb-3 font-medium">
                    <Calendar className="h-4 w-4" /> Prendre rendez-vous
                  </a>
                  <a href={`mailto:${OWNER.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-1.5">
                    <Mail className="h-4 w-4" /> {OWNER.email}
                  </a>
                  <a href={`tel:${OWNER.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <Phone className="h-4 w-4" /> {OWNER.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Lightbox */}
      {photos.length > 0 && (
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border-none bg-transparent shadow-none [&>button]:hidden">
            <div className="relative flex items-center justify-center">
              <img
                src={photos[selectedPhoto]?.url}
                alt={annonce.titre}
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-2 right-2 bg-primary/80 text-primary-foreground rounded-full p-2 hover:bg-primary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedPhoto((prev) => (prev - 1 + photos.length) % photos.length)}
                    className="absolute left-2 bg-primary/80 text-primary-foreground rounded-full p-2 hover:bg-primary transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedPhoto((prev) => (prev + 1) % photos.length)}
                    className="absolute right-2 bg-primary/80 text-primary-foreground rounded-full p-2 hover:bg-primary transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-2">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPhoto(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === selectedPhoto ? "bg-accent" : "bg-primary-foreground/40"}`}
                  />
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}


    </div>
  );
}
