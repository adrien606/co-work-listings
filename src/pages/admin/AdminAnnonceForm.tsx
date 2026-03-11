import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useBatiments, useServices } from "@/hooks/useAnnonces";
import { TYPES_ESPACE, CHARGES_OPTIONS, STATUTS, DUREES, PREAVIS, BAILS, prixM2Mois, prixM2An } from "@/lib/types";
import type { Annonce, Media } from "@/lib/types";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";

export default function AdminAnnonceForm() {
  const { id } = useParams();
  const isEdit = !!id && id !== "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: batiments } = useBatiments();
  const { data: services } = useServices();

  const [form, setForm] = useState({
    titre: "", description: "", type_espace: "Bureau privatif",
    surface: "", prix_mensuel: "", charges: "incluses",
    disponibilite: "Disponible immédiatement", statut: "brouillon",
    batiment_id: "", conditions_duree: "", conditions_preavis: "",
    conditions_bail: "", conditions_garantie: "", conditions_notes: "",
    mise_en_avant: false,
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [existingMedias, setExistingMedias] = useState<Media[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data } = await supabase.from("annonces").select("*").eq("id", id).single();
      if (data) {
        setForm({
          titre: data.titre || "", description: data.description || "",
          type_espace: data.type_espace, surface: data.surface?.toString() || "",
          prix_mensuel: data.prix_mensuel?.toString() || "", charges: data.charges || "incluses",
          disponibilite: data.disponibilite || "Disponible immédiatement",
          statut: data.statut, batiment_id: data.batiment_id || "",
          conditions_duree: data.conditions_duree || "", conditions_preavis: data.conditions_preavis || "",
          conditions_bail: data.conditions_bail || "", conditions_garantie: data.conditions_garantie || "",
          conditions_notes: data.conditions_notes || "", mise_en_avant: data.mise_en_avant || false,
        });
      }
      const { data: medias } = await supabase.from("medias").select("*").eq("annonce_id", id).order("ordre");
      if (medias) setExistingMedias(medias);
      const { data: as_ } = await supabase.from("annonce_services").select("service_id").eq("annonce_id", id);
      if (as_) setSelectedServices(as_.map((s: any) => s.service_id));
    })();
  }, [id, isEdit]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setNewFiles([...newFiles, ...Array.from(e.target.files)]);
  };

  const removeNewFile = (idx: number) => setNewFiles(newFiles.filter((_, i) => i !== idx));

  const removeExistingMedia = async (mediaId: string) => {
    await supabase.from("medias").delete().eq("id", mediaId);
    setExistingMedias(existingMedias.filter((m) => m.id !== mediaId));
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((s) => s !== serviceId) : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim()) { toast.error("Le titre est requis"); return; }
    setSaving(true);

    try {
      const payload = {
        titre: form.titre.trim(),
        description: form.description.trim() || null,
        type_espace: form.type_espace,
        surface: form.surface ? Number(form.surface) : null,
        prix_mensuel: form.prix_mensuel ? Number(form.prix_mensuel) : null,
        charges: form.charges,
        disponibilite: form.disponibilite,
        statut: form.statut,
        batiment_id: form.batiment_id || null,
        conditions_duree: form.conditions_duree || null,
        conditions_preavis: form.conditions_preavis || null,
        conditions_bail: form.conditions_bail || null,
        conditions_garantie: form.conditions_garantie || null,
        conditions_notes: form.conditions_notes || null,
        mise_en_avant: form.mise_en_avant,
      };

      let annonceId = id;
      if (isEdit) {
        await supabase.from("annonces").update(payload).eq("id", id);
      } else {
        const { data, error } = await supabase.from("annonces").insert(payload).select().single();
        if (error) throw error;
        annonceId = data.id;
      }

      // Services
      await supabase.from("annonce_services").delete().eq("annonce_id", annonceId!);
      if (selectedServices.length > 0) {
        await supabase.from("annonce_services").insert(
          selectedServices.map((sid) => ({ annonce_id: annonceId!, service_id: sid }))
        );
      }

      // Upload new files
      if (newFiles.length > 0) {
        setUploading(true);
        for (let i = 0; i < newFiles.length; i++) {
          const file = newFiles[i];
          const ext = file.name.split(".").pop();
          const path = `${annonceId}/${Date.now()}_${i}.${ext}`;
          const { error } = await supabase.storage.from("medias").upload(path, file);
          if (error) { toast.error(`Erreur upload: ${file.name}`); continue; }
          const { data: urlData } = supabase.storage.from("medias").getPublicUrl(path);
          await supabase.from("medias").insert({
            annonce_id: annonceId!,
            type: file.type.startsWith("video") ? "video" : "photo",
            url: urlData.publicUrl,
            ordre: existingMedias.length + i,
          });
        }
        setUploading(false);
      }

      // Video URL
      if (videoUrl.trim()) {
        await supabase.from("medias").insert({
          annonce_id: annonceId!,
          type: "video",
          url: videoUrl.trim(),
          ordre: existingMedias.length + newFiles.length,
        });
      }

      qc.invalidateQueries({ queryKey: ["annonces"] });
      toast.success(isEdit ? "Annonce modifiée" : "Annonce créée");
      navigate("/admin");
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const pm2m = prixM2Mois(Number(form.prix_mensuel) || null, Number(form.surface) || null);
  const pm2a = prixM2An(Number(form.prix_mensuel) || null, Number(form.surface) || null);

  return (
    <div>
      <button onClick={() => navigate("/admin")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>
      <h1 className="font-heading text-2xl font-bold mb-6">{isEdit ? "Modifier l'annonce" : "Nouvelle annonce"}</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Médias */}
        <section className="bg-card rounded-lg border p-6">
          <h2 className="font-heading font-semibold mb-4">Médias</h2>
          {existingMedias.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {existingMedias.map((m) => (
                <div key={m.id} className="relative w-24 h-24">
                  {m.type === "photo" ? (
                    <img src={m.url} alt="" className="w-full h-full object-cover rounded-md" />
                  ) : (
                    <div className="w-full h-full bg-muted rounded-md flex items-center justify-center text-xs">Vidéo</div>
                  )}
                  <button type="button" onClick={() => removeExistingMedia(m.id)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="flex items-center gap-3 border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-accent transition-colors">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Cliquez ou glissez vos photos/vidéos ici</span>
            <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
          </label>
          {newFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {newFiles.map((f, i) => (
                <span key={i} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                  {f.name}
                  <button type="button" onClick={() => removeNewFile(i)}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          )}
          <input
            type="url"
            placeholder="URL vidéo (YouTube, Vimeo)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="mt-3 w-full px-3 py-2 rounded-md border bg-background text-sm"
          />
        </section>

        {/* Informations */}
        <section className="bg-card rounded-lg border p-6">
          <h2 className="font-heading font-semibold mb-4">Informations</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Titre *</label>
              <input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type d'espace</label>
              <select value={form.type_espace} onChange={(e) => setForm({ ...form, type_espace: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-background text-sm">
                {TYPES_ESPACE.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bâtiment / Site</label>
              <select value={form.batiment_id} onChange={(e) => setForm({ ...form, batiment_id: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-background text-sm">
                <option value="">— Aucun —</option>
                {batiments?.map((b) => <option key={b.id} value={b.id}>{b.nom} — {b.adresse}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Surface (m²)</label>
              <input type="number" value={form.surface} onChange={(e) => setForm({ ...form, surface: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prix mensuel (€)</label>
              <input type="number" value={form.prix_mensuel} onChange={(e) => setForm({ ...form, prix_mensuel: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
            </div>
            {(pm2m || pm2a) && (
              <div className="md:col-span-2 flex gap-4 bg-muted p-3 rounded-lg text-sm">
                {pm2m && <span className="font-medium">{pm2m.toLocaleString("fr-FR")} €/m²/mois</span>}
                {pm2a && <span className="font-medium">{pm2a.toLocaleString("fr-FR")} €/m²/an</span>}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Charges</label>
              <select value={form.charges} onChange={(e) => setForm({ ...form, charges: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-background text-sm">
                {CHARGES_OPTIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Disponibilité</label>
              <input value={form.disponibilite} onChange={(e) => setForm({ ...form, disponibilite: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-background text-sm" placeholder="Disponible immédiatement" />
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="bg-card rounded-lg border p-6">
          <h2 className="font-heading font-semibold mb-4">Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {services?.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted p-2 rounded-md transition-colors">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(s.id)}
                  onChange={() => toggleService(s.id)}
                  className="rounded border-input"
                />
                <span>{s.icone} {s.nom}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Conditions */}
        <section className="bg-card rounded-lg border p-6">
          <h2 className="font-heading font-semibold mb-4">Conditions de location</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Durée minimale</label>
              <select value={form.conditions_duree} onChange={(e) => setForm({ ...form, conditions_duree: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-background text-sm">
                <option value="">— Non précisé —</option>
                {DUREES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Préavis</label>
              <select value={form.conditions_preavis} onChange={(e) => setForm({ ...form, conditions_preavis: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-background text-sm">
                <option value="">— Non précisé —</option>
                {PREAVIS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type de bail</label>
              <select value={form.conditions_bail} onChange={(e) => setForm({ ...form, conditions_bail: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-background text-sm">
                <option value="">— Non précisé —</option>
                {BAILS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dépôt de garantie</label>
              <input value={form.conditions_garantie} onChange={(e) => setForm({ ...form, conditions_garantie: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-background text-sm" placeholder="Ex: 2 mois de loyer" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Notes / Conditions particulières</label>
              <textarea value={form.conditions_notes} onChange={(e) => setForm({ ...form, conditions_notes: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
            </div>
          </div>
        </section>

        {/* Statut */}
        <section className="bg-card rounded-lg border p-6">
          <h2 className="font-heading font-semibold mb-4">Publication</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Statut</label>
              <select value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })} className="w-full px-3 py-2 rounded-md border bg-background text-sm">
                <option value="brouillon">Brouillon</option>
                <option value="publiee">Publiée</option>
                <option value="archivee">Archivée</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.mise_en_avant} onChange={(e) => setForm({ ...form, mise_en_avant: e.target.checked })} className="rounded border-input" />
                Mettre en avant sur la page d'accueil
              </label>
            </div>
          </div>
        </section>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-accent-foreground font-heading font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Enregistrer" : "Créer l'annonce"}
          </button>
          <button type="button" onClick={() => navigate("/admin")} className="px-6 py-3 rounded-lg border text-sm hover:bg-muted transition-colors">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
