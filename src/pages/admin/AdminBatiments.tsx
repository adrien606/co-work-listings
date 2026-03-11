import { useState } from "react";
import { useBatiments } from "@/hooks/useAnnonces";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Edit, Trash2, X, Loader2 } from "lucide-react";
import heic2any from "heic2any";

export default function AdminBatiments() {
  const { data: batiments, isLoading } = useBatiments();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ nom: "", adresse: "", description: "", photo_url: "" });
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const resetForm = () => { setForm({ nom: "", adresse: "", description: "", photo_url: "" }); setEditing(null); setPhotoFile(null); };

  const startEdit = (b: any) => {
    setEditing(b.id);
    setForm({ nom: b.nom, adresse: b.adresse, description: b.description || "", photo_url: b.photo_url || "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.adresse.trim()) { toast.error("Nom et adresse requis"); return; }
    setSaving(true);
    try {
      let photoUrl = form.photo_url;
      if (photoFile) {
        let fileToUpload: File | Blob = photoFile;
        let fileName = photoFile.name;

        // Convert HEIC to JPEG
        if (photoFile.name.toLowerCase().endsWith(".heic") || photoFile.type === "image/heic") {
          const converted = await heic2any({ blob: photoFile, toType: "image/jpeg", quality: 0.85 });
          fileToUpload = Array.isArray(converted) ? converted[0] : converted;
          fileName = photoFile.name.replace(/\.heic$/i, ".jpg");
        }

        const path = `batiments/${Date.now()}_${fileName}`;
        const { error } = await supabase.storage.from("medias").upload(path, fileToUpload, {
          contentType: fileToUpload instanceof File ? fileToUpload.type : "image/jpeg",
        });
        if (!error) {
          const { data } = supabase.storage.from("medias").getPublicUrl(path);
          photoUrl = data.publicUrl;
        }
      }

      const payload = { nom: form.nom.trim(), adresse: form.adresse.trim(), description: form.description.trim() || null, photo_url: photoUrl || null };
      if (editing) {
        await supabase.from("batiments").update(payload).eq("id", editing);
      } else {
        await supabase.from("batiments").insert(payload);
      }
      qc.invalidateQueries({ queryKey: ["batiments"] });
      toast.success(editing ? "Bâtiment modifié" : "Bâtiment ajouté");
      resetForm();
    } catch { toast.error("Erreur"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce bâtiment ?")) return;
    await supabase.from("batiments").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["batiments"] });
    toast.success("Bâtiment supprimé");
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Bâtiments / Sites</h1>

      <form onSubmit={handleSubmit} className="bg-card rounded-lg border p-6 mb-8">
        <h2 className="font-heading font-semibold mb-4">{editing ? "Modifier le bâtiment" : "Ajouter un bâtiment"}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom *</label>
            <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Adresse *</label>
            <input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} required className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="text-sm" />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button type="submit" disabled={saving} className="bg-accent text-accent-foreground font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editing ? "Enregistrer" : <><Plus className="h-4 w-4" /> Ajouter</>}
          </button>
          {editing && <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border text-sm"><X className="h-4 w-4" /></button>}
        </div>
      </form>

      {isLoading ? (
        <div className="animate-pulse space-y-3">{[1, 2].map((i) => <div key={i} className="h-16 bg-muted rounded-lg" />)}</div>
      ) : !batiments?.length ? (
        <p className="text-center text-muted-foreground py-10">Aucun bâtiment.</p>
      ) : (
        <div className="space-y-3">
          {batiments.map((b) => (
            <div key={b.id} className="bg-card rounded-lg border p-4 flex items-center gap-4">
              {b.photo_url && <img src={b.photo_url} alt="" className="w-16 h-16 rounded-md object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">{b.nom}</h3>
                <p className="text-sm text-muted-foreground truncate">{b.adresse}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(b)} className="p-2 rounded-md hover:bg-muted"><Edit className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(b.id)} className="p-2 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
