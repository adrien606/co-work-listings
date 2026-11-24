import { Box, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MatterportVisit({ url }: { url: string }) {
  return (
    <section className="mb-6" aria-label="Visite virtuelle 3D">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
          <Box className="h-5 w-5 text-primary" /> Visite virtuelle 3D
        </h2>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 whitespace-normal h-auto min-h-10">
          <a href={url} target="_blank" rel="noopener noreferrer">
            Ouvrir la visite 3D <ExternalLink />
          </a>
        </Button>
      </div>
      <iframe
        title="Visite virtuelle Matterport"
        src={url}
        className="w-full aspect-[4/3] sm:aspect-video rounded-lg border bg-muted"
        allow="fullscreen; xr-spatial-tracking"
        allowFullScreen
      />
    </section>
  );
}