"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Download, ArrowLeft, Package, Check, FolderTree, FileJson, File, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ExportFormat = "unity" | "godot" | "generic";

interface FileTreeItem {
  name: string;
  type: "folder" | "file";
  icon: "folder" | "png" | "json" | "meta" | "tres" | "csv";
  children?: FileTreeItem[];
}

const EXPORT_FORMATS: Array<{
  id: ExportFormat;
  name: string;
  description: string;
  details: string;
  fileTree: FileTreeItem;
}> = [
  {
    id: "unity",
    name: "Unity",
    description: "Ready for AnimatorController",
    details: "Includes .meta files and folder structure matching Unity conventions",
    fileTree: {
      name: "Assets/Sprites/CharacterName",
      type: "folder",
      icon: "folder",
      children: [
        {
          name: "animations",
          type: "folder",
          icon: "folder",
          children: [
            { name: "idle_right.png", type: "file", icon: "png" },
            { name: "walk_right.png", type: "file", icon: "png" },
          ],
        },
        { name: "metadata.json", type: "file", icon: "json" },
      ],
    },
  },
  {
    id: "godot",
    name: "Godot",
    description: "Includes .tres resources",
    details: "SpriteFrames resources pre-configured for AnimatedSprite2D",
    fileTree: {
      name: "res://sprites/character_name",
      type: "folder",
      icon: "folder",
      children: [
        { name: "idle_right.png", type: "file", icon: "png" },
        { name: "idle_right.tres", type: "file", icon: "tres" },
        { name: "walk_right.png", type: "file", icon: "png" },
        { name: "walk_right.tres", type: "file", icon: "tres" },
        { name: "metadata.json", type: "file", icon: "json" },
      ],
    },
  },
  {
    id: "generic",
    name: "Generic ZIP",
    description: "Universal format",
    details: "Individual frames, sprite sheets, and CSV manifest for any engine",
    fileTree: {
      name: "character_name",
      type: "folder",
      icon: "folder",
      children: [
        {
          name: "frames",
          type: "folder",
          icon: "folder",
          children: [
            { name: "idle_right_00.png", type: "file", icon: "png" },
            { name: "idle_right_01.png", type: "file", icon: "png" },
          ],
        },
        {
          name: "sheets",
          type: "folder",
          icon: "folder",
          children: [
            { name: "idle_right_sheet.png", type: "file", icon: "png" },
          ],
        },
        { name: "metadata.json", type: "file", icon: "json" },
        { name: "manifest.csv", type: "file", icon: "csv" },
      ],
    },
  },
];

export default function ExportPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as Id<"projects">;

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("unity");
  const [isExporting, setIsExporting] = useState(false);

  const project = useQuery(api.projects.get, { id: projectId });
  const generateExport = useAction(api.exports.generateExport);

  const handleDownload = async () => {
    setIsExporting(true);
    toast.info(`Preparing ${selectedFormat.toUpperCase()} export...`);

    try {
      const { downloadUrl } = await generateExport({
        projectId,
        exportFormat: selectedFormat,
      });

      if (downloadUrl) {
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${project?.name || "export"}_${selectedFormat}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Export downloaded!");
      } else {
        toast.error("Export completed but download URL not available. Try again.");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (project === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const selectedFormatData = EXPORT_FORMATS.find((f) => f.id === selectedFormat)!;

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/project/${projectId}`)}
          size="sm"
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Project
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Package className="h-7 w-7 text-forge" />
          <h1 className="text-3xl font-bold">Export Animations</h1>
        </div>
        <p className="text-muted-foreground">Download your animations for your game engine</p>
        <Badge variant="secondary" className="mt-3 font-mono">
          Free Export
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Format Selection */}
        <div>
          <h2 className="text-xl font-bold mb-4">Export Format</h2>
          <div className="space-y-3">
            {EXPORT_FORMATS.map((format) => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={cn(
                  "w-full p-4 rounded-lg border transition-all text-left",
                  selectedFormat === format.id
                    ? "border-primary bg-primary/5"
                    : "border-border/60 hover:border-primary/50"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-bold mb-1">{format.name}</div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {format.description}
                    </div>
                    <div className="text-xs text-muted-foreground">{format.details}</div>
                  </div>
                  {selectedFormat === format.id && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <Button onClick={handleDownload} className="w-full mt-6" size="lg" disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Generating export..." : `Download ${selectedFormatData.name} Package`}
          </Button>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          {/* File Structure */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FolderTree className="h-4 w-4" />
                File Structure
              </CardTitle>
              <CardDescription>Preview of the exported package</CardDescription>
            </CardHeader>
            <CardContent>
              <FileTreeRenderer node={selectedFormatData.fileTree} level={0} />
            </CardContent>
          </Card>

          {/* Metadata Preview */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                Metadata JSON
              </CardTitle>
              <CardDescription>Animation metadata included in export</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <pre className="text-muted-foreground">
{`{
  "project": "${project.name}",
  "gameView": "${project.gameView || "side-scroller"}",
  "stylePack": "${project.stylePack || "pixel-art"}",
  "frameSize": {
    "width": ${project.frameSize?.width || 64},
    "height": ${project.frameSize?.height || 64}
  },
  "animations": [...]
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FileTreeRenderer({ node, level }: { node: FileTreeItem; level: number }) {
  const [isOpen, setIsOpen] = useState(level < 2);

  const getIcon = (icon: FileTreeItem["icon"]) => {
    switch (icon) {
      case "folder":
        return <FolderTree className="h-4 w-4 text-sky" />;
      case "png":
        return <Image className="h-4 w-4 text-moss" />;
      case "json":
        return <FileJson className="h-4 w-4 text-ember" />;
      case "meta":
      case "tres":
      case "csv":
        return <File className="h-4 w-4 text-forge" />;
    }
  };

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 py-1 hover:bg-muted/50 rounded w-full text-left"
          style={{ paddingLeft: `${level * 12}px` }}
        >
          <span className="text-xs text-muted-foreground">{isOpen ? "▼" : "▶"}</span>
          {getIcon(node.icon)}
          <span className="text-sm font-medium">{node.name}/</span>
        </button>
        {isOpen && node.children && (
          <div>
            {node.children.map((child, i) => (
              <FileTreeRenderer key={i} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 py-1"
      style={{ paddingLeft: `${level * 12 + 16}px` }}
    >
      {getIcon(node.icon)}
      <span className="text-sm text-muted-foreground font-mono">{node.name}</span>
    </div>
  );
}
