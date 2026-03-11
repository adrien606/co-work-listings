import { useState } from "react";
import { useServices } from "@/hooks/useAnnonces";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Edit, Trash2, X } from "lucide-react";

const EMOJIS = ["📶", "📠", "🏢", "📦", "🚗", "❄️", "🍽️", "🤝", "📋", "📽️", "♿", "🔑", "🔢", "🔒", "🛎️", "☕", "🌿", "🖨️", "💡", "🧹"];

export default function AdminServices() {
  const { data: services, isLoading } = useServices();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [nom, setNom] = useState("");
  const [icone, setIcone] = useState("📦");

  const resetForm = () => { setNom(""); setIcone("📦"); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) { toast.error("Nom requis"); return; }
    if (editing) {
      await supabase.from("services").update({ nom: nom.trim(), icone }).eq("id", editing);
    } else {
      const maxOrdre = Math.max(0, ...(services?.map((s) => s.ordre) || [0]));
      await supabase.from("services").insert({ nom: nom.trim(), icone, ordre: maxOrdre + 1 });
    }
    qc.invalidateQueries({ queryKey: ["services"] });
    toast.success(editing ? "Service modifié" : "Service ajouté");
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce service ?")) return;
    await supabase.from("services").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["services"] });
    toast.success("Service supprimé");
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Services</h1>

      <form onSubmit={handleSubmit} className="bg-card rounded-lg border p-6 mb-8">
        <h2 className="font-heading font-semibold mb-4">{editing ? "Modifier le service" : "Ajouter un service"}</h2>
        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-sm font-medium mb-1">Icône</label>
            <div className="flex flex-wrap gap-1 max-w-xs">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcone(e)}
                  className={`w-8 h-8 rounded text-lg flex items-center justify-center transition-colors ${icone === e ? "bg-accent" : "hover:bg-muted"}`}
                >
                  {e}
                </button>
              ))}
            </div>
            <input value={icone} onChange={(e) => setIcone(e.target.value)} className="mt-2 w-20 px-2 py-1 rounded border bg-background text-sm text-center" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Nom *</label>
            <input value={nom} onChange={(e) => setNom(e.target.value)} required className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-accent text-accent-foreground font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              {editing ? "Enregistrer" : <><Plus className="h-4 w-4" /> Ajouter</>}
            </button>
            {editing && <button type="button" onClick={resetForm} className="px-3 py-2 rounded-lg border text-sm"><X className="h-4 w-4" /></button>}
          </div>
        </div>
      </form>

      {isLoading ? (
        <div className="animate-pulse space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded-lg" />)}</div>
      ) : (
        <div className="space-y-2">
          {services?.map((s) => (
            <div key={s.id} className="bg-card rounded-lg border p-3 flex items-center gap-3">
              <span className="text-xl">{s.icone}</span>
              <span className="flex-1 font-medium text-sm">{s.nom}</span>
              <button onClick={() => { setEditing(s.id); setNom(s.nom); setIcone(s.icone); }} className="p-2 rounded-md hover:bg-muted"><Edit className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(s.id)} className="p-2 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
