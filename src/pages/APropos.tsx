import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { usePageContent, useBatiments } from "@/hooks/useAnnonces";
import { OWNER } from "@/lib/supabase";
import { Mail, Phone, Building2, Ruler, LayoutGrid, Users, Briefcase, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

      {/* FAQ */}
      <section className="bg-light-section py-16">
        <div className="container max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-center mb-2 flex items-center justify-center gap-2">
            <HelpCircle className="h-6 w-6 text-gold" />
            FAQ — Bel Air Camp
          </h2>
          <p className="text-center text-muted-foreground mb-10">Toutes les réponses à vos questions</p>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>C'est quoi exactement la différence avec un bail classique ?</AccordionTrigger>
              <AccordionContent>
                Un bail classique, c'est de l'immobilier. Ici, c'est un contrat de prestation de services. Vous ne louez pas des murs, vous accédez à un espace 100 % opérationnel. Tout ce qui touche à la gestion du local — technique, réglementaire, administrative — est pris en charge. Vous arrivez, vous travaillez.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>Qu'est-ce qui est inclus dans le prix ?</AccordionTrigger>
              <AccordionContent>
                Électricité, charges locatives, taxe foncière, gestion technique, contrôles réglementaires. Aucun frais caché, aucune mauvaise surprise en fin de mois.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>C'est plus cher qu'un bail classique ?</AccordionTrigger>
              <AccordionContent>
                En apparence, le loyer au m² peut sembler plus élevé. Mais dans un bail classique, il faut ajouter les charges, la taxe foncière, les contrats de maintenance, les mises aux normes, la gestion technique… Une fois tout additionné, la différence est souvent minime — voire inexistante. Et surtout, ici il n'y a aucune immobilisation : c'est uniquement de la charge, pas du CAPEX. C'est beaucoup plus sain pour le bilan d'une entreprise.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>À qui ça s'adresse ?</AccordionTrigger>
              <AccordionContent>
                À toute entreprise ou indépendant qui veut se concentrer sur son activité plutôt que sur la gestion de son local. Un artisan, un prestataire de services, un organisme de formation, une startup — ils viennent produire ou travailler, pas gérer de l'immobilier.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger>Quels engagements de durée ?</AccordionTrigger>
              <AccordionContent>
                C'est flexible selon le bâtiment et les besoins : à la journée, à la semaine, au mois ou à l'année. Pas d'engagement long terme imposé.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6">
              <AccordionTrigger>Et si mon activité évolue, je peux changer d'espace ?</AccordionTrigger>
              <AccordionContent>
                Oui. Le modèle est pensé pour s'adapter à la croissance ou aux changements d'activité. Pas besoin de renégocier un bail sur 9 ans.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-7">
              <AccordionTrigger>Les espaces sont-ils aux normes ?</AccordionTrigger>
              <AccordionContent>
                Oui, et c'est justement l'un des grands avantages. Les contrôles réglementaires et la mise en conformité sont gérés par Bel Air Camp. Pour Bel Air School notamment, les espaces sont certifiés Qualiopi et classés ERP 5 — les organismes de formation peuvent exercer sans aucune démarche supplémentaire.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-8">
              <AccordionTrigger>Quand est-ce que je peux m'installer ?</AccordionTrigger>
              <AccordionContent>
                Très rapidement. Les espaces sont opérationnels dès la signature. Pas de travaux, pas d'attente.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

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
