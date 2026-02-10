"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileArchive } from "lucide-react";
import { toast } from "sonner";

interface ParallaxDownloadDialogProps {
  sceneId: Id<"parallaxScenes"> | null;
  sceneName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ParallaxDownloadDialog({
  sceneId,
  sceneName,
  open,
  onOpenChange,
}: ParallaxDownloadDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const generateParallaxExport = useAction(api.exports.generateParallaxExport);

  const handleDownload = async () => {
    if (!sceneId) return;

    setIsDownloading(true);
    toast.info("Preparing parallax export...");

    try {
      const { downloadUrl } = await generateParallaxExport({ sceneId });

      if (downloadUrl) {
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${sceneName.toLowerCase().replace(/\s+/g, "_")}_parallax_layers.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Parallax layers downloaded!");
        onOpenChange(false);
      } else {
        toast.error("Export completed but download URL not available. Try again.");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Parallax Layers</DialogTitle>
          <DialogDescription>
            Download all layers for <span className="font-medium">{sceneName}</span> as a ZIP file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border/60 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <FileArchive className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">Layer Files</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Individual PNG files for each parallax layer
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileArchive className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">Metadata & Scroll Speeds</div>
                <div className="text-xs text-muted-foreground mt-1">
                  JSON files with layer depths, scroll durations, and device settings
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileArchive className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">Implementation Guide</div>
                <div className="text-xs text-muted-foreground mt-1">
                  README with usage instructions for any game engine
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            <p className="font-medium mb-1">Universal Format</p>
            <p>
              Works with Unity, Godot, React, or any game engine. Includes metadata for easy
              integration.
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleDownload}
            disabled={isDownloading || !sceneId}
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing Download...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download ZIP
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
