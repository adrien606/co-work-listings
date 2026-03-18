import { useAllAnnonces } from "@/hooks/useAnnonces";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { Plus, Edit, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminAnnonces() {
  const { data: annonces, isLoading } = useAllAnnonces();
  const qc = useQueryClient();

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    await supabase.from("annonces").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["annonces"] });
    toast.success("Annonce supprimée");
  };

  const handleDuplicate = async (id: string) => {
    const a = annonces?.find((x) => x.id === id);
    if (!a) return;
    const { id: _, created_at, updated_at, batiment, medias, services, ...rest } = a as any;
    const { data, error } = await supabase.from("annonces").insert({ ...rest, titre: `${a.titre} (copie)`, statut: "brouillon" }).select().single();
    if (error) { toast.error("Erreur"); return; }
    // Copy services and medias
    const [servicesRes, mediasRes] = await Promise.all([
      supabase.from("annonce_services").select("service_id").eq("annonce_id", id),
      supabase.from("medias").select("type, url, ordre").eq("annonce_id", id),
    ]);
    const inserts = [];
    if (servicesRes.data?.length) {
      inserts.push(supabase.from("annonce_services").insert(servicesRes.data.map((s: any) => ({ annonce_id: data.id, service_id: s.service_id }))).then());
    }
    if (mediasRes.data?.length) {
      inserts.push(supabase.from("medias").insert(mediasRes.data.map((m: any) => ({ annonce_id: data.id, type: m.type, url: m.url, ordre: m.ordre }))).then());
    }
    await Promise.all(inserts);
    qc.invalidateQueries({ queryKey: ["annonces"] });
    toast.success("Annonce dupliquée en brouillon");
  };

  const handleToggleStatut = async (id: string, current: string) => {
    const newStatut = current === "publiee" ? "brouillon" : "publiee";
    await supabase.from("annonces").update({ statut: newStatut }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["annonces"] });
    toast.success(newStatut === "publiee" ? "Annonce publiée" : "Annonce désactivée");
  };

  const statutLabel = (s: string) => {
    if (s === "publiee") return <span className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">Publiée</span>;
    if (s === "brouillon") return <span className="bg-accent/30 text-accent-foreground text-xs px-2 py-0.5 rounded-full">Brouillon</span>;
    return <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">Archivée</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Annonces</h1>
        <Link
          to="/admin/annonces/new"
          className="flex items-center gap-2 bg-accent text-accent-foreground font-medium px-4 py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Nouvelle annonce
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded-lg" />)}
        </div>
      ) : !annonces?.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>Aucune annonce. Créez votre première annonce !</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-4">Photo</th>
                <th className="p-4">Titre</th>
                <th className="p-4 hidden md:table-cell">Type</th>
                <th className="p-4 hidden md:table-cell">Surface</th>
                <th className="p-4 hidden md:table-cell">Prix</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {annonces.map((a) => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-4">
                    {a.medias?.[0]?.url ? (
                      <img src={a.medias[0].url} alt="" className="w-12 h-12 rounded-md object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-muted" />
                    )}
                  </td>
                  <td className="p-4 font-medium">{a.titre}</td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground">{a.type_espace}</td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground">{a.surface} m²</td>
                  <td className="p-4 hidden md:table-cell font-medium">{a.prix_mensuel?.toLocaleString("fr-FR")} €</td>
                  <td className="p-4">{statutLabel(a.statut)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/admin/annonces/${a.id}`} className="p-2 rounded-md hover:bg-muted transition-colors" title="Modifier">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button onClick={() => handleDuplicate(a.id)} className="p-2 rounded-md hover:bg-muted transition-colors" title="Dupliquer">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleToggleStatut(a.id, a.statut)} className="p-2 rounded-md hover:bg-muted transition-colors" title={a.statut === "publiee" ? "Désactiver" : "Publier"}>
                        {a.statut === "publiee" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors" title="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
