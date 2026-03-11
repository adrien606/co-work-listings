import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AdminAPropos() {
  const qc = useQueryClient();
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [sites, setSites] = useState("");
  const [surface, setSurface] = useState("");
  const [espaces, setEspaces] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("page_content").select("*").eq("id", "about").single();
      if (data) {
        setTitre(data.titre || "");
        setDescription(data.description || "");
        const c = data.chiffres as any || {};
        setSites(c.sites || "");
        setSurface(c.surface || "");
        setEspaces(c.espaces || "");
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("page_content").upsert({
      id: "about",
      titre,
      description,
      chiffres: { sites, surface, espaces },
    });
    if (error) toast.error("Erreur");
    else { toast.success("Page À propos mise à jour"); qc.invalidateQueries({ queryKey: ["page_content"] }); }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Page À propos</h1>

      <div className="bg-card rounded-lg border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Titre</label>
          <input value={titre} onChange={(e) => setTitre(e.target.value)} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
        </div>

        <h3 className="font-heading font-semibold pt-2">Chiffres clés</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de sites</label>
            <input value={sites} onChange={(e) => setSites(e.target.value)} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Surface totale (m²)</label>
            <input value={surface} onChange={(e) => setSurface(e.target.value)} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nombre d'espaces</label>
            <input value={espaces} onChange={(e) => setEspaces(e.target.value)} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="bg-accent text-accent-foreground font-medium px-6 py-2.5 rounded-lg text-sm flex items-center gap-2 mt-4">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer
        </button>
      </div>
    </div>
  );
}
