import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";


export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/admin");
    } catch (err: any) {
      toast.error("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-primary-foreground mb-2">BelAirCamp</h1>
          <p className="text-lavender">Accès administration</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 shadow-2xl">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm"
              placeholder="admin@exemple.com"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1.5">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-accent-foreground font-heading font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full mt-3 text-sm text-lavender hover:text-primary-foreground transition-colors"
          >
            {isSignUp ? "Déjà un compte ? Se connecter" : "Créer un compte admin"}
          </button>
        </form>
      </div>
    </div>
  );
}