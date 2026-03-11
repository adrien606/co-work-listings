import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Annonce, Service, Media, Batiment } from "@/lib/types";

export function usePublicAnnonces() {
  return useQuery({
    queryKey: ["annonces", "public"],
    queryFn: async () => {
      const { data: annonces, error } = await supabase
        .from("annonces")
        .select("*, batiment:batiments(*)")
        .eq("statut", "publiee")
        .order("mise_en_avant", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch medias and services for each annonce
      const ids = (annonces as Annonce[]).map((a) => a.id);
      
      const [mediasRes, servicesRes] = await Promise.all([
        supabase.from("medias").select("*").in("annonce_id", ids).order("ordre"),
        supabase.from("annonce_services").select("*, service:services(*)").in("annonce_id", ids),
      ]);

      const mediasMap = new Map<string, Media[]>();
      (mediasRes.data || []).forEach((m: Media) => {
        if (!mediasMap.has(m.annonce_id)) mediasMap.set(m.annonce_id, []);
        mediasMap.get(m.annonce_id)!.push(m);
      });

      const servicesMap = new Map<string, Service[]>();
      (servicesRes.data || []).forEach((as: any) => {
        if (!servicesMap.has(as.annonce_id)) servicesMap.set(as.annonce_id, []);
        if (as.service) servicesMap.get(as.annonce_id)!.push(as.service);
      });

      return (annonces as any[]).map((a) => ({
        ...a,
        medias: mediasMap.get(a.id) || [],
        services: servicesMap.get(a.id) || [],
      })) as Annonce[];
    },
  });
}

export function useAnnonce(id: string) {
  return useQuery({
    queryKey: ["annonce", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("annonces")
        .select("*, batiment:batiments(*)")
        .eq("id", id)
        .single();
      if (error) throw error;

      const [mediasRes, servicesRes] = await Promise.all([
        supabase.from("medias").select("*").eq("annonce_id", id).order("ordre"),
        supabase.from("annonce_services").select("*, service:services(*)").eq("annonce_id", id),
      ]);

      return {
        ...data,
        medias: mediasRes.data || [],
        services: (servicesRes.data || []).map((as: any) => as.service).filter(Boolean),
      } as Annonce;
    },
    enabled: !!id,
  });
}

export function useAllAnnonces() {
  return useQuery({
    queryKey: ["annonces", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("annonces")
        .select("*, batiment:batiments(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const ids = (data as Annonce[]).map((a) => a.id);
      const [mediasRes] = await Promise.all([
        supabase.from("medias").select("*").in("annonce_id", ids).order("ordre"),
      ]);

      const mediasMap = new Map<string, Media[]>();
      (mediasRes.data || []).forEach((m: Media) => {
        if (!mediasMap.has(m.annonce_id)) mediasMap.set(m.annonce_id, []);
        mediasMap.get(m.annonce_id)!.push(m);
      });

      return (data as any[]).map((a) => ({
        ...a,
        medias: mediasMap.get(a.id) || [],
      })) as Annonce[];
    },
  });
}

export function useBatiments() {
  return useQuery({
    queryKey: ["batiments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("batiments").select("*").order("nom");
      if (error) throw error;
      return data as Batiment[];
    },
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("ordre");
      if (error) throw error;
      return data as Service[];
    },
  });
}

export function usePageContent() {
  return useQuery({
    queryKey: ["page_content", "about"],
    queryFn: async () => {
      const { data, error } = await supabase.from("page_content").select("*").eq("id", "about").single();
      if (error) throw error;
      return data;
    },
  });
}
