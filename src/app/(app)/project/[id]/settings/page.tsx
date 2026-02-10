"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Settings, Save, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { GAME_VIEWS, STYLE_PACKS, FRAME_SIZES } from "@/lib/constants";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as Id<"projects">;

  const project = useQuery(api.projects.get, { id: projectId });
  const updateProject = useMutation(api.projects.update);
  const removeProject = useMutation(api.projects.remove);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gameView, setGameView] = useState("side-scroller");
  const [stylePack, setStylePack] = useState("cozy");
  const [frameSize, setFrameSize] = useState("128");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Populate form when project loads
  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || "");
      setGameView(project.gameView || "side-scroller");
      setStylePack(project.stylePack || "cozy");
      if (project.frameSize) {
        setFrameSize(String(project.frameSize.width));
      }
    }
  }, [project]);

  if (project === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setIsSaving(true);
    try {
      const selectedFrame = FRAME_SIZES.find((f) => f.id === frameSize);
      await updateProject({
        id: projectId,
        name: name.trim(),
        description: description.trim() || undefined,
        gameView: gameView as "side-scroller" | "top-down-8dir" | "isometric-8dir",
        stylePack,
        frameSize: selectedFrame
          ? { width: selectedFrame.width, height: selectedFrame.height }
          : undefined,
      });
      toast.success("Project settings saved");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeProject({ id: projectId });
      toast.success("Project deleted");
      router.push("/dashboard");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete project");
      setIsDeleting(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-4 md:py-8 px-2 md:px-4 space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground" />
          <h1 className="text-2xl md:text-3xl font-bold">Project Settings</h1>
        </div>
        <p className="text-muted-foreground">Manage your project configuration</p>
      </div>

      {/* General Settings */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>Project name and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Project"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for your project"
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Generation Defaults */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Generation Defaults</CardTitle>
          <CardDescription>
            Default settings used when generating new content in this project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="game-view">Game View</Label>
            <Select value={gameView} onValueChange={setGameView}>
              <SelectTrigger id="game-view">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GAME_VIEWS.map((view) => (
                  <SelectItem key={view.id} value={view.id}>
                    {view.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Determines camera perspective and direction presets
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="style-pack">Style Pack</Label>
            <Select value={stylePack} onValueChange={setStylePack}>
              <SelectTrigger id="style-pack">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLE_PACKS.map((pack) => (
                  <SelectItem key={pack.id} value={pack.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: pack.color }}
                      />
                      <span>{pack.label}</span>
                      <span className="text-xs text-muted-foreground">
                        - {pack.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frame-size">Frame Size</Label>
            <Select value={frameSize} onValueChange={setFrameSize}>
              <SelectTrigger id="frame-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FRAME_SIZES.map((size) => (
                  <SelectItem key={size.id} value={size.id}>
                    <span className="font-mono">{size.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Size of individual sprite frames in pixels
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </>
        )}
      </Button>

      <Separator />

      {/* Danger Zone */}
      <Card className="border-red-500/30">
        <CardHeader>
          <CardTitle className="text-base text-red-500 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions for this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Delete this project</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete this project and all its scenes, characters, and exports
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-1.5 shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete &ldquo;{project.name}&rdquo;?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the project
                    and all associated scenes, characters, animations, and exports.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Project"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
