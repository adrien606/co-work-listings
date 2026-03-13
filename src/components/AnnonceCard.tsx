import { Link } from "react-router-dom";
import { Annonce, prixM2Mois } from "@/lib/types";
import { MapPin, Maximize2 } from "lucide-react";

interface Props {
  annonce: Annonce;
}

export default function AnnonceCard({ annonce }: Props) {
  const photo = annonce.medias?.[0]?.url;
  const pm2 = prixM2Mois(annonce.prix_mensuel, annonce.surface);

  return (
    <Link
      to={`/annonce/${annonce.id}`}
      className="group flex flex-col bg-primary rounded-lg overflow-hidden border border-transparent hover:border-lavender transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {photo ? (
          <img src={photo} alt={annonce.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-sidebar-accent flex items-center justify-center text-lavender">
            <Maximize2 className="h-12 w-12" />
          </div>
        )}
        {annonce.conditions_bail && (
          <span className="absolute top-3 left-3 bg-gold text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
            {annonce.conditions_bail}
          </span>
        )}
        <span className="absolute top-3 right-3 bg-lavender text-secondary-foreground text-xs font-medium px-3 py-1 rounded-full">
          {annonce.type_espace}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading font-semibold text-primary-foreground text-lg mb-2 line-clamp-2">
          {annonce.titre}
        </h3>
        {annonce.batiment && (
          <p className="flex items-center gap-1.5 text-lavender text-sm mb-3">
            <MapPin className="h-3.5 w-3.5" /> {annonce.batiment.nom}
          </p>
        )}
        <div className="mt-auto pt-3 flex items-end justify-between">
          <div>
            <span className="text-gold font-heading text-2xl font-bold">
              {annonce.prix_mensuel?.toLocaleString("fr-FR")} €
            </span>
            <span className="text-lavender text-sm">/mois</span>
          </div>
          <div className="text-right text-sm text-lavender">
            <div>
              {annonce.surface} m²
              {annonce.type_espace === "Bureau privatif" && annonce.conditions_bail !== "Bail commercial 3-6-9" && annonce.surface && annonce.surface >= 4 && (
                <span className="block text-gold text-xs font-medium">{Math.floor(annonce.surface / 4)} postes</span>
              )}
            </div>
            {pm2 && <div>{pm2.toLocaleString("fr-FR")} €/m²</div>}
          </div>
        </div>
      </div>
    </Link>
  );
}
