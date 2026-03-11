import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { OWNER } from "@/lib/supabase";

export default function AdminParametres() {
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast.error("Le mot de passe doit faire au moins 6 caractères"); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else { toast.success("Mot de passe modifié"); setNewPassword(""); }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Paramètres</h1>

      <div className="bg-card rounded-lg border p-6 mb-6">
        <h2 className="font-heading font-semibold mb-4">Coordonnées (codées en dur)</h2>
        <p className="text-sm text-muted-foreground mb-1">Ces informations apparaissent automatiquement sur toutes les pages.</p>
        <div className="mt-3 space-y-1 text-sm">
          <p><strong>Nom :</strong> {OWNER.name}</p>
          <p><strong>Email :</strong> {OWNER.email}</p>
          <p><strong>Téléphone :</strong> {OWNER.phone}</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <h2 className="font-heading font-semibold mb-4">Modifier le mot de passe</h2>
        <div className="flex gap-3 items-end max-w-md">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
          </div>
          <button onClick={handleChangePassword} disabled={saving} className="bg-accent text-accent-foreground font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
}
