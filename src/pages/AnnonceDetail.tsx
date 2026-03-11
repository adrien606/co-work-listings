import { useParams, Link } from "react-router-dom";
import { useAnnonce } from "@/hooks/useAnnonces";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { OWNER } from "@/lib/supabase";
import { prixM2Mois, prixM2An } from "@/lib/types";
import { ArrowLeft, Share2, Download, Mail, Phone, MapPin, Calendar, FileText, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AnnonceDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: annonce, isLoading } = useAnnonce(id!);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

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
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié dans le presse-papier !");
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

    doc.setFontSize(16);
    doc.setTextColor(255, 205, 84);
    doc.text(`${annonce.prix_mensuel?.toLocaleString("fr-FR")} €/mois`, 15, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Surface : ${annonce.surface} m²`, 15, y); y += 6;
    if (pm2m) { doc.text(`Prix/m²/mois : ${pm2m.toLocaleString("fr-FR")} €`, 15, y); y += 6; }
    if (pm2a) { doc.text(`Prix/m²/an : ${pm2a.toLocaleString("fr-FR")} €`, 15, y); y += 6; }
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
      doc.text(annonce.services.map((s) => `${s.icone} ${s.nom}`).join(" • "), 15, y); y += 10;
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

    // Contact footer
    doc.setFillColor(29, 29, 86);
    doc.rect(0, 270, 210, 27, "F");
    doc.setTextColor(255, 205, 84);
    doc.setFontSize(11);
    doc.text(`${OWNER.name} — ${OWNER.email} — ${OWNER.phone}`, 15, 282);
    doc.setTextColor(187, 184, 255);
    doc.setFontSize(8);
    doc.text(window.location.href, 15, 289);

    doc.save(`${annonce.titre.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
    toast.success("PDF téléchargé !");
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
                  <div className="aspect-[16/10] rounded-lg overflow-hidden mb-3">
                    <img
                      src={photos[selectedPhoto]?.url}
                      alt={annonce.titre}
                      className="w-full h-full object-cover"
                    />
                  </div>
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
                  <h2 className="font-heading text-xl font-semibold mb-3">Conditions de location</h2>
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
                  <div className="text-lavender text-sm">{annonce.surface} m² — Charges {annonce.charges}</div>
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
                    <Share2 className="h-4 w-4" /> Partager
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm"
                  >
                    <Download className="h-4 w-4" /> Fiche PDF
                  </button>
                </div>

                {/* Contact */}
                <div className="border-t pt-5">
                  <h3 className="font-heading font-semibold mb-3">Contact</h3>
                  <p className="font-medium text-sm mb-2">{OWNER.name}</p>
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

      <PublicFooter />
    </div>
  );
}
