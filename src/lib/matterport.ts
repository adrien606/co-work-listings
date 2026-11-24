import { z } from "zod";
import type { Media } from "@/lib/types";

export const matterportUrlSchema = z.string().trim().max(2048).refine((value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "my.matterport.com" &&
      !url.username && !url.password && !url.port && url.pathname === "/show/" &&
      Boolean(url.searchParams.get("m"));
  } catch {
    return false;
  }
}, "Utilisez un lien https://my.matterport.com/show/ avec un identifiant de visite.");

export function getMatterportUrl(medias?: Pick<Media, "type" | "url">[]): string | null {
  const value = medias?.find((media) => media.type === "matterport")?.url;
  const result = matterportUrlSchema.safeParse(value);
  return result.success && result.data ? result.data : null;
}

export function buildListingShareUrl(title: string, listingUrl: string, tourUrl: string | null): string {
  const subject = encodeURIComponent(`Espace disponible : ${title}`);
  const body = encodeURIComponent(`Bonjour,\n\nJe vous partage cette annonce :\n${title}\n\n${listingUrl}${tourUrl ? `\n\nVisite virtuelle 3D :\n${tourUrl}` : ""}\n\nCordialement`);
  return `mailto:?subject=${subject}&body=${body}`;
}